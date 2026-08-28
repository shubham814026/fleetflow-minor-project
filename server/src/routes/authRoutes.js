import express from 'express';
import { login, logout, getMe, verifySecondaryAuth } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { primaryLoginLimiter, secondaryAuthLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/login', primaryLoginLimiter, login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);
router.post('/secondary/verify', [authMiddleware, secondaryAuthLimiter], verifySecondaryAuth);

export default router;
