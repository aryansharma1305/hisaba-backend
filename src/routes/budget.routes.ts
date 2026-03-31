import { Router } from 'express';
import { listBudgets, upsertBudget } from '../controllers/budget.controller';

const router = Router();

router.get('/', listBudgets);
router.post('/', upsertBudget);

export default router;
