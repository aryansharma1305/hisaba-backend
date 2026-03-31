import prisma from '../lib/prisma';
import { CreateBudgetInput } from '../utils/validators/budget.validator';

export const getBudgets = async (userId: string) => {
  return prisma.budget.findMany({ where: { userId }, orderBy: { category: 'asc' } });
};

export const createBudget = async (data: CreateBudgetInput) => {
  return prisma.budget.upsert({
    where: { userId_category: { userId: data.userId, category: data.category } },
    update: { monthlyLimit: data.monthlyLimit },
    create: data,
  });
};
