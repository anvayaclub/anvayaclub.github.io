import { app } from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';

// Vercel Serverless Function entry point
export default async function handler(req: any, res: any) {
  try {
    await connectDB();
    return app(req, res);
  } catch (error: any) {
    console.error('Serverless function error:', error);
    res.status(500).json({ success: false, message: 'Serverless function execution failure' });
  }
}
