import { Request, Response, NextFunction } from 'express';
import { getInsights } from '../services/insight.service';
import { successResponse } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

export const listInsights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    const insights = await getInsights(userId);
    res.json(successResponse(insights));
  } catch (err) { next(err); }
};
