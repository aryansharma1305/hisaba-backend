import { z } from 'zod';

export const createTransactionSchema = z.object({
  userId: z.string().min(1),
  merchantName: z.string().min(1),
  amount: z.number().positive(),
  type: z.enum(['debit', 'credit']),
  category: z.string().min(1),
  paymentMode: z.string().min(1),
  transactionDate: z.string().datetime(),
  source: z.enum(['sms', 'manual']).default('manual'),
  referenceId: z.string().optional(),
  notes: z.string().optional(),
});

export const updateTransactionSchema = z.object({
  merchantName: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  type: z.enum(['debit', 'credit']).optional(),
  category: z.string().min(1).optional(),
  paymentMode: z.string().min(1).optional(),
  transactionDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const listTransactionSchema = z.object({
  userId: z.string().min(1),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.string().optional(),
  type: z.enum(['debit', 'credit']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type ListTransactionInput = z.infer<typeof listTransactionSchema>;
