import { INITIAL_VEHICLES, DEMO_UTILISATION } from '../../../client/src/api/mockData.js';
import { mlServiceClient } from '../services/mlServiceClient.js';

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
  const newV = {
    id: `veh-${Date.now()}`,
    registration: body.registrationNumber || body.registration || `KA-01-XX-${Math.floor(1000 + Math.random() * 9000)}`,
    makeModel: body.makeModel || 'Tata Truck',
    type: body.type || 'Heavy Truck',
    status: 'moving',
    speed: 55,
    heading: 90,
    lat: 12.9716,
    lng: 77.5946,
    fuelLevel: 100,
    odometer: body.odometer || 1200,
    lastGpsUpdate: new Date().toISOString(),
    ...body
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
          const actHrs = Math.min(2200.0, (item.activeHours || 6.5) * 120.0);
          const idleRatio = item.idleRatio || 0.15;
          const idleHrs = (idleRatio / Math.max(0.01, 1.0 - idleRatio)) * actHrs;
          const tripsPerDay = Math.min(0.36, ((item.tripsPerDay || 2.0) / 8.5) * 0.35);

          const mlScore = await mlServiceClient.getDriverUtilisation(item.id, {
            driver_id: item.id,
            driver_name: item.assignedDriverName || 'Fleet Driver',
            trips_per_day: tripsPerDay,
            active_hours: actHrs,
            idle_hours: idleHrs
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

