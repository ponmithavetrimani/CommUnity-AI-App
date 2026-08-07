import mongoose from "mongoose";

const buddySchema = new mongoose.Schema({
  name: String,
  trustScore: Number,
  safeTrips: Number,
  verified: Boolean,
});

export default mongoose.model("Buddy", buddySchema);