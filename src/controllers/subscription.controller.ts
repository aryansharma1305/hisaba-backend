import { Request, Response, NextFunction } from 'express';
import { getSubscriptions, createSubscription, cancelSubscription as cancelSub } from '../services/subscription.service';
import { createSubscriptionSchema } from '../utils/validators/subscription.validator';
import { successResponse } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

export const listSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    const subs = await getSubscriptions(userId);
    res.json(successResponse(subs));
  } catch (err) { next(err); }
};

export const addSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    req.body.userId = userId;
    const data = createSubscriptionSchema.parse(req.body);
    const sub = await createSubscription(data);
    res.status(201).json(successResponse(sub, 'Subscription added'));
  } catch (err) { next(err); }
};

export const cancelSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const userId = (req as any).userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    const result = await cancelSub(id, userId);
    if (!result.count) throw new AppError('Subscription not found', 404);
    res.json(successResponse(null, 'Subscription cancelled'));
  } catch (err) { next(err); }
};
