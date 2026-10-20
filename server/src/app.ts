import express from 'express';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import env from './config/env';
import { sanitizeNoSql } from './middleware/sanitize';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import publicRoutes from './routes/public';
import orderRoutes from './routes/order';

const app = express();

// Security
app.use(helmet());
const allowedOrigins = Array.from(
  new Set([env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'])
);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // in dev allow origin
    },
    credentials: true,
  })
);

// Global rate limiter
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    skip: () => process.env.NODE_ENV !== 'production',
    message: { success: false, message: 'Too many requests, please try again later.' },
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sanitizeNoSql);

// Health check & API root
app.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, message: 'SoulTalk Pastry API is running' });
});

app.get('/api', (_req, res) => {
  res.json({
    success: true,
    name: 'SoulTalk Pastry API Server',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
      catalog: '/api/v1/products',
    },
  });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1', publicRoutes);

// Static frontend serving (if client build is co-located)
const possibleDistPaths = [
  path.join(process.cwd(), 'client/dist'),
  path.join(process.cwd(), 'dist'),
  path.join(__dirname, '../../client/dist'),
  path.join(__dirname, '../client/dist'),
];
const clientDistPath = possibleDistPaths.find((p) => fs.existsSync(p));

if (clientDistPath) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // If pure API server deployment
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      name: 'SoulTalk Pastry API Server',
      status: 'online',
      version: '1.0.0',
      message: 'SoulTalk Pastry API is operational',
      endpoints: {
        health: '/api/v1/health',
        products: '/api/v1/products',
        categories: '/api/v1/categories',
      },
    });
  });
}

// Error handler (must be last)
app.use(errorHandler);

export default app;
