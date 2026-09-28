import express from 'express';
import { getMaintenanceRecords, createMaintenanceRecord } from '../controllers/maintenanceController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getMaintenanceRecords);
router.post('/', createMaintenanceRecord);

export default router;
