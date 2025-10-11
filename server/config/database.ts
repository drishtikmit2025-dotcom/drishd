import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/drishti';

    // Set connection options with timeout
    const options = {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 5000,
    };

    await mongoose.connect(mongoURI, options);

    isConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.warn('⚠️  MongoDB connection failed - running in demo mode without database');
    console.warn('   To use full functionality, please set up MongoDB (see MONGODB_SETUP.md)');
    console.warn('   Error:', error.message);

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
