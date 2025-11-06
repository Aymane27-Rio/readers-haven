import dotenv from 'dotenv';
dotenv.config();

function required(name, fallback) {
  const val = process.env[name] ?? fallback;
  if (val === undefined || val === null || val === '') {
    throw new Error(`Missing required env: ${name}`);
  }
  return val;
}

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGO_URI: required('MONGO_URI', 'mongodb://localhost:27017/'),
  JWT_SECRET: required('JWT_SECRET'),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  OAUTH_CALLBACK_BASE: process.env.OAUTH_CALLBACK_BASE || 'http://localhost:5000',
  REDIS_URL: process.env.REDIS_URL || '',
};

export function isProd() { return config.NODE_ENV === 'production'; }
export function isDev() { return !isProd(); }
