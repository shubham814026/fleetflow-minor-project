import express from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorize('Fleet Manager', 'Financial Analyst'), getAnalytics);

export default router;
