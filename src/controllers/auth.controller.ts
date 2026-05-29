import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { registerSchema, loginSchema } from '../utils/validators/auth.validator';
import { successResponse } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.registerUser(data);
    res.status(201).json(successResponse(result, 'Account created successfully'));
  } catch (err: any) {
    if (err.message === 'Email already registered') {
      return next(new AppError(err.message, 409));
    }
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.loginUser(data);
    res.json(successResponse(result, 'Login successful'));
  } catch (err: any) {
    if (err.message === 'Invalid email or password') {
      return next(new AppError(err.message, 401));
    }
    next(err);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId as string;
    const user = await authService.getUserById(userId);
    if (!user) throw new AppError('User not found', 404);
    res.json(successResponse(user));
  } catch (err) {
    next(err);
  }
};

/** Refresh: validates current token and issues a fresh one */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId as string;
    const result = await authService.refreshUserToken(userId);
    if (!result) throw new AppError('User not found', 404);
    res.json(successResponse(result, 'Token refreshed'));
  } catch (err) {
    next(err);
  }
};

export const deleteMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId as string;
    await authService.deleteUserAccount(userId);
    res.json(successResponse(null, 'Account deleted'));
  } catch (err) {
    next(err);
  }
};
