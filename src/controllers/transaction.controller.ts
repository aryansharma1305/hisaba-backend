import { Request, Response, NextFunction } from 'express';
import * as txService from '../services/transaction.service';
import {
  createTransactionRequestSchema,
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionQuerySchema,
  listTransactionSchema,
} from '../utils/validators/transaction.validator';
import { successResponse, paginatedResponse } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

export const listTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    const query = listTransactionQuerySchema.parse(req.query);
    const params = listTransactionSchema.parse({ ...query, userId });
    const { transactions, total } = await txService.listTransactions(params);
    res.json(paginatedResponse(transactions, total, params.page, params.limit));
  } catch (err) { next(err); }
};

export const getTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const userId = (req as any).userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    const tx = await txService.getTransactionById(id, userId);
    if (!tx) throw new AppError('Transaction not found', 404);
    res.json(successResponse(tx));
  } catch (err) { next(err); }
};

export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    const payload = createTransactionRequestSchema.parse(req.body);
    const data = createTransactionSchema.parse({ ...payload, userId });
    const tx = await txService.createTransaction(data);
    res.status(201).json(successResponse(tx, 'Transaction created'));
  } catch (err) { next(err); }
};

export const createBulkTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    const items = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError('Request body must be a non-empty array', 400);
    }

    // Use safeParse so one bad transaction doesn't kill the entire batch
    const parsed: any[] = [];
    const skipped: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < items.length; i++) {
      const reqResult = createTransactionRequestSchema.safeParse(items[i]);
      if (!reqResult.success) {
        skipped.push({ index: i, error: reqResult.error.issues[0]?.message || 'Validation failed' });
        continue;
      }
      const fullResult = createTransactionSchema.safeParse({ ...reqResult.data, userId });
      if (!fullResult.success) {
        skipped.push({ index: i, error: fullResult.error.issues[0]?.message || 'Validation failed' });
        continue;
      }
      parsed.push(fullResult.data);
    }

    if (parsed.length === 0) {
      throw new AppError(`All ${items.length} transactions failed validation`, 400);
    }

    const result = await txService.createBulkTransactions(parsed);
    res.status(201).json(successResponse(
      { count: result.count, skipped: skipped.length },
      `${result.count} transactions created${skipped.length ? `, ${skipped.length} skipped` : ''}`
    ));
  } catch (err) { next(err); }
};

export const updateTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const userId = (req as any).userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    const data = updateTransactionSchema.parse(req.body);
    const tx = await txService.updateTransaction(id, userId, data);
    if (!tx) throw new AppError('Transaction not found', 404);
    res.json(successResponse(tx, 'Transaction updated'));
  } catch (err) { next(err); }
};

export const deleteTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const userId = (req as any).userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    const tx = await txService.deleteTransaction(id, userId);
    if (!tx) throw new AppError('Transaction not found', 404);
    res.json(successResponse(null, 'Transaction deleted'));
  } catch (err) { next(err); }
};

export const deleteSmsTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const result = await txService.deleteTransactionsBySource(userId, 'sms');
    res.json(successResponse(result, `${result.count} SMS transactions deleted`));
  } catch (err) { next(err); }
};
