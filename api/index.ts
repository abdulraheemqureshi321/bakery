import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../server/src/app';
import { connectDB } from '../server/src/config/db';

/**
 * Serverless entrypoint for Vercel
 * Connects to MongoDB Atlas and routes requests through Express application
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB();
    return app(req as any, res as any);
  } catch (err: any) {
    console.error('Vercel API Handler Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error connecting to database',
      error: err.message,
    });
  }
}
