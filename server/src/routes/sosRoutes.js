import express from 'express';
import { triggerSOS, getActiveSOS, resolveSOS } from '../controllers/sosController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', triggerSOS);
router.get('/active', getActiveSOS);
router.patch('/:id/resolve', resolveSOS);

export default router;
