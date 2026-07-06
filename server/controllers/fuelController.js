import FuelLog from '../models/FuelLog.js';
import MaintenanceLog from '../models/MaintenanceLog.js';
import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';

const getFuelLogs = asyncHandler(async (req, res) => {
  const query = req.query.vehicle ? { vehicle: req.query.vehicle } : {};

  const logs = await FuelLog.find(query)
    .populate('vehicle', 'model licensePlate')
    .populate('trip', 'referenceNo status')
    .sort({ date: -1 });

  res.json(logs);
});

const createFuelLog = asyncHandler(async (req, res) => {
  const log = await FuelLog.create(req.body);
  const populated = await FuelLog.findById(log._id)
    .populate('vehicle', 'model licensePlate')
    .populate('trip', 'referenceNo status');

  res.status(201).json(populated);
});

const getOperationalCost = asyncHandler(async (req, res) => {
  const vehicleId = req.params.vehicleId;

  if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
    res.status(400);
    throw new Error('Invalid vehicle id');
  }

  const objectId = new mongoose.Types.ObjectId(vehicleId);

  const [fuelAgg, maintenanceAgg] = await Promise.all([
    FuelLog.aggregate([
      { $match: { vehicle: objectId } },
      { $group: { _id: null, totalFuelCost: { $sum: '$cost' } } }
    ]),
    MaintenanceLog.aggregate([
      { $match: { vehicle: objectId } },
      { $group: { _id: null, totalMaintenanceCost: { $sum: '$cost' } } }
    ])
  ]);

  const totalFuelCost = fuelAgg[0]?.totalFuelCost || 0;
  const totalMaintenanceCost = maintenanceAgg[0]?.totalMaintenanceCost || 0;

  res.json({
    totalFuelCost,
    totalMaintenanceCost,
    totalOperationalCost: totalFuelCost + totalMaintenanceCost
  });
});

export { getFuelLogs, createFuelLog, getOperationalCost };
