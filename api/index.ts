import type { Request, Response } from 'express';
import app from '../server/src/app';
import { connectDB } from '../server/src/config/db';

/**
 * Serverless entrypoint for Vercel
 * Connects to MongoDB Atlas and routes requests through Express application
 */
export default async function handler(req: Request, res: Response) {
  try {
    await connectDB();
    return app(req, res);
  } catch (err: any) {
    console.error('Vercel API Handler Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error connecting to database',
      error: err.message,
    });
  }
}
