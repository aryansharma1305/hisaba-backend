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

app.get('/privacy', (_req: Request, res: Response) => {
  res.type('html').send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>HiSaba Privacy Policy</title>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0d0d14; color: #f8f5fd; }
    main { max-width: 760px; margin: 0 auto; padding: 48px 22px 72px; }
    h1 { font-size: 38px; line-height: 1.1; margin: 0 0 12px; }
    h2 { margin-top: 34px; color: #ffffff; }
    p, li { color: #c8c5d4; line-height: 1.65; font-size: 16px; }
    a { color: #8a86fe; }
    .muted { color: #8e8c99; }
  </style>
</head>
<body>
  <main>
    <h1>HiSaba Privacy Policy</h1>
    <p class="muted">Last updated: May 29, 2026</p>

    <h2>What HiSaba reads</h2>
    <p>HiSaba reads transaction SMS messages from bank and payment senders after you grant SMS permission. We use this only to identify financial transactions.</p>

    <h2>What HiSaba extracts</h2>
    <p>From eligible transaction SMS messages, HiSaba extracts structured fields such as amount, merchant, transaction date, transaction type, category, and payment mode.</p>

    <h2>What HiSaba does not store</h2>
    <p>HiSaba does not save or send the full SMS body. Raw SMS text is not included in exports, audit logs, or backend sync payloads.</p>

    <h2>Where your data goes</h2>
    <p>Structured transaction data is synced to the HiSaba backend hosted on Fly.io in the Netherlands region. This sync powers your dashboard, insights, budgets, and account recovery.</p>

    <h2>How long data is kept</h2>
    <p>Your account data is kept while your HiSaba account is active. You can delete your account from the app profile screen, which removes your backend account and associated financial data.</p>

    <h2>Third parties</h2>
    <p>HiSaba uses infrastructure providers including Fly.io for backend hosting and Neon/PostgreSQL for database storage. We do not sell your personal data.</p>

    <h2>Deletion requests</h2>
    <p>You can delete your account in the app from Profile → Delete my account. You may also contact us at <a href="mailto:support@hisaba.app">support@hisaba.app</a>.</p>

    <h2>Contact</h2>
    <p>Questions: <a href="mailto:support@hisaba.app">support@hisaba.app</a></p>
  </main>
</body>
</html>`);
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
