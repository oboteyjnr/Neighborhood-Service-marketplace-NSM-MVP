const mongoose = require("mongoose");
const ServiceRequest = require("../models/ServiceRequest");
const Category = require("../models/Category");
const User = require("../models/User");
const Quote = require("../models/Quote");
const asyncHandler = require("../utils/asyncHandler");
const { REQUEST_STATUS, USER_ROLES } = require("../utils/constants");

const ALLOWED_TRANSITIONS = {
  [REQUEST_STATUS.OPEN]: [REQUEST_STATUS.QUOTED, REQUEST_STATUS.CANCELLED],
  [REQUEST_STATUS.QUOTED]: [REQUEST_STATUS.OPEN, REQUEST_STATUS.CANCELLED],
  [REQUEST_STATUS.ASSIGNED]: [REQUEST_STATUS.COMPLETED, REQUEST_STATUS.CANCELLED],
  [REQUEST_STATUS.COMPLETED]: [],
  [REQUEST_STATUS.CANCELLED]: []
};

const createRequest = asyncHandler(async (req, res) => {
  const { title, description, categoryId, location, providerId } = req.body;

  if (!title || !description || !categoryId || !location || !providerId) {
    return res.status(400).json({ message: "title, description, categoryId, location and providerId are required" });
  }

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({ message: "Invalid categoryId" });
  }

  if (!mongoose.Types.ObjectId.isValid(providerId)) {
    return res.status(400).json({ message: "Invalid providerId" });
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const provider = await User.findById(providerId);
  if (!provider || provider.role !== USER_ROLES.PROVIDER) {
    return res.status(404).json({ message: "Provider not found" });
  }

  const serviceRequest = await ServiceRequest.create({
    title,
    description,
    categoryId,
    location,
    residentId: req.user.id,
    status: REQUEST_STATUS.ASSIGNED,
    assignedProviderId: providerId
  });

  return res.status(201).json({ serviceRequest });
});

const listRequests = asyncHandler(async (req, res) => {
  const { status, categoryId, q } = req.query;
  const filter = {};

  if (status) {
    if (!Object.values(REQUEST_STATUS).includes(status)) {
      return res.status(400).json({ message: "Invalid status filter" });
    }
    filter.status = status;
  }

  if (categoryId) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid categoryId filter" });
    }
    filter.categoryId = categoryId;
  }

  if (q && String(q).trim()) {
    filter.$text = { $search: String(q).trim() };
  }

  const requests = await ServiceRequest.find(filter)
    .populate("categoryId", "name")
    .populate("assignedProviderId", "name email")
    .sort({ createdAt: -1 });

  return res.status(200).json({ requests });
});

const getRequestById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid request id" });
  }

  const request = await ServiceRequest.findById(id)
    .populate("categoryId", "name")
    .populate("assignedProviderId", "name email");
  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  return res.status(200).json({ request });
});

const updateRequestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid request id" });
  }

  if (!status || !Object.values(REQUEST_STATUS).includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const request = await ServiceRequest.findById(id);
  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  if (String(request.residentId) !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const allowedNext = ALLOWED_TRANSITIONS[request.status] || [];
  if (!allowedNext.includes(status)) {
    return res.status(400).json({ message: `Invalid status transition from ${request.status} to ${status}` });
  }

  request.status = status;
  await request.save();

  return res.status(200).json({ request });
});

const getRequestQuotes = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid request id" });
  }

  const request = await ServiceRequest.findById(id);
  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  if (req.user.role === USER_ROLES.RESIDENT && String(request.residentId) !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const quoteFilter = { requestId: id };
  if (req.user.role === USER_ROLES.PROVIDER) {
    quoteFilter.providerId = req.user.id;
  }

  const quotes = await Quote.find(quoteFilter)
    .populate("providerId", "name email")
    .sort({ createdAt: -1 });

  return res.status(200).json({ quotes });
});

module.exports = {
  createRequest,
  listRequests,
  getRequestById,
  updateRequestStatus,
  getRequestQuotes
};
