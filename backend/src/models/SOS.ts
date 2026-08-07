import mongoose from "mongoose";

const sosSchema = new mongoose.Schema({
  userId: String,
  location: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("SOS", sosSchema);