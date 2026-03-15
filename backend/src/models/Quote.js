const mongoose = require("mongoose");
const { QUOTE_STATUS } = require("../utils/constants");

const quoteSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: true
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 1,
      max: 10000000
    },
    daysToComplete: {
      type: Number,
      required: true,
      min: 1,
      max: 365
    },
    message: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    status: {
      type: String,
      enum: Object.values(QUOTE_STATUS),
      default: QUOTE_STATUS.PENDING
    }
  },
  {
    timestamps: true
  }
);

quoteSchema.index({ requestId: 1 });
quoteSchema.index({ providerId: 1 });
quoteSchema.index({ providerId: 1, requestId: 1 }, { unique: true });
quoteSchema.index(
  { requestId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: QUOTE_STATUS.ACCEPTED }
  }
);

module.exports = mongoose.model("Quote", quoteSchema);
