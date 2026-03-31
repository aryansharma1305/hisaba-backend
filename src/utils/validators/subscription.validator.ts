import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  merchantName: z.string().min(1, 'merchantName is required'),
  amount: z.number().positive('Amount must be positive'),
  billingCycle: z.enum(['monthly', 'yearly', 'weekly']),
  nextBillingDate: z.coerce.date(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
