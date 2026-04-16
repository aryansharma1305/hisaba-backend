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

router.get('/', listTransactions);
router.delete('/source/sms', deleteSmsTransactions);
router.get('/:id', getTransaction);
router.post('/', createTransaction);
router.post('/bulk', createBulkTransactions);
router.patch('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
