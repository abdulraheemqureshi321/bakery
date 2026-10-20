import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/app';
import { connectDB } from '../src/config/db';

/**
 * Serverless entrypoint when deploying the server directory directly on Vercel
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB();
    return app(req as any, res as any);
  } catch (err: any) {
    console.error('Vercel Server API Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to connect to database',
      error: err.message,
    });
  }
}
