import { INITIAL_TRIPS } from '../../../client/src/api/mockData.js';
import { broadcastTripEvent, broadcastAlert } from '../services/socketService.js';
import { GEOFENCES } from './geofenceController.js';
import { VEHICLES } from './vehicleController.js';
import { ALERTS } from './alertController.js';
import prisma from '../repositories/store.js';

let TRIPS = [...INITIAL_TRIPS];

const mapStatusToUi = (s) => {
  if (!s) return 'In Transit';
  const u = s.toUpperCase();
  if (u === 'COMPLETED') return 'Completed';
  if (u === 'IN_PROGRESS' || u === 'DISPATCHED') return 'In Transit';
  if (u === 'DRAFT') return 'Scheduled';
  if (u === 'CANCELLED') return 'Cancelled';
  return s;
};

const getCityFromCoords = (lat, lng, fallback = 'Hub') => {
  if (lat == null) return fallback;
  if (lat >= 12.5 && lat <= 13.5 && lng >= 77.0 && lng <= 78.0) return 'Bengaluru Hub';
  if (lat >= 12.8 && lat <= 13.5 && lng >= 79.5 && lng <= 80.5) return 'Chennai Port';
  if (lat >= 18.5 && lat <= 19.5 && lng >= 72.5 && lng <= 73.5) return 'Mumbai Logistics';
  if (lat >= 18.2 && lat <= 18.8 && lng >= 73.5 && lng <= 74.2) return 'Pune Depot';
  if (lat >= 28.0 && lat <= 29.0 && lng >= 76.5 && lng <= 77.8) return 'Delhi NCR Center';
  if (lat >= 17.0 && lat <= 17.8 && lng >= 78.0 && lng <= 78.8) return 'Hyderabad Gateway';
  if (lat >= 22.0 && lat <= 23.0 && lng >= 88.0 && lng <= 88.8) return 'Kolkata Dock';
  if (lat >= 26.5 && lat <= 27.2 && lng >= 80.5 && lng <= 81.5) return 'Lucknow Terminal';
  return `${fallback} (${lat.toFixed(2)}, ${lng?.toFixed(2) || '0.00'})`;
};

const formatTrip = (t) => {
  const vReg = t.vehicles?.registration_number || t.vehicleReg || 'KA-01-EQ-9042';
  const dName = t.drivers?.users?.name || t.driverName || 'Fleet Driver';
  const originCity = t.origin || getCityFromCoords(t.start_lat, t.start_lng, 'Logistics Origin');
  const destCity = t.destination || getCityFromCoords(t.end_lat, t.end_lng, 'Logistics Destination');
  const code = t.tripCode || `TRP-${t.id.slice(0, 8).toUpperCase()}`;

  return {
    id: t.id,
    tripCode: code,
    vehicleReg: vReg,
    vehicleId: t.vehicle_id || t.vehicleId || 'veh-101',
    driverName: dName,
    driverId: t.driver_id || t.driverId || 'drv-201',
    origin: originCity,
    destination: destCity,
    startLocation: { lat: t.start_lat || 12.9716, lng: t.start_lng || 77.5946, address: originCity },
    endLocation: { lat: t.end_lat || 13.0827, lng: t.end_lng || 80.2707, address: destCity },
    status: mapStatusToUi(t.status),
    distanceKm: t.distance ? Number(t.distance) : 250.0,
    durationHours: 5.5,
    idleMinutes: 18,
    startTime: t.start_time ? new Date(t.start_time).toISOString() : new Date().toISOString(),
    endTime: t.end_time ? new Date(t.end_time).toISOString() : null,
    avgSpeed: t.avg_speed ? Number(t.avg_speed) : 48.5,
    fuelConsumedLitres: 45.0
  };
};

