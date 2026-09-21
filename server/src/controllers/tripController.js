import { INITIAL_TRIPS } from '../../../client/src/api/mockData.js';
import { broadcastTripEvent } from '../services/socketService.js';
import { GEOFENCES } from './geofenceController.js';
import { VEHICLES } from './vehicleController.js';

let TRIPS = [...INITIAL_TRIPS];

export const getTrips = async (req, res) => {
  const { page = 1, limit = 50, status, search, driverId, driverName } = req.query;
  let filtered = [...TRIPS];

  // If driver user is authenticated, isolate to their assigned trips
  if (req.user?.role?.toUpperCase() === 'DRIVER') {
    filtered = filtered.filter(
      (t) =>
        (req.user.id && t.driverId === req.user.id) ||
        (req.user.name && t.driverName?.toLowerCase() === req.user.name.toLowerCase())
    );
  } else {
    if (driverId) {
      filtered = filtered.filter((t) => t.driverId === driverId);
    }
    if (driverName) {
      filtered = filtered.filter((t) => t.driverName?.toLowerCase().includes(driverName.toLowerCase()));
    }
  }

  if (status && status !== 'all') {
    filtered = filtered.filter((t) => t.status?.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.tripCode?.toLowerCase().includes(s) ||
        t.vehicleReg?.toLowerCase().includes(s) ||
        t.driverName?.toLowerCase().includes(s) ||
        t.origin?.toLowerCase().includes(s) ||
        t.destination?.toLowerCase().includes(s)
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

  // If driver GPS coordinates provided, anchor geofence to their exact location
  if (newTrip.startLocation?.lat != null && newTrip.startLocation?.lng != null) {
    const sLat = Number(newTrip.startLocation.lat);
    const sLng = Number(newTrip.startLocation.lng);

    const targetVeh = VEHICLES.find((v) => v.registration === newTrip.vehicleReg || v.id === newTrip.vehicleReg);
    if (targetVeh) {
      targetVeh.lat = sLat;
      targetVeh.lng = sLng;
      targetVeh.lastGpsUpdate = new Date().toISOString();
      targetVeh.status = 'moving';
    }

    const driverGeoId = `geo-driver-${newTrip.vehicleReg}`;
    const existingIdx = GEOFENCES.findIndex((g) => g.id === driverGeoId || (g.isDriverAnchor && g.vehicleReg === newTrip.vehicleReg));
    const anchoredZone = {
      id: driverGeoId,
      name: `Driver Corridor (${newTrip.vehicleReg})`,
      type: 'Permitted',
      center: [sLat, sLng],
      radius: 12000,
      color: '#10B981',
      isDriverAnchor: true,
      vehicleReg: newTrip.vehicleReg,
      driverName: newTrip.driverName,
      anchoredAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      GEOFENCES[existingIdx] = anchoredZone;
    } else {
      GEOFENCES.unshift(anchoredZone);
    }
  }

  broadcastTripEvent('trip:started', newTrip);

  return res.status(201).json({ success: true, data: newTrip });
};

export const endTrip = async (req, res) => {
  const { id } = req.params;
  const body = req.body || {};

  let endedTrip = null;
  TRIPS = TRIPS.map((t) => {
    if (t.id === id || t.tripCode === id) {
      endedTrip = {
        ...t,
        status: 'Completed',
        endTime: new Date().toISOString(),
        distanceKm: Number(body.distanceKm) || t.distanceKm || 348.5,
        durationHours: Number(body.durationHours) || t.durationHours || 6.5,
        idleMinutes: Number(body.idleMinutes) || t.idleMinutes || 24
      };
      return endedTrip;
    }
    return t;
  });

  if (!endedTrip) {
    endedTrip = {
      id: id || `trip-${Date.now()}`,
      tripCode: id?.startsWith('TRP-') ? id : `TRP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Completed',
      endTime: new Date().toISOString(),
      distanceKm: Number(body.distanceKm) || 14.5,
      durationHours: Number(body.durationHours) || 1.2,
      idleMinutes: Number(body.idleMinutes) || 0,
      driverName: req.user?.name || 'Rajesh Kumar',
      vehicleReg: req.user?.assignedVehicleReg || 'KA-01-EQ-9042'
    };
    TRIPS.unshift(endedTrip);
  }

  broadcastTripEvent('trip:ended', endedTrip);

  return res.json({ success: true, data: endedTrip });
};

export { TRIPS };
