import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import asyncHandler from '../utils/asyncHandler.js';

const validateDriverForDispatch = (driver) => {
  const today = new Date();
  const licenseExpired = new Date(driver.licenseExpiryDate) < today;

  if (licenseExpired) return 'Driver license is expired';
  if (driver.status === 'Suspended') return 'Driver is suspended';
  if (driver.status === 'On Trip') return 'Driver already on trip';

  return null;
};

const validateVehicleForDispatch = (vehicle) => {
  if (vehicle.status === 'In Shop') return 'Vehicle is in shop';
  if (vehicle.status === 'Out of Service' || vehicle.outOfService) return 'Vehicle is out of service';
  if (vehicle.status === 'On Trip') return 'Vehicle already on trip';

  return null;
};

const getTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.find()
    .populate('vehicle', 'model licensePlate status maxLoadCapacity')
    .populate('driver', 'name status licenseExpiryDate')
    .sort({ createdAt: -1 });

  res.json(trips);
});

const createTrip = asyncHandler(async (req, res) => {
  const isManager = req.user?.role === 'Fleet Manager';
  const {
    referenceNo,
    origin,
    destination,
    cargoDescription,
    cargoWeight,
    plannedDistanceKm,
    vehicle: vehicleId,
    driver: driverId,
    status,
    revenue
  } = req.body;

  const [vehicle, driver] = await Promise.all([
    Vehicle.findById(vehicleId),
    Driver.findById(driverId)
  ]);

  if (!vehicle || !driver) {
    res.status(404);
    throw new Error('Vehicle or driver not found');
  }

  if (cargoWeight > vehicle.maxLoadCapacity) {
    res.status(400);
    throw new Error('Cargo weight exceeds vehicle max load capacity');
  }

  if (status === 'Dispatched' && !isManager) {
    const vehicleError = validateVehicleForDispatch(vehicle);
    const driverError = validateDriverForDispatch(driver);

    if (vehicleError || driverError) {
      res.status(400);
      throw new Error(vehicleError || driverError);
    }
  }

  const trip = await Trip.create({
    referenceNo,
    origin,
    destination,
    cargoDescription,
    cargoWeight,
    plannedDistanceKm,
    vehicle: vehicleId,
    driver: driverId,
    revenue,
    status: status || 'Draft',
    dispatchedAt: status === 'Dispatched' ? new Date() : undefined
  });

  if (trip.status === 'Dispatched') {
    vehicle.status = 'On Trip';
    driver.status = 'On Trip';
    await Promise.all([vehicle.save(), driver.save()]);
  }

  const populatedTrip = await Trip.findById(trip._id)
    .populate('vehicle', 'model licensePlate status maxLoadCapacity')
    .populate('driver', 'name status licenseExpiryDate');

  res.status(201).json(populatedTrip);
});

const updateTripStatus = asyncHandler(async (req, res) => {
  const isManager = req.user?.role === 'Fleet Manager';
  const isDispatcher = req.user?.role === 'Dispatcher';
  const { status, actualDistanceKm } = req.body;
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    res.status(404);
    throw new Error('Trip not found');
  }

  const [vehicle, driver] = await Promise.all([
    Vehicle.findById(trip.vehicle),
    Driver.findById(trip.driver)
  ]);

  if (!vehicle || !driver) {
    res.status(404);
    throw new Error('Vehicle or driver not found');
  }

  if (isDispatcher && trip.status === 'Completed') {
    res.status(403);
    throw new Error('Dispatcher cannot edit completed trips');
  }

  if (isDispatcher && status === 'Cancelled' && trip.status !== 'Draft') {
    res.status(403);
    throw new Error('Dispatcher can cancel only before dispatch');
  }

  if (status === 'Dispatched') {
    if (!isManager) {
      const vehicleError = validateVehicleForDispatch(vehicle);
      const driverError = validateDriverForDispatch(driver);

      if (vehicleError || driverError) {
        res.status(400);
        throw new Error(vehicleError || driverError);
      }
    }

    trip.dispatchedAt = new Date();
    vehicle.status = 'On Trip';
    driver.status = 'On Trip';
  }

  if (status === 'Completed') {
    const kmToAdd = Number(actualDistanceKm || trip.plannedDistanceKm || 0);
    trip.actualDistanceKm = kmToAdd;
    trip.completedAt = new Date();
    vehicle.odometer += kmToAdd;
    vehicle.status = vehicle.outOfService ? 'Out of Service' : 'Available';
    driver.status = 'On Duty';
  }

  if (status === 'Cancelled') {
    trip.cancelledAt = new Date();
    vehicle.status = vehicle.outOfService ? 'Out of Service' : 'Available';
    if (driver.status === 'On Trip') {
      driver.status = 'Off Duty';
    }
  }

  if (!['Draft', 'Dispatched', 'Completed', 'Cancelled'].includes(status)) {
    res.status(400);
    throw new Error('Invalid trip status');
  }

  trip.status = status;

  await Promise.all([trip.save(), vehicle.save(), driver.save()]);

  const updatedTrip = await Trip.findById(trip._id)
    .populate('vehicle', 'model licensePlate status maxLoadCapacity')
    .populate('driver', 'name status licenseExpiryDate');

  res.json(updatedTrip);
});

export { getTrips, createTrip, updateTripStatus };
