import mongoose from "mongoose";

const IncidentSchema = new mongoose.Schema(
  {
    journeyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journey",
    },

    riskLevel: {
      type: String,
      enum: [
        "LOW",
        "MEDIUM",
        "HIGH",
      ],
    },

    description: String,

    location: {
      latitude: Number,
      longitude: Number,
    },

    resolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "Incident",
  IncidentSchema
);