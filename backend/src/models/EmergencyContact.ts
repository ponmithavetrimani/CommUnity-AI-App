import mongoose from "mongoose";

const EmergencyContactSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      name: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      relationship: String,
    },
    { timestamps: true }
  );

export default mongoose.model(
  "EmergencyContact",
  EmergencyContactSchema
);