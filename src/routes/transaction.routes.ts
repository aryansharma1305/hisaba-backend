import { Router } from 'express';
import {
  listTransactions,
  getTransaction,
  createTransaction,
  createBulkTransactions,
  updateTransaction,
  deleteTransaction,
  deleteSmsTransactions,
} from '../controllers/transaction.controller';

const router = Router();

// Specific routes MUST come before parameterised /:id routes
router.get('/', listTransactions);
router.post('/bulk', createBulkTransactions);          // ← must be before /:id
router.delete('/source/sms', deleteSmsTransactions);   // ← must be before /:id
router.post('/', createTransaction);
router.get('/:id', getTransaction);
router.patch('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
