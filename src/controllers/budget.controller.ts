import { Request, Response, NextFunction } from 'express';
import { getBudgets, createBudget } from '../services/budget.service';
import { createBudgetSchema } from '../utils/validators/budget.validator';
import { successResponse } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

export const listBudgets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    const budgets = await getBudgets(userId);
    res.json(successResponse(budgets));
  } catch (err) { next(err); }
};

export const upsertBudget = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    req.body.userId = userId;
    const data = createBudgetSchema.parse(req.body);
    const budget = await createBudget(data);
    res.status(201).json(successResponse(budget, 'Budget saved'));
  } catch (err) { next(err); }
};
