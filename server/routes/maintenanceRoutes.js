import express from 'express';
import {
  createMaintenanceLog,
  getMaintenanceLogs,
  resolveMaintenanceLog
} from '../controllers/maintenanceController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('Fleet Manager', 'Safety Officer', 'Financial Analyst'), getMaintenanceLogs)
  .post(protect, authorize('Safety Officer', 'Fleet Manager'), createMaintenanceLog);

router.patch('/:id/resolve', protect, authorize('Safety Officer', 'Fleet Manager'), resolveMaintenanceLog);

export default router;
