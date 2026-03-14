const mongoose = require("mongoose");
const { REQUEST_STATUS } = require("../utils/constants");

const serviceRequestSchema = new mongoose.Schema(
  {
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000
    },
    location: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200
    },
    status: {
      type: String,
      enum: Object.values(REQUEST_STATUS),
      default: REQUEST_STATUS.OPEN,
      index: true
    },
    assignedQuoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quote",
      default: null
    },
    assignedProviderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    }
  },
  {
    timestamps: true
  }
);

serviceRequestSchema.index({ status: 1, categoryId: 1 });
serviceRequestSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
