import express from 'express';
import { getAuditLogs, createAuditLog } from '../controllers/auditController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { rbacMiddleware } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(rbacMiddleware(['SUPER_ADMIN', 'SUB_ADMIN']));

router.get('/', getAuditLogs);
router.post('/', createAuditLog);

export default router;
