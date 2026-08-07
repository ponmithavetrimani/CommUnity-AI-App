import mongoose from "mongoose";
import User from "../../../backend/src/models/User";
import Journey from "../../../backend/src/models/Journey";
export class MongoDBTool {
  static async findTravelBuddies(
    source: string,
    destination: string
  ) {
    return await Journey.find({
      source,
      destination,
      status: "ACTIVE",
    }).populate("userId");
  }

  static async getUser(userId: string) {
    return await User.findById(userId);
  }

  static async saveIncident(data: any) {
    const collection =
      mongoose.connection.collection(
        "incidents"
      );

    return await collection.insertOne(data);
  }

  static async updateTrustScore(
    userId: string,
    score: number
  ) {
    return await User.findByIdAndUpdate(
      userId,
      {
        trustScore: score,
      },
      { new: true }
    );
  }
}