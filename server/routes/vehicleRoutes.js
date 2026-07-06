import express from 'express';
import {
  createVehicle,
  deleteVehicle,
  getVehicles,
  toggleOutOfService,
  updateVehicle
} from '../controllers/vehicleController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getVehicles)
  .post(protect, authorize('Fleet Manager'), createVehicle);

router
  .route('/:id')
  .put(protect, authorize('Fleet Manager'), updateVehicle)
  .delete(protect, authorize('Fleet Manager'), deleteVehicle);

router.patch('/:id/out-of-service', protect, authorize('Fleet Manager', 'Safety Officer'), toggleOutOfService);

export default router;
