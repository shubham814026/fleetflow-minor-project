import express from 'express';
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicleStatus,
  toggleOutOfService,
  reassignVehicleDriver,
  deleteVehicle,
  getUtilisationMetrics
} from '../controllers/vehicleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/utilisation', getUtilisationMetrics);
router.get('/', getVehicles);
router.get('/:id', getVehicleById);
router.post('/', createVehicle);
router.patch('/:id/status', updateVehicleStatus);
router.patch('/:id/out-of-service', toggleOutOfService);
router.patch('/:id/driver', reassignVehicleDriver);
router.patch('/:id', updateVehicleStatus);
router.delete('/:id', deleteVehicle);

export default router;
