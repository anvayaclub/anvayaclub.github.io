import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/anvaya';

  try {
    mongoose.set('strictQuery', false);
    
    // Set a short server selection timeout so local startup doesn't hang indefinitely if mongo is not running
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
    });

    isConnected = true;
    console.log(`[Database] Successfully connected to MongoDB at ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')}`);
    return true;
  } catch (error: any) {
    console.warn(`[Database] Notice: MongoDB connection failed (${error.message}).`);
    console.warn(`[Database] Operating in Standalone Resilient Mode. Provide valid MONGODB_URI in .env to persist to MongoDB Atlas.`);
    isConnected = false;
    return false;
  }
};

export const isDbConnected = (): boolean => isConnected;
