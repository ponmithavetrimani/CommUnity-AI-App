import { Schema } from "mongoose";

export const JourneySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    source: {
      type: String,
      required: true,
    },

    destination: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "ACTIVE",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "ACTIVE",
    },

    riskLevel: {
      type: String,
      default: "LOW",
    },

    buddyId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    startedAt: Date,

    endedAt: Date,
  },
  {
    timestamps: true,
  }
);