import MaintenanceLog from '../models/MaintenanceLog.js';
import Vehicle from '../models/Vehicle.js';
import Trip from '../models/Trip.js';
import asyncHandler from '../utils/asyncHandler.js';

const getMaintenanceLogs = asyncHandler(async (req, res) => {
  const query = req.query.vehicle ? { vehicle: req.query.vehicle } : {};

  const logs = await MaintenanceLog.find(query)
    .populate('vehicle', 'model licensePlate status')
    .sort({ serviceDate: -1 });

  res.json(logs);
});

const createMaintenanceLog = asyncHandler(async (req, res) => {
  const { vehicle: vehicleId } = req.body;
  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  const log = await MaintenanceLog.create(req.body);

  vehicle.status = 'In Shop';
  await vehicle.save();

  const populatedLog = await MaintenanceLog.findById(log._id).populate('vehicle', 'model licensePlate status');
  res.status(201).json(populatedLog);
});

const resolveMaintenanceLog = asyncHandler(async (req, res) => {
  const log = await MaintenanceLog.findById(req.params.id);

  if (!log) {
    res.status(404);
    throw new Error('Maintenance log not found');
  }

  log.resolved = true;
  await log.save();

  const [openLogs, activeTrip] = await Promise.all([
    MaintenanceLog.findOne({ vehicle: log.vehicle, resolved: false }),
    Trip.findOne({ vehicle: log.vehicle, status: 'Dispatched' })
  ]);

  if (!openLogs && !activeTrip) {
    const vehicle = await Vehicle.findById(log.vehicle);
    if (vehicle && !vehicle.outOfService) {
      vehicle.status = 'Available';
      await vehicle.save();
    }
  }

  const populatedLog = await MaintenanceLog.findById(log._id).populate('vehicle', 'model licensePlate status');
  res.json(populatedLog);
});

export { getMaintenanceLogs, createMaintenanceLog, resolveMaintenanceLog };
