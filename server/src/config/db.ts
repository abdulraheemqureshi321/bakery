import mongoose from 'mongoose';
import dns from 'dns';
import env from './env';

// Fix Windows SRV DNS resolution for MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Use system default if setting custom servers is restricted
}

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
