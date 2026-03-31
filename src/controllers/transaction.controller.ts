import { Request, Response, NextFunction } from 'express';
import * as txService from '../services/transaction.service';
import {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionSchema,
} from '../utils/validators/transaction.validator';
import { successResponse, paginatedResponse } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

export const listTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    req.query.userId = userId;
    const params = listTransactionSchema.parse({ ...req.query });
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
    req.body.userId = userId;
    const data = createTransactionSchema.parse(req.body);
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
    const parsed = items.map((item: any) => {
      item.userId = userId;
      return createTransactionSchema.parse(item);
    });
    const result = await txService.createBulkTransactions(parsed);
    res.status(201).json(successResponse(result, `${result.count} transactions created`));
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
