import express from 'express';
import { getCarbonMetrics, exportCarbonReport } from '../controllers/carbonController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/metrics', getCarbonMetrics);
router.get('/export', exportCarbonReport);

export default router;
