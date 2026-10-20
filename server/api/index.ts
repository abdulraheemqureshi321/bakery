import type { Request, Response } from 'express';
import app from '../src/app';
import { connectDB } from '../src/config/db';

/**
 * Serverless entrypoint when deploying the server directory directly on Vercel
 */
export default async function handler(req: Request, res: Response) {
  try {
    await connectDB();
    return app(req, res);
  } catch (err: any) {
    console.error('Vercel Server API Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to connect to database',
      error: err.message,
    });
  }
}
