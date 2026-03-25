const mongoose = require("mongoose");

const monitoredApiSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    method: {
      type: String,
      required: true,
      enum: ["GET", "POST"],
    },
    headers: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    body: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MonitoredApi", monitoredApiSchema);
