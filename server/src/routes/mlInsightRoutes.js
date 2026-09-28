import express from 'express';
import { getFuelInsights, getFraudInsights, getMaintenanceInsights } from '../controllers/mlInsightController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/fuel', getFuelInsights);
router.get('/fraud', getFraudInsights);
router.get('/maintenance/:vehicleId', getMaintenanceInsights);

export default router;
