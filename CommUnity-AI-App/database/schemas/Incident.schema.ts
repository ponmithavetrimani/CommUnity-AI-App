import { Schema } from "mongoose";

export const IncidentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    journeyId: {
      type: Schema.Types.ObjectId,
      ref: "Journey",
    },

    type: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    severity: {
      type: String,
      enum: [
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
      ],
      default: "LOW",
    },

    location: {
      lat: Number,
      lng: Number,
    },
  },
  {
    timestamps: true,
  }
);