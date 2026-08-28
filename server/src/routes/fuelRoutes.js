import express from 'express';
import { getFuelMetrics, addFuelLog } from '../controllers/fuelController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/metrics', getFuelMetrics);
router.get('/analytics', getFuelMetrics);
router.post('/logs', addFuelLog);
router.post('/', addFuelLog);

export default router;
