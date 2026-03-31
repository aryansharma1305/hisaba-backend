import prisma from '../lib/prisma';

export const getInsights = async (userId: string) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of this week
  startOfWeek.setHours(0, 0, 0, 0);

  // 1. Fetch transactions this month
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      transactionDate: { gte: startOfMonth },
    },
  });

  // Calculate Summary
  let totalSpent = 0;
  const categoryTotals: Record<string, number> = {};
  const merchantTotals: Record<string, number> = {};
  
  // Weekly trend setup
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyTrendMap: Record<string, number> = {};
  days.forEach(d => (weeklyTrendMap[d] = 0));

  transactions.forEach((tx: any) => {
    if (tx.type === 'debit') {
      const amt = Number(tx.amount);
      totalSpent += amt;

      // Category breakdown
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + amt;
      
      // Merchant totals
      merchantTotals[tx.merchantName] = (merchantTotals[tx.merchantName] || 0) + amt;

      // Weekly trend
      if (tx.transactionDate >= startOfWeek) {
        const dayStr = days[tx.transactionDate.getDay()];
        weeklyTrendMap[dayStr] += amt;
      }
    }
  });

  // Top Category
  const topCategory = Object.keys(categoryTotals).length > 0
    ? Object.keys(categoryTotals).reduce((a, b) => categoryTotals[a] > categoryTotals[b] ? a : b)
    : 'None';
  
  // Top Merchant
  const topMerchant = Object.keys(merchantTotals).length > 0
    ? Object.keys(merchantTotals).reduce((a, b) => merchantTotals[a] > merchantTotals[b] ? a : b)
    : 'Unknown';

  // Format Category Breakdown
  const categoryBreakdown = Object.keys(categoryTotals)
    .map((c) => ({ category: c, amount: categoryTotals[c] }))
    .sort((a, b) => b.amount - a.amount);

  // Format Weekly Trend
  const weeklyTrend = days.map((day) => ({ day, amount: weeklyTrendMap[day] }));

  // Generate dynamic insights
  const generatedInsights = [];
  
  if (topMerchant !== 'Unknown' && merchantTotals[topMerchant] > 0) {
    generatedInsights.push({
      id: '1',
      type: 'top_merchant',
      title: `${topMerchant} is your top expense`,
      titleHighlight: `${topMerchant}`,
      description: `You spent ₹${merchantTotals[topMerchant].toFixed(0)} on ${topMerchant} this month`,
      severity: 'info',
      icon: 'restaurant',     // Matching the FE UI icons available
      iconColor: '#FF6E84',
      iconBg: 'rgba(255,110,132,0.15)',
      borderColor: '#FF6E84',
    });
  }

  if (topCategory !== 'None' && totalSpent > 0 && categoryTotals[topCategory] > totalSpent * 0.3) {
    generatedInsights.push({
      id: '2',
      type: 'saving_opportunity',
      title: `High spending in ${topCategory}`,
      titleHighlight: `${topCategory}`,
      description: `${topCategory} makes up ${Math.round((categoryTotals[topCategory]/totalSpent)*100)}% of your expenses`,
      severity: 'warning',
      icon: 'warning',
      iconColor: '#F59E0B',
      iconBg: 'rgba(245,158,11,0.15)',
      borderColor: '#F59E0B',
    });
  }

  // Fallback insight if empty
  if (generatedInsights.length === 0) {
    generatedInsights.push({
      id: '0',
      type: 'info',
      title: 'Keep tracking your expenses',
      titleHighlight: 'tracking',
      description: 'More insights will appear as you spend',
      severity: 'info',
      icon: 'analytics',
      iconColor: '#A7A5FF',
      iconBg: 'rgba(167,165,255,0.15)',
      borderColor: '#645efb',
    });
  }

  return {
    summary: {
      totalSpent,
      topCategory,
      topMerchant,
    },
    insights: generatedInsights,
    categoryBreakdown,
    weeklyTrend,
  };
};
