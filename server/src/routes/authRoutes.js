import express from 'express';
import { login, logout, getMe, verifySecondaryAuth, getProfile, updateProfile, changePassword } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { primaryLoginLimiter, secondaryAuthLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/login', primaryLoginLimiter, login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/change-password', authMiddleware, changePassword);
router.post('/secondary/verify', [authMiddleware, secondaryAuthLimiter], verifySecondaryAuth);
router.post('/secondary-verify', [authMiddleware, secondaryAuthLimiter], verifySecondaryAuth);

export default router;
