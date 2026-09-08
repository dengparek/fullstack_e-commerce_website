const mongoose = require("mongoose");
import { NODE_ENV, MONGO_URI } from "../config/env";

export const connectDB = async () => {
  if (!MONGO_URI) {
    console.error("MONGO_URI is not defined in the environment variables");
    process.exit(1);
  }
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(MONGO_URI, {
      dbName:
        NODE_ENV === "production" ? "sub_tracker__prod" : "sub_tracker__dev",
      autoIndex: NODE_ENV !== "production",
    });

    console.log(`MongoDB connected in (${NODE_ENV}) mode`);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};