export const getTrips = async (req, res) => {
  const { page = 1, limit = 50, status, search, driverId, driverName } = req.query;

  try {
    const where = {};
    if (status && status !== 'all') {
      const dbStatus = status.toLowerCase() === 'completed' ? 'COMPLETED' : status.toLowerCase().includes('transit') ? 'IN_PROGRESS' : status.toUpperCase();
      where.status = { equals: dbStatus };
    }
    if (driverId) {
      where.driver_id = driverId;
    }

    const [dbTrips, total] = await Promise.all([
      prisma.trips.findMany({
        where,
        take: parseInt(limit, 10),
        skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
        orderBy: { created_at: 'desc' },
        include: {
          vehicles: true,
          drivers: {
            include: { users: true }
          }
        }
      }),
      prisma.trips.count({ where })
    ]);

    if (dbTrips && dbTrips.length > 0) {
      let formatted = dbTrips.map(formatTrip);
      if (search) {
        const s = search.toLowerCase();
        formatted = formatted.filter(
          (t) =>
            t.tripCode?.toLowerCase().includes(s) ||
            t.vehicleReg?.toLowerCase().includes(s) ||
            t.driverName?.toLowerCase().includes(s) ||
            t.origin?.toLowerCase().includes(s) ||
            t.destination?.toLowerCase().includes(s)
        );
      }
      return res.json({
        success: true,
        data: formatted,
        meta: { page: parseInt(page, 10), limit: parseInt(limit, 10), total }
      });
    }
  } catch (err) {
    console.warn('Prisma getTrips error, using memory fallback:', err.message);
  }

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

const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export const getTripById = async (req, res) => {
  const { id } = req.params;

  if (isUuid(id)) {
    try {
      const t = await prisma.trips.findUnique({
        where: { id },
        include: {
          vehicles: true,
          drivers: {
            include: { users: true }
          }
        }
      });
      if (t) {
        return res.json({ success: true, data: formatTrip(t) });
      }
    } catch (err) {
      console.warn('Prisma getTripById error:', err.message);
    }
  }

  const trip = TRIPS.find((t) => t.id === id || t.tripCode === id);
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

  const sLat = body.startLocation?.lat != null
    ? Number(body.startLocation.lat)
    : (targetVeh?.lat != null ? Number(targetVeh.lat) : 12.9716);
  const sLng = body.startLocation?.lng != null
    ? Number(body.startLocation.lng)
    : (targetVeh?.lng != null ? Number(targetVeh.lng) : 77.5946);

  let newTrip = null;

  try {
    // Look up vehicle
    let veh = null;
    if (isUuid(body.vehicleId)) {
      veh = await prisma.vehicles.findUnique({ where: { id: body.vehicleId } });
    }
    if (!veh && body.vehicleReg) {
      veh = await prisma.vehicles.findUnique({ where: { registration_number: body.vehicleReg } });
    }
    if (!veh && targetVeh?.registration) {
      veh = await prisma.vehicles.findUnique({ where: { registration_number: targetVeh.registration } });
    }
    if (!veh) {
      veh = await prisma.vehicles.findFirst();
    }

    // Look up driver
    let drv = null;
    const userId = req.user?.id || req.user?.userId;
    if (isUuid(userId)) {
      drv = await prisma.drivers.findFirst({ where: { user_id: userId }, include: { users: true } });
    }
    if (!drv && isUuid(body.driverId)) {
      drv = await prisma.drivers.findUnique({ where: { id: body.driverId }, include: { users: true } });
    }
    if (!drv && targetVeh?.assignedDriverId && isUuid(targetVeh.assignedDriverId)) {
      drv = await prisma.drivers.findUnique({ where: { id: targetVeh.assignedDriverId }, include: { users: true } });
    }
    if (!drv) {
      drv = await prisma.drivers.findFirst({ include: { users: true } });
    }

    if (veh && drv) {
      const createdTrip = await prisma.trips.create({
        data: {
          vehicle_id: veh.id,
          driver_id: drv.id,
          start_time: new Date(),
          start_lat: sLat,
          start_lng: sLng,
          status: 'IN_PROGRESS',
          distance: body.distanceKm ? Number(body.distanceKm) : 0,
          avg_speed: 0
        },
        include: {
          vehicles: true,
          drivers: { include: { users: true } }
        }
      });

      // Update vehicle status in Supabase to on_trip
      try {
        await prisma.vehicles.update({
          where: { id: veh.id },
          data: { status: 'on_trip' }
        });
      } catch (vehErr) {
        console.warn('Vehicle status update error:', vehErr.message);
      }

      newTrip = formatTrip(createdTrip);
      newTrip.origin = body.origin || newTrip.origin;
      newTrip.destination = body.destination || newTrip.destination;
      newTrip.startLocation = body.startLocation || {
        lat: sLat,
        lng: sLng,
        address: body.origin || 'Origin Hub'
      };
      newTrip.endLocation = body.endLocation || {
        lat: 13.0827,
        lng: 80.2707,
        address: body.destination || 'Destination Hub'
      };
    }
  } catch (err) {
    console.warn('Prisma startTrip error, using in-memory fallback:', err.message);
  }

  if (!newTrip) {
    newTrip = {
      id: `trip-${Date.now()}`,
      tripCode: `TRP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleReg: body.vehicleReg || targetVeh?.registration || 'KA-01-EQ-9042',
      vehicleId: body.vehicleId || targetVeh?.id || 'veh-101',
      driverName: body.driverName || req.user?.name || targetVeh?.assignedDriverName || 'Rajesh Kumar',
      driverId: body.driverId || req.user?.id || targetVeh?.assignedDriverId || 'drv-201',
      origin: body.origin || 'Bengaluru ICD Nelamangala',
      destination: body.destination || 'Chennai Port Container Terminal',
      startLocation: body.startLocation || {
        lat: sLat,
        lng: sLng,
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
  }

  TRIPS.unshift(newTrip);

  if (targetVeh) {
    targetVeh.status = 'moving';
    targetVeh.lastGpsUpdate = new Date().toISOString();
    targetVeh.lat = sLat;
    targetVeh.lng = sLng;
  }

  // If driver GPS coordinates provided, anchor geofence
  if (sLat != null && sLng != null) {
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

  if (isUuid(id)) {
    try {
      const dbTrip = await prisma.trips.findUnique({ where: { id } });
      if (dbTrip) {
        const updated = await prisma.trips.update({
          where: { id },
          data: {
            status: 'COMPLETED',
            end_time: new Date(),
            distance: Number(body.distanceKm) || dbTrip.distance || 50.0
          },
          include: {
            vehicles: true,
            drivers: { include: { users: true } }
          }
        });

        // Update vehicle status back to available in Supabase
        if (dbTrip.vehicle_id) {
          try {
            await prisma.vehicles.update({
              where: { id: dbTrip.vehicle_id },
              data: { status: 'available' }
            });
          } catch (vehErr) {
            console.warn('Vehicle status revert error:', vehErr.message);
          }
        }

        const formatted = formatTrip(updated);
        broadcastTripEvent('trip:ended', formatted);
        return res.json({ success: true, data: formatted });
      }
    } catch (err) {
      console.warn('Prisma endTrip error, using memory fallback:', err.message);
    }
  }

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
