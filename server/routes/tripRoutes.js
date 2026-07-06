import express from 'express';
import { createTrip, getTrips, updateTripStatus } from '../controllers/tripController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getTrips)
  .post(protect, authorize('Dispatcher', 'Fleet Manager'), createTrip);

router.patch('/:id/status', protect, authorize('Dispatcher', 'Fleet Manager'), updateTripStatus);

export default router;
