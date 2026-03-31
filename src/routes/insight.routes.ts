import { Router } from 'express';
import { listInsights } from '../controllers/insight.controller';

const router = Router();

router.get('/', listInsights);

export default router;
