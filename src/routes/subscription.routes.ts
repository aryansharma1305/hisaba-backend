import { Router } from 'express';
import { listSubscriptions, addSubscription, cancelSubscription } from '../controllers/subscription.controller';

const router = Router();

router.get('/', listSubscriptions);
router.post('/', addSubscription);
router.patch('/:id/cancel', cancelSubscription);

export default router;
