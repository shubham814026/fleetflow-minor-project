import express from 'express';
import { getForecast } from '../controllers/forecastController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getForecast);
router.get('/demand', getForecast);

export default router;
