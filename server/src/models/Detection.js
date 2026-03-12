const mongoose = require("mongoose");

const DetectionSchema = new mongoose.Schema(
  {
    cameraId: { type: String, default: "default" },
    cameraName: { type: String, default: "" },
    peopleCount: { type: Number, required: true },
    litterCount: { type: Number, required: true },
    crowdLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], required: true },
    meta: { type: Object, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Detection", DetectionSchema);

