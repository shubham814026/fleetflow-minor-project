import express from 'express';
import { createDriver, deleteDriver, getDrivers, updateDriver } from '../controllers/driverController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getDrivers)
  .post(protect, authorize('Fleet Manager', 'Safety Officer'), createDriver);

router
  .route('/:id')
  .put(protect, authorize('Fleet Manager', 'Safety Officer'), updateDriver)
  .delete(protect, authorize('Fleet Manager'), deleteDriver);

export default router;
