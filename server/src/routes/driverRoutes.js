import express from 'express';
import {
  getDrivers,
  getDriverById,
  createDriver,
  getSafetyMetrics
} from '../controllers/driverController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/safety-metrics', getSafetyMetrics);
router.get('/', getDrivers);
router.get('/:id', getDriverById);
router.post('/', createDriver);

export default router;
