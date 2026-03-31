import prisma from '../lib/prisma';

export const getDashboardSummary = async (userId: string) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [allTx, lastMonthTx, budgets, subscriptions] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
    prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: { gte: startOfLastMonth, lte: endOfLastMonth },
        type: 'debit',
      },
    }),
    prisma.budget.findMany({ where: { userId } }),
    prisma.subscription.findMany({ where: { userId, status: 'active' } }),
  ]);

  const totalSpent = allTx
    .filter((t: { type: string }) => t.type === 'debit')
    .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);

  const totalIncome = allTx
    .filter((t: { type: string }) => t.type === 'credit')
    .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);

  const lastMonthSpent = lastMonthTx.reduce(
    (sum: number, t: { amount: number }) => sum + t.amount, 0
  );

  // smartSaved: how much less you spent vs last month (positive = saved more)
  const smartSaved = Math.max(lastMonthSpent - totalSpent, 0);

  // Spending by category
  const byCategory: Record<string, number> = {};
  allTx
    .filter((t: { type: string }) => t.type === 'debit')
    .forEach((t: { category: string; amount: number }) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });

  const daysInMonth = endOfMonth.getDate();
  const daysPassed = now.getDate();
  const dailyAverage = daysPassed > 0 ? totalSpent / daysPassed : 0;

  // Budget alerts
  const budgetAlerts = budgets.map((b: { category: string; monthlyLimit: number }) => {
    const spent = byCategory[b.category] || 0;
    const percentage = (spent / b.monthlyLimit) * 100;
    return {
      category: b.category,
      limit: b.monthlyLimit,
      spent,
      percentage: parseFloat(percentage.toFixed(1)),
      isOverBudget: spent > b.monthlyLimit,
    };
  });

  const totalSubscriptionCost = subscriptions.reduce(
    (s: number, sub: { amount: number }) => s + sub.amount,
    0
  );

  return {
    month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
    totalSpent,
    totalIncome,
    smartSaved: parseFloat(smartSaved.toFixed(2)),
    dailyAverage: parseFloat(dailyAverage.toFixed(2)),
    daysInMonth,
    daysPassed,
    byCategory,
    budgetAlerts,
    activeSubscriptions: subscriptions.length,
    totalSubscriptionCost,
    transactionCount: allTx.length,
  };
};
