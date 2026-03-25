const mongoose = require("mongoose");

const apiTestSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    method: {
      type: String,
      required: true,
      enum: ["GET", "POST"],
    },
    requestHeaders: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    requestBody: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    responseTimeMs: {
      type: Number,
      required: true,
    },
    isSlow: {
      type: Boolean,
      default: false,
    },
    success: {
      type: Boolean,
      required: true,
    },
    responseData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    errorMessage: {
      type: String,
      default: "",
    },
    addedAsMonitored: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

apiTestSchema.index({ createdAt: -1 });
apiTestSchema.index({ statusCode: 1, success: 1 });

module.exports = mongoose.model("ApiTest", apiTestSchema);
