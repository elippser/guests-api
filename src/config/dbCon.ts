import mongoose from "mongoose";
import { logger } from "../utils/logs/logger";

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.error("MONGODB_URI is not defined in environment variables");
    throw new Error("MONGODB_URI is not defined");
  }

  try {
    await mongoose.connect(uri);
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    throw error;
  }

  mongoose.connection.on("connected", () => {
    logger.info("Mongoose connected to MongoDB");
  });

  mongoose.connection.on("error", (err) => {
    logger.error("Mongoose connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("Mongoose disconnected from MongoDB");
  });
}
