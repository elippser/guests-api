import mongoose from "mongoose";
import { logger } from "../logger";

let connectPromise: Promise<void> | null = null;
let listenersAttached = false;

function attachConnectionListeners(): void {
  if (listenersAttached) {
    return;
  }
  listenersAttached = true;

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

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.error("MONGODB_URI is not defined in environment variables");
    throw new Error("MONGODB_URI is not defined");
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectPromise) {
    attachConnectionListeners();
    connectPromise = (async () => {
      try {
        await mongoose.connect(uri);
        logger.info("MongoDB connected successfully");
      } catch (error) {
        connectPromise = null;
        logger.error("MongoDB connection error:", error);
        throw error;
      }
    })();
  }

  await connectPromise;
}
