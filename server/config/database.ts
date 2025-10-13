import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  try {
    // Support several common env var names for different hosts/platforms
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/drishti';

    // Log which URI is being used (mask credentials)
    const safeUri = (() => {
      try {
        if (!mongoURI) return 'none';
        return mongoURI.replace(/:(?:[^@]+)@/, ':***@');
      } catch {
        return mongoURI;
      }
    })();

    console.log(`Attempting MongoDB connect to: ${safeUri}`);

    // Set connection options with timeout
    const options = {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 5000,
    };

    await mongoose.connect(mongoURI, options);

    isConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (error: any) {
    console.warn('⚠️  MongoDB connection failed - running in demo mode without database');
    console.warn('   To use full functionality, please set up MongoDB (see MONGODB_SETUP.md) or configure MONGODB_URI');
    console.warn('   Error:', error?.message || error);

    // If running in production on Render or similar, remind user to set env var
    if (process.env.NODE_ENV === 'production') {
      console.warn('   If deploying to Render, add an environment variable named MONGODB_URI in your service settings (Dashboard → Environment → Add Environment Variable)');
    }

    // Don't exit the process, let the app run without MongoDB
    isConnected = false;
  }
};

// Check if MongoDB is connected
export const isMongoConnected = () => isConnected;

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Handle app termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed through app termination');
  process.exit(0);
});

export default connectDB;
