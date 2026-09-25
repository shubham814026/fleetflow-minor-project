import { INITIAL_VEHICLES, DEMO_UTILISATION } from '../../../client/src/api/mockData.js';
import { mlServiceClient } from '../services/mlServiceClient.js';
import { DRIVERS } from './driverController.js';

let VEHICLES = [...INITIAL_VEHICLES];

export const getVehicles = async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  let filtered = [...VEHICLES];

  if (status) {
    filtered = filtered.filter((v) => v.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (v) => v.registration.toLowerCase().includes(s) || v.makeModel.toLowerCase().includes(s)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + parseInt(limit, 10));

  return res.json({
    success: true,
    data: paginated,
    meta: { page: parseInt(page, 10), limit: parseInt(limit, 10), total }
  });
};

export const getVehicleById = async (req, res) => {
  const { id } = req.params;
  const vehicle = VEHICLES.find((v) => v.id === id);
  if (!vehicle) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Vehicle ${id} not found` }
    });
  }

  // Hide sensitive specs if secondary auth header is missing
  const hasSecondaryAuth = Boolean(req.headers['x-secondary-auth']);
  const responseData = { ...vehicle };

  if (!hasSecondaryAuth) {
    delete responseData.sensitive;
  }

  return res.json({ success: true, data: responseData });
};

export const createVehicle = async (req, res) => {
  const body = req.body;
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  const defaultExpiry = oneYearFromNow.toISOString().split('T')[0];

  const newV = {
    id: `veh-${Date.now()}`,
    registration: body.registrationNumber || body.registration || `KA-01-XX-${Math.floor(1000 + Math.random() * 9000)}`,
    makeModel: body.makeModel || 'Tata Truck',
    type: body.type || 'Heavy Truck',
    heading: 0,
    lat: 12.9716,
    lng: 77.5946,
    fuelLevel: 100,
    odometer: body.odometer || 1200,
    purchaseDate: body.purchaseDate || new Date().toISOString().split('T')[0],
    insuranceExpiry: body.insuranceExpiry || defaultExpiry,
    pucExpiry: body.pucExpiry || defaultExpiry,
    lastGpsUpdate: new Date().toISOString(),
    ...body,
    status: body.status || 'idle',
    speed: body.speed !== undefined ? body.speed : 0,
    insuranceExpiry: body.insuranceExpiry || defaultExpiry,
    pucExpiry: body.pucExpiry || defaultExpiry
  };

  VEHICLES.unshift(newV);
  return res.status(201).json({ success: true, data: newV });
};

export const updateVehicleStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  let updated = null;

  VEHICLES = VEHICLES.map((v) => {
    if (v.id === id) {
      updated = { ...v, status };
      return updated;
    }
    return v;
  });

  return res.json({ success: true, data: updated });
};

export const reassignVehicleDriver = async (req, res) => {
  const { id } = req.params;
  const { driverId, driverName } = req.body;

  const vehicle = VEHICLES.find((v) => v.id === id);
  if (!vehicle) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Vehicle ${id} not found` }
    });
  }

  // Safety check: Vehicle cannot be moving when changing drivers
  if (vehicle.status === 'moving') {
    return res.status(400).json({
      success: false,
      error: { code: 'VEHICLE_MOVING', message: 'Driver cannot be reassigned while vehicle is moving' }
    });
  }

  const oldDriverId = vehicle.assignedDriverId;

  // Make old driver available
  if (oldDriverId) {
    const oldDriver = DRIVERS.find((d) => d.id === oldDriverId);
    if (oldDriver) {
      oldDriver.assignedVehicleId = null;
      oldDriver.assignedVehicleReg = null;
      oldDriver.status = 'Available';
    }
  }

  // Assign new driver to vehicle
  vehicle.assignedDriverId = driverId || null;
  vehicle.assignedDriverName = driverName || null;

  if (driverId) {
    const newDriver = DRIVERS.find((d) => d.id === driverId);
    if (newDriver) {
      newDriver.assignedVehicleId = vehicle.id;
      newDriver.assignedVehicleReg = vehicle.registration;
      newDriver.status = 'Active';
      vehicle.assignedDriverName = newDriver.name;
    }
  }

  return res.json({ success: true, data: vehicle });
};

export const deleteVehicle = async (req, res) => {
  const { id } = req.params;
  VEHICLES = VEHICLES.filter((v) => v.id !== id);
  return res.json({ success: true, data: { id, deleted: true } });
};

export const getUtilisationMetrics = async (req, res) => {
  try {
    const scoredList = await Promise.all(
      DEMO_UTILISATION.map(async (item) => {
        try {
          const mlScore = await mlServiceClient.getDriverUtilisation(item.id, {
            driver_id: item.id,
            driver_name: item.assignedDriverName || 'Fleet Driver',
            trips_per_day: item.tripsPerDay || 0.35,
            active_hours: (item.activeHours || 6.5) * 240,
            idle_hours: (item.idleRatio || 0.15) * (item.activeHours || 6.5) * 240
          });
          return {
            ...item,
            score: Math.round(mlScore.score),
            recommendation: mlScore.recommendation,
            cluster: mlScore.cluster,
            isLiveModel: true
          };
        } catch {
          return item;
        }
      })
    );
    return res.json({ success: true, data: scoredList });
  } catch {
    return res.json({ success: true, data: DEMO_UTILISATION });
  }
};

export { VEHICLES };

