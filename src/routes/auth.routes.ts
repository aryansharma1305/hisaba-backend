import { Router } from 'express';
import { register, login, getMe, refreshToken, deleteMe } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.delete('/me', authMiddleware, deleteMe);
router.post('/refresh', authMiddleware, refreshToken);

export default router;
