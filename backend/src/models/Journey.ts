import mongoose from "mongoose";

const journeySchema = new mongoose.Schema({
  source: String,
  destination: String,
  transport: String,
  buddyName: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Journey", journeySchema);