import { z } from 'zod';

export const createBudgetRequestSchema = z.object({
  category: z.string().min(1),
  monthlyLimit: z.number().positive(),
});

export const createBudgetSchema = createBudgetRequestSchema.extend({
  userId: z.string().min(1),
});

export type CreateBudgetRequestInput = z.infer<typeof createBudgetRequestSchema>;
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
