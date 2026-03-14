const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
      unique: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Category", categorySchema);
