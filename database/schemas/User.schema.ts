import { Schema } from "mongoose";

export const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
    },

    gender: {
      type: String,
      default: "female",
    },

    trustScore: {
      type: Number,
      default: 100,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    emergencyContacts: [
      {
        name: String,
        phone: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);