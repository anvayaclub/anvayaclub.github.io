import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';

dotenv.config();

export const app = express();

// Configure CORS
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || origin === allowedOrigin || origin.endsWith('.github.io') || origin.includes('localhost')) {
        callback(null, true);
      } else {
        callback(null, true); // Dev-friendly permissive CORS
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploads folder statically
const uploadDir = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadDir));

// Serve public directory if needed
const publicDir = path.resolve(process.cwd(), 'public');
app.use(express.static(publicDir));

// API routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    app: 'Anvaya Cultural Committee API',
    institution: 'Kalpataru Institute of Technology, Tiptur',
    timestamp: new Date().toISOString(),
  });
});

// Global 404 handler for API
app.use('/api/*', (_req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

// Error handling middleware (ensures all errors return JSON instead of HTML error pages)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
  });
});
