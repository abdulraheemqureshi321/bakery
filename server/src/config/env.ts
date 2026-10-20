import dotenv from 'dotenv';
dotenv.config();

const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/soultalk_pastry',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'dev-access-secret',
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET ||
    (process.env.JWT_SECRET ? `${process.env.JWT_SECRET}_refresh` : 'dev-refresh-secret'),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '7d',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
};

export default env;
