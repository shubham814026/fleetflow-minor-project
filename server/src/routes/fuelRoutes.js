import express from 'express';
import { getFuelMetrics, getFuelLogs, addFuelLog } from '../controllers/fuelController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getFuelMetrics);
router.get('/metrics', getFuelMetrics);
router.get('/analytics', getFuelMetrics);
router.get('/logs', getFuelLogs);
router.post('/logs', addFuelLog);
router.post('/', addFuelLog);

export default router;
