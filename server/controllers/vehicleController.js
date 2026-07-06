import Vehicle from '../models/Vehicle.js';
import Trip from '../models/Trip.js';
import asyncHandler from '../utils/asyncHandler.js';

const getVehicles = asyncHandler(async (req, res) => {
  const { type, status, search } = req.query;
  const query = {};

  if (type) query.type = type;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { model: { $regex: search, $options: 'i' } },
      { licensePlate: { $regex: search, $options: 'i' } }
    ];
  }

  const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });
  res.json(vehicles);
});

const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.create(req.body);
  res.status(201).json(vehicle);
});

const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  Object.assign(vehicle, req.body);
  const updated = await vehicle.save();
  res.json(updated);
});

const toggleOutOfService = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  vehicle.outOfService = !vehicle.outOfService;
  vehicle.status = vehicle.outOfService ? 'Out of Service' : 'Available';

  const updated = await vehicle.save();
  res.json(updated);
});

const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  const activeTrip = await Trip.findOne({
    vehicle: vehicle._id,
    status: { $in: ['Draft', 'Dispatched'] }
  });

  if (activeTrip) {
    res.status(400);
    throw new Error('Cannot delete vehicle with active trip');
  }

  await vehicle.deleteOne();
  res.json({ message: 'Vehicle deleted' });
});

export { getVehicles, createVehicle, updateVehicle, toggleOutOfService, deleteVehicle };
