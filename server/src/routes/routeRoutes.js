import express from 'express';
import { optimizeRoute } from '../controllers/routeController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/optimize', optimizeRoute);

export default router;
