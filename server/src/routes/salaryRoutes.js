import express from 'express';
import { getSalaries, updateSalaryStatus } from '../controllers/salaryController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { rbacMiddleware } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(rbacMiddleware(['SUPER_ADMIN', 'SUB_ADMIN', 'ACCOUNTANT']));

router.get('/', getSalaries);
router.patch('/:id', updateSalaryStatus);

export default router;
