import { Router } from 'express';
import { seedData } from '../controllers/seed.controller';

const router = Router();

router.post('/', seedData);

export default router;
