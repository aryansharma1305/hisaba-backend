import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { successResponse } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

/**
 * POST /api/seed
 * Generates realistic demo transactions, budgets, and subscriptions
 * for the authenticated user so all app screens show data immediately.
 */
export const seedData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const dayOfMonth = now.getDate();

    // ── Sample merchants by category ──────────────────────
    const merchantsByCategory: Record<string, { merchants: string[]; paymentModes: string[]; amountRange: [number, number] }> = {
      'Food & Dining': {
        merchants: ['Swiggy', 'Zomato', 'Dominos', 'McDonald\'s', 'Cafe Coffee Day', 'KFC', 'Pizza Hut', 'Starbucks'],
        paymentModes: ['UPI', 'Card', 'UPI'],
        amountRange: [120, 1800],
      },
      'Shopping': {
        merchants: ['Amazon', 'Flipkart', 'Myntra', 'Reliance Digital', 'Croma', 'Nykaa'],
        paymentModes: ['Card', 'UPI', 'Card'],
        amountRange: [500, 8000],
      },
      'Transport & Travel': {
        merchants: ['Uber', 'Ola', 'Rapido', 'Metro Card', 'Petrol Pump', 'IRCTC'],
        paymentModes: ['UPI', 'UPI', 'Cash'],
        amountRange: [50, 3000],
      },
      'Groceries': {
        merchants: ['BigBasket', 'Blinkit', 'Zepto', 'DMart', 'Spencer\'s', 'Reliance Fresh'],
        paymentModes: ['UPI', 'UPI', 'Cash'],
        amountRange: [200, 3500],
      },
      'Bills & Utilities': {
        merchants: ['Jio Recharge', 'Airtel Bill', 'Electricity Board', 'Water Bill', 'Gas Bill'],
        paymentModes: ['UPI', 'UPI', 'Bank Transfer'],
        amountRange: [200, 2500],
      },
      'Entertainment': {
        merchants: ['Netflix', 'Spotify', 'BookMyShow', 'Amazon Prime', 'Hotstar', 'PlayStation Store'],
        paymentModes: ['Card', 'UPI', 'Card'],
        amountRange: [149, 1500],
      },
      'Health & Pharmacy': {
        merchants: ['Apollo Pharmacy', 'MedPlus', '1mg', 'PharmEasy', 'Dr. Consultation'],
        paymentModes: ['UPI', 'Cash', 'Card'],
        amountRange: [100, 2000],
      },
    };

    const categories = Object.keys(merchantsByCategory);

    // ── Generate transactions ──────────────────────────────
    const transactions: any[] = [];

    // Generate 50-70 debit transactions spread across the current month
    const txCount = 50 + Math.floor(Math.random() * 20);
    for (let i = 0; i < txCount; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const config = merchantsByCategory[category];
      const merchant = config.merchants[Math.floor(Math.random() * config.merchants.length)];
      const paymentMode = config.paymentModes[Math.floor(Math.random() * config.paymentModes.length)];
      const [minAmt, maxAmt] = config.amountRange;
      const amount = Math.round((minAmt + Math.random() * (maxAmt - minAmt)) * 100) / 100;

      // Random day this month (up to today)
      const day = 1 + Math.floor(Math.random() * Math.min(dayOfMonth, 28));
      const hour = 7 + Math.floor(Math.random() * 15);
      const minute = Math.floor(Math.random() * 60);
      const txDate = new Date(year, month, day, hour, minute, 0);

      transactions.push({
        userId,
        merchantName: merchant,
        amount,
        type: 'debit' as const,
        category,
        paymentMode,
        transactionDate: txDate,
        source: 'manual',
      });
    }

    // Add 5-8 credit (income) transactions
    const incomeCount = 5 + Math.floor(Math.random() * 4);
    const incomeSources = [
      { merchant: 'Salary Credit', amount: 45000 + Math.floor(Math.random() * 30000) },
      { merchant: 'Freelance Payment', amount: 5000 + Math.floor(Math.random() * 15000) },
      { merchant: 'Cashback Reward', amount: 50 + Math.floor(Math.random() * 500) },
      { merchant: 'UPI Refund', amount: 100 + Math.floor(Math.random() * 2000) },
      { merchant: 'Interest Credit', amount: 200 + Math.floor(Math.random() * 1000) },
      { merchant: 'GPay Reward', amount: 10 + Math.floor(Math.random() * 100) },
      { merchant: 'Investment Returns', amount: 1000 + Math.floor(Math.random() * 5000) },
      { merchant: 'Commission', amount: 2000 + Math.floor(Math.random() * 8000) },
    ];
    for (let i = 0; i < Math.min(incomeCount, incomeSources.length); i++) {
      const income = incomeSources[i];
      const day = 1 + Math.floor(Math.random() * Math.min(dayOfMonth, 28));
      transactions.push({
        userId,
        merchantName: income.merchant,
        amount: income.amount,
        type: 'credit' as const,
        category: 'Income',
        paymentMode: 'Bank Transfer',
        transactionDate: new Date(year, month, day, 9, 0, 0),
        source: 'manual',
      });
    }

    // ── Insert transactions ────────────────────────────────
    const txResult = await prisma.transaction.createMany({
      data: transactions,
      skipDuplicates: true,
    });

    // ── Create budgets ─────────────────────────────────────
    const budgetCategories = ['Food & Dining', 'Shopping', 'Transport & Travel', 'Groceries', 'Entertainment'];
    const budgetLimits = [8000, 12000, 5000, 6000, 3000];
    for (let i = 0; i < budgetCategories.length; i++) {
      await prisma.budget.upsert({
        where: { userId_category: { userId, category: budgetCategories[i] } },
        update: { monthlyLimit: budgetLimits[i] },
        create: { userId, category: budgetCategories[i], monthlyLimit: budgetLimits[i] },
      });
    }

    // ── Create subscriptions ───────────────────────────────
    const subscriptions = [
      { merchantName: 'Netflix', amount: 649, billingCycle: 'monthly' as const },
      { merchantName: 'Spotify', amount: 119, billingCycle: 'monthly' as const },
      { merchantName: 'iCloud Storage', amount: 75, billingCycle: 'monthly' as const },
    ];
    for (const sub of subscriptions) {
      const nextBilling = new Date(year, month + 1, 1 + Math.floor(Math.random() * 15));
      await prisma.subscription.create({
        data: {
          userId,
          merchantName: sub.merchantName,
          amount: sub.amount,
          billingCycle: sub.billingCycle,
          nextBillingDate: nextBilling,
          status: 'active',
        },
      });
    }

    res.status(201).json(
      successResponse(
        {
          transactionsCreated: txResult.count,
          budgetsCreated: budgetCategories.length,
          subscriptionsCreated: subscriptions.length,
        },
        `Seeded ${txResult.count} transactions, ${budgetCategories.length} budgets, ${subscriptions.length} subscriptions`
      )
    );
  } catch (err) {
    next(err);
  }
};
