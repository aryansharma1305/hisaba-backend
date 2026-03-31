import { Request, Response, NextFunction } from 'express';
import { getDashboardSummary } from '../services/dashboard.service';
import { successResponse } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

export const summary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    const data = await getDashboardSummary(userId);
    res.json(successResponse(data));
  } catch (err) { next(err); }
};
