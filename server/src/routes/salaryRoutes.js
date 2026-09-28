import express from 'express';
import {
  getSalaries,
  createSalary,
  updateSalaryStatus,
  batchDisburse,
  deleteSalary
} from '../controllers/salaryController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { rbacMiddleware } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(rbacMiddleware(['SUPER_ADMIN', 'SUB_ADMIN', 'ACCOUNTANT']));

router.get('/', getSalaries);
router.post('/', createSalary);
router.post('/batch-disburse', batchDisburse);
router.patch('/:id', updateSalaryStatus);
router.delete('/:id', deleteSalary);

export default router;
