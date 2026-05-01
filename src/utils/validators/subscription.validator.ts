import { z } from 'zod';

export const createSubscriptionRequestSchema = z.object({
  merchantName: z.string().min(1, 'merchantName is required'),
  amount: z.number().positive('Amount must be positive'),
  billingCycle: z.enum(['monthly', 'yearly', 'weekly']),
  nextBillingDate: z.coerce.date(),
});

export const createSubscriptionSchema = createSubscriptionRequestSchema.extend({
  userId: z.string().min(1, 'userId is required'),
});

export type CreateSubscriptionRequestInput = z.infer<typeof createSubscriptionRequestSchema>;
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
