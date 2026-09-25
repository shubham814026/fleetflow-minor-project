import express from 'express';
import { getGeofences, createGeofence, deleteGeofence, anchorDriverGeofence } from '../controllers/geofenceController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getGeofences);
router.post('/', createGeofence);
router.post('/driver-anchor', anchorDriverGeofence);
router.delete('/:id', deleteGeofence);

export default router;
