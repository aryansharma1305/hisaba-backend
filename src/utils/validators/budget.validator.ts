import { z } from 'zod';

export const createBudgetSchema = z.object({
  userId: z.string().min(1),
  category: z.string().min(1),
  monthlyLimit: z.number().positive(),
});

export const createSubscriptionSchema = z.object({
  userId: z.string().min(1),
  merchantName: z.string().min(1),
  amount: z.number().positive(),
  billingCycle: z.enum(['monthly', 'yearly', 'weekly']),
  nextBillingDate: z.string().datetime(),
  status: z.enum(['active', 'paused', 'cancelled']).default('active'),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
