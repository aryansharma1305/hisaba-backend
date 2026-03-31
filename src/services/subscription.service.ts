import prisma from '../lib/prisma';
import { CreateSubscriptionInput } from '../utils/validators/subscription.validator';

export const getSubscriptions = async (userId: string) => {
  return prisma.subscription.findMany({
    where: { userId },
    orderBy: { nextBillingDate: 'asc' },
  });
};

export const createSubscription = async (data: CreateSubscriptionInput) => {
  return prisma.subscription.create({
    data: {
      ...data,
      status: 'active',
    },
  });
};

export const cancelSubscription = async (id: string, userId: string) => {
  return prisma.subscription.updateMany({
    where: { id, userId },
    data: { status: 'cancelled' },
  });
};
