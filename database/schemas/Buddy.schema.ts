import { Schema } from "mongoose";

export const BuddySchema = new Schema(
  {
    userA: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    userB: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    journeyId: {
      type: Schema.Types.ObjectId,
      ref: "Journey",
    },

    matchScore: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "ACCEPTED",
        "REJECTED",
      ],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);