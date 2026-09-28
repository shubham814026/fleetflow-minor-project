import express from 'express';
import { getAlerts, updateAlertStatus, getFraudAlerts } from '../controllers/alertController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAlerts);
router.get('/fraud', getFraudAlerts);
router.patch('/:id', updateAlertStatus);
router.patch('/:id/review', (req, res) => updateAlertStatus({ ...req, body: { status: 'Reviewed' } }, res));
router.patch('/:id/resolve', (req, res) => updateAlertStatus({ ...req, body: { status: 'Resolved' } }, res));

export default router;
