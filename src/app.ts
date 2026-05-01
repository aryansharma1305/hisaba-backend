import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes';
import transactionRoutes from './routes/transaction.routes';
import dashboardRoutes from './routes/dashboard.routes';
import insightRoutes from './routes/insight.routes';
import budgetRoutes from './routes/budget.routes';
import subscriptionRoutes from './routes/subscription.routes';
import seedRoutes from './routes/seed.routes';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth.middleware';

dotenv.config();

const app: Application = express();

const allowedOrigins = (process.env.CORS_ORIGINS || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// ── Middleware ─────────────────────────────────────────
app.use(cors({
  origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
  credentials: !allowedOrigins.includes('*'),
}));
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true, limit: '256kb' }));
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store');
  next();
});
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Rate Limiting ──────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

app.use(limiter);

// ── Health check ───────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Root route ──────────────────────────────────────────
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Hisaba backend is running.',
    health: '/health',
    apiBase: '/api',
  });
});

// ── API Routes ─────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/transactions', authMiddleware, transactionRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/insights', authMiddleware, insightRoutes);
app.use('/api/budgets', authMiddleware, budgetRoutes);
app.use('/api/subscriptions', authMiddleware, subscriptionRoutes);
app.use('/api/seed', authMiddleware, seedRoutes);

// ── 404 handler ────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler ───────────────────────────────
app.use(errorHandler);

export default app;
