import mongoose from "mongoose";

export const connectMongoDB = async () => {
  try {
    const uri =
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/community-ai";

    await mongoose.connect(uri);

    console.log("MongoDB Connected");
  } catch (error) {
    console.error(
      "MongoDB Connection Error:",
      error
    );

    process.exit(1);
  }
};