import express from 'express';
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

// Health check
app.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, message: 'SoulTalk Pastry API is running' });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1', publicRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
