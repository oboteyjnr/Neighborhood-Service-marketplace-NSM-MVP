const mongoose = require("mongoose");
const Quote = require("../models/Quote");
const ServiceRequest = require("../models/ServiceRequest");
const asyncHandler = require("../utils/asyncHandler");
const { QUOTE_STATUS, REQUEST_STATUS, USER_ROLES } = require("../utils/constants");

const OPEN_FOR_QUOTES = [REQUEST_STATUS.OPEN, REQUEST_STATUS.QUOTED];
const TERMINAL_REQUEST_STATES = [REQUEST_STATUS.ASSIGNED, REQUEST_STATUS.COMPLETED, REQUEST_STATUS.CANCELLED];

const submitQuote = asyncHandler(async (req, res) => {
  const { requestId, price, daysToComplete, message } = req.body;

  if (!requestId || price === undefined || daysToComplete === undefined) {
    return res.status(400).json({ message: "requestId, price and daysToComplete are required" });
  }

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    return res.status(400).json({ message: "Invalid requestId" });
  }

  const numericPrice = Number(price);
  const numericDays = Number(daysToComplete);
  if (!Number.isFinite(numericPrice) || numericPrice < 1 || numericPrice > 10000000) {
    return res.status(400).json({ message: "price must be between 1 and 10000000" });
  }

  if (!Number.isInteger(numericDays) || numericDays < 1 || numericDays > 365) {
    return res.status(400).json({ message: "daysToComplete must be an integer between 1 and 365" });
  }

  const serviceRequest = await ServiceRequest.findById(requestId);
  if (!serviceRequest) {
    return res.status(404).json({ message: "Request not found" });
  }

  if (!OPEN_FOR_QUOTES.includes(serviceRequest.status)) {
    return res.status(400).json({ message: "Quotes can only be submitted for open or quoted requests" });
  }

  try {
    const quote = await Quote.create({
      requestId,
      providerId: req.user.id,
      price: numericPrice,
      daysToComplete: numericDays,
      message,
      status: QUOTE_STATUS.PENDING
    });

    if (serviceRequest.status === REQUEST_STATUS.OPEN) {
      serviceRequest.status = REQUEST_STATUS.QUOTED;
      await serviceRequest.save();
    }

    return res.status(201).json({ quote });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "You have already quoted this request" });
    }

    throw error;
  }
});

const getMyQuotes = asyncHandler(async (req, res) => {
  const quotes = await Quote.find({ providerId: req.user.id })
    .populate("requestId", "title status categoryId")
    .sort({ createdAt: -1 });

  return res.status(200).json({ quotes });
});

const getMyAssignedQuotes = asyncHandler(async (req, res) => {
  const acceptedQuotes = await Quote.find({
    providerId: req.user.id,
    status: QUOTE_STATUS.ACCEPTED
  })
    .populate("requestId", "title status categoryId location")
    .sort({ updatedAt: -1 });

  const directlyAssignedRequests = await ServiceRequest.find({
    assignedProviderId: req.user.id,
    assignedQuoteId: null,
    status: REQUEST_STATUS.ASSIGNED
  })
    .populate("categoryId", "name")
    .sort({ updatedAt: -1 });

  const directAssignmentsAsQuotes = directlyAssignedRequests.map((request) => ({
    _id: `direct-${request._id}`,
    requestId: {
      _id: request._id,
      title: request.title,
      status: request.status,
      categoryId: request.categoryId,
      location: request.location
    },
    providerId: req.user.id,
    price: 0,
    daysToComplete: 0,
    message: "Assigned directly by resident at request creation",
    status: QUOTE_STATUS.ACCEPTED,
    assignmentSource: "direct_assignment",
    createdAt: request.createdAt,
    updatedAt: request.updatedAt
  }));

  const acceptedWithSource = acceptedQuotes.map((quote) => ({
    ...quote.toObject(),
    assignmentSource: "accepted_quote"
  }));

  const quotes = [...acceptedWithSource, ...directAssignmentsAsQuotes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return res.status(200).json({ quotes });
});

const getQuotesByRequestId = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    return res.status(400).json({ message: "Invalid requestId" });
  }

  const serviceRequest = await ServiceRequest.findById(requestId);
  if (!serviceRequest) {
    return res.status(404).json({ message: "Request not found" });
  }

  if (req.user.role === USER_ROLES.RESIDENT && String(serviceRequest.residentId) !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const filter = { requestId };
  if (req.user.role === USER_ROLES.PROVIDER) {
    filter.providerId = req.user.id;
  }

  const quotes = await Quote.find(filter)
    .populate("providerId", "name email")
    .sort({ createdAt: -1 });

  return res.status(200).json({ quotes });
});

const acceptQuote = asyncHandler(async (req, res) => {
  const { quoteId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(quoteId)) {
    return res.status(400).json({ message: "Invalid quoteId" });
  }

  const quote = await Quote.findById(quoteId);
  if (!quote) {
    return res.status(404).json({ message: "Quote not found" });
  }

  const serviceRequest = await ServiceRequest.findById(quote.requestId);
  if (!serviceRequest) {
    return res.status(404).json({ message: "Request not found" });
  }

  if (String(serviceRequest.residentId) !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (quote.status === QUOTE_STATUS.ACCEPTED) {
    return res.status(409).json({ message: "Quote already accepted" });
  }

  if (TERMINAL_REQUEST_STATES.includes(serviceRequest.status)) {
    return res.status(400).json({ message: "Request no longer accepts quote acceptance" });
  }

  try {
    const updated = await Quote.findOneAndUpdate(
      {
        _id: quoteId,
        status: QUOTE_STATUS.PENDING
      },
      {
        $set: { status: QUOTE_STATUS.ACCEPTED }
      },
      { new: true }
    );

    if (!updated) {
      const latestQuote = await Quote.findById(quoteId);
      if (latestQuote?.status === QUOTE_STATUS.ACCEPTED) {
        return res.status(409).json({ message: "Quote already accepted" });
      }

      return res.status(400).json({ message: "Only pending quotes can be accepted" });
    }

    await Quote.updateMany(
      {
        requestId: quote.requestId,
        _id: { $ne: quoteId },
        status: { $ne: QUOTE_STATUS.REJECTED }
      },
      { $set: { status: QUOTE_STATUS.REJECTED } }
    );

    await ServiceRequest.updateOne(
      { _id: quote.requestId },
      {
        $set: {
          status: REQUEST_STATUS.ASSIGNED,
          assignedQuoteId: quoteId
        }
      }
    );

    return res.status(200).json({ quote: updated, message: "Quote accepted" });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Another quote has already been accepted for this request" });
    }
    throw error;
  }
});

module.exports = {
  submitQuote,
  getMyQuotes,
  getMyAssignedQuotes,
  getQuotesByRequestId,
  acceptQuote
};
