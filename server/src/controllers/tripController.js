import { INITIAL_TRIPS } from '../../../client/src/api/mockData.js';
import { broadcastTripEvent } from '../services/socketService.js';

let TRIPS = [...INITIAL_TRIPS];

export const getTrips = async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  let filtered = [...TRIPS];

  if (status) {
    filtered = filtered.filter((t) => t.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.tripCode.toLowerCase().includes(s) ||
        t.vehicleReg.toLowerCase().includes(s) ||
        t.driverName.toLowerCase().includes(s)
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

export const getTripById = async (req, res) => {
  const { id } = req.params;
  const trip = TRIPS.find((t) => t.id === id);
  if (!trip) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Trip ${id} not found` }
    });
  }
  return res.json({ success: true, data: trip });
};

export const startTrip = async (req, res) => {
  const body = req.body;
  const newTrip = {
    id: `trip-${Date.now()}`,
    tripCode: `TRP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    vehicleReg: body.vehicleReg || 'KA-01-EQ-9042',
    driverName: body.driverName || req.user?.name || 'Rajesh Kumar',
    origin: body.origin || 'Bengaluru ICD Nelamangala',
    destination: body.destination || 'Chennai Port Container Terminal',
    startLocation: body.startLocation || { lat: 12.9716, lng: 77.5946 },
    status: 'In Transit',
    distanceKm: 0,
    durationHours: 0.1,
    idleMinutes: 0,
    startTime: new Date().toISOString(),
    endTime: null,
    avgSpeed: 0,
    fuelConsumedLitres: 0
  };

  TRIPS.unshift(newTrip);
  broadcastTripEvent('trip:started', newTrip);

  return res.status(201).json({ success: true, data: newTrip });
};

export const endTrip = async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  let endedTrip = null;
  TRIPS = TRIPS.map((t) => {
    if (t.id === id) {
      endedTrip = {
        ...t,
        status: 'Completed',
        endTime: new Date().toISOString(),
        distanceKm: body.distanceKm || t.distanceKm || 348.5,
        durationHours: body.durationHours || 6.5,
        idleMinutes: body.idleMinutes || 24
      };
      return endedTrip;
    }
    return t;
  });

  if (endedTrip) {
    broadcastTripEvent('trip:ended', endedTrip);
  }

  return res.json({ success: true, data: endedTrip || { id, status: 'Completed' } });
};

export { TRIPS };
