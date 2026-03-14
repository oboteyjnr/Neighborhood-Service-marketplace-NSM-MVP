const mongoose = require("mongoose");
const { USER_ROLES } = require("../utils/constants");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
