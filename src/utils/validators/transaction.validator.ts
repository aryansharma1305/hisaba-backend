import { z } from 'zod';

export const createTransactionRequestSchema = z.object({
  merchantName: z.string().min(1),
  amount: z.number().positive(),
  type: z.enum(['debit', 'credit']),
  category: z.string().min(1),
  paymentMode: z.string().min(1),
  // Validates that the string can be parsed into a real date — the service layer converts to Date
  transactionDate: z.string().min(1).refine(
    (val) => !isNaN(new Date(val).getTime()),
    { message: 'transactionDate must be a valid date string' }
  ),
  source: z.enum(['sms', 'manual']).default('manual'),
  referenceId: z.string().optional(),
  notes: z.string().optional(),
});

export const createTransactionSchema = createTransactionRequestSchema.extend({
  userId: z.string().min(1),
});

export const updateTransactionSchema = z.object({
  merchantName: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  type: z.enum(['debit', 'credit']).optional(),
  category: z.string().min(1).optional(),
  paymentMode: z.string().min(1).optional(),
  transactionDate: z.string().min(1).optional(),
  notes: z.string().optional(),
});

export const listTransactionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.string().optional(),
  type: z.enum(['debit', 'credit']).optional(),
  // Accept any date string for filtering — the service layer parses with new Date()
  from: z.string().optional(),
  to: z.string().optional(),
});

export const listTransactionSchema = listTransactionQuerySchema.extend({
  userId: z.string().min(1),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type CreateTransactionRequestInput = z.infer<typeof createTransactionRequestSchema>;
export type ListTransactionQueryInput = z.infer<typeof listTransactionQuerySchema>;
export type ListTransactionInput = z.infer<typeof listTransactionSchema>;
