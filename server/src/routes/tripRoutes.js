import express from 'express';
import { getTrips, getTripById, startTrip, endTrip } from '../controllers/tripController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getTrips);
router.get('/:id', getTripById);
router.post('/start', startTrip);
router.post('/:id/end', endTrip);

export default router;
