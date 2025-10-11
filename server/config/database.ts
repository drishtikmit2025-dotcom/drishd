import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) throw new Error("MongoDB URI not defined in environment variables");

    // Connect without deprecated options
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // 5s timeout
      connectTimeoutMS: 5000,
    });

    isConnected = true;
    console.log("✅ MongoDB connected successfully");
  } catch (err: any) {
    console.error("❌ MongoDB connection failed:", err.message);
    isConnected = false;
  }
};

// Helper to check connection
export const isMongoConnected = () => isConnected;

// Handle app termination
process.on("SIGINT", async () => {
  if (isConnected) {
    await mongoose.connection.close();
    console.log("Mongoose connection closed through app termination");
  }
  process.exit(0);
});

export default connectDB;
