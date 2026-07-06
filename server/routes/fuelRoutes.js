import express from 'express';
import { createFuelLog, getFuelLogs, getOperationalCost } from '../controllers/fuelController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('Fleet Manager', 'Financial Analyst'), getFuelLogs)
  .post(protect, authorize('Fleet Manager', 'Financial Analyst'), createFuelLog);

router.get('/cost/:vehicleId', protect, authorize('Fleet Manager', 'Financial Analyst'), getOperationalCost);

export default router;
