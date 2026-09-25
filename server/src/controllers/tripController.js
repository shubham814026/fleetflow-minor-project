import { INITIAL_TRIPS } from '../../../client/src/api/mockData.js';
import { broadcastTripEvent, broadcastAlert } from '../services/socketService.js';
import { GEOFENCES } from './geofenceController.js';
import { VEHICLES } from './vehicleController.js';
import { ALERTS } from './alertController.js';

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
  const targetVeh = VEHICLES.find((v) => v.registration === body.vehicleReg || v.id === body.vehicleId || v.id === body.vehicleReg);
  const newTrip = {
    id: `trip-${Date.now()}`,
    tripCode: `TRP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    vehicleReg: body.vehicleReg || targetVeh?.registration || 'KA-01-EQ-9042',
    vehicleId: body.vehicleId || targetVeh?.id || 'veh-101',
    driverName: body.driverName || req.user?.name || targetVeh?.assignedDriverName || 'Rajesh Kumar',
    driverId: body.driverId || req.user?.id || targetVeh?.assignedDriverId || 'drv-201',
    origin: body.origin || 'Bengaluru ICD Nelamangala',
    destination: body.destination || 'Chennai Port Container Terminal',
    startLocation: body.startLocation || {
      lat: targetVeh?.lat || 12.9716,
      lng: targetVeh?.lng || 77.5946,
      address: body.origin || 'Origin Hub'
    },
    endLocation: body.endLocation || {
      lat: 13.0827,
      lng: 80.2707,
      address: body.destination || 'Destination Hub'
    },
    status: 'In Transit',
    distanceKm: body.distanceKm || 0,
    durationHours: body.durationHours || 0.1,
    idleMinutes: 0,
    startTime: new Date().toISOString(),
    endTime: null,
    avgSpeed: 0,
    fuelConsumedLitres: 0
  };

  TRIPS.unshift(newTrip);

  if (targetVeh) {
    targetVeh.status = 'moving';
    targetVeh.lastGpsUpdate = new Date().toISOString();
  }

  // If driver GPS coordinates provided, anchor geofence to their exact location
  if (newTrip.startLocation?.lat != null && newTrip.startLocation?.lng != null) {
    const sLat = Number(newTrip.startLocation.lat);
    const sLng = Number(newTrip.startLocation.lng);

    if (targetVeh) {
      targetVeh.lat = sLat;
      targetVeh.lng = sLng;
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

  const isEarly = Boolean(body.isEarlyTermination);
  const terminationReason = body.terminationReason || null;
  const distAway = body.distanceFromDestinationKm != null ? Number(body.distanceFromDestinationKm) : null;

  let endedTrip = null;
  TRIPS = TRIPS.map((t) => {
    if (t.id === id || t.tripCode === id) {
      endedTrip = {
        ...t,
        status: 'Completed',
        endTime: new Date().toISOString(),
        distanceKm: Number(body.distanceKm) || t.distanceKm || 348.5,
        durationHours: Number(body.durationHours) || t.durationHours || 6.5,
        idleMinutes: Number(body.idleMinutes) || t.idleMinutes || 24,
        isEarlyTermination: isEarly,
        terminationReason: terminationReason,
        distanceFromDestinationKm: distAway,
        finalLocation: body.endLocation || t.endLocation
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
      vehicleReg: req.user?.assignedVehicleReg || 'KA-01-EQ-9042',
      isEarlyTermination: isEarly,
      terminationReason: terminationReason,
      distanceFromDestinationKm: distAway,
      finalLocation: body.endLocation || null
    };
    TRIPS.unshift(endedTrip);
  }

  // If ended prematurely away from destination, generate high-severity alert for fleet manager
  if (isEarly) {
    const earlyAlert = {
      id: `alt-early-${Date.now()}`,
      category: 'Fraud',
      severity: 'High',
      vehicleReg: endedTrip.vehicleReg || 'KA-01-EQ-9042',
      driverName: endedTrip.driverName || 'Rajesh Kumar',
      description: `Early Route Termination: Trip ${endedTrip.tripCode} ended ${distAway ? distAway + ' km before reaching ' : 'away from '}${endedTrip.destination}. Reason: ${terminationReason || 'Unspecified'}.`,
      timestamp: new Date().toISOString(),
      status: 'Open',
      location: body.endLocation || { lat: 12.9716, lng: 77.5946 }
    };
    ALERTS.unshift(earlyAlert);
    broadcastAlert(earlyAlert);
  }

  broadcastTripEvent('trip:ended', endedTrip);

  return res.json({ success: true, data: endedTrip });
};

export { TRIPS };
