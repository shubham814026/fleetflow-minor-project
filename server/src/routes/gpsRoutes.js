import express from 'express';
import {
  ingestGPSPoint,
  syncOfflineGPSBatch,
  getLiveVehicles,
  getTripRoutePoints
} from '../controllers/gpsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/points', ingestGPSPoint);
router.post('/sync', syncOfflineGPSBatch);
router.get('/vehicles/live', getLiveVehicles);
router.get('/trips/:tripId', getTripRoutePoints);

export default router;
