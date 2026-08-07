import mongoose from "mongoose";

const TrackingSchema = new mongoose.Schema(
  {
    journeyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journey",
      required: true,
    },

    latitude: Number,

    longitude: Number,

    speed: Number,

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "Tracking",
  TrackingSchema
);