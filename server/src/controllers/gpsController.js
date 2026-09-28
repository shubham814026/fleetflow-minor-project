import { broadcastGpsUpdate } from '../services/socketService.js';
import { VEHICLES } from './vehicleController.js';
import { checkGeofenceViolations } from './geofenceController.js';

let GPS_LOGS_STORE = [];

export const ingestGPSPoint = async (req, res) => {
  const { tripId, vehicleId, latitude, longitude, speed, heading, accuracy, timestamp } = req.body;

  // Validation according to Requirement 10
  if (latitude == null || latitude < -90 || latitude > 90) {
    return res.status(422).json({
      success: false,
      error: { code: 'INVALID_COORDINATES', message: 'Latitude must be between -90 and 90' }
    });
  }

  if (longitude == null || longitude < -180 || longitude > 180) {
    return res.status(422).json({
      success: false,
      error: { code: 'INVALID_COORDINATES', message: 'Longitude must be between -180 and 180' }
    });
  }

  if (speed != null && speed < 0) {
    return res.status(422).json({
      success: false,
      error: { code: 'INVALID_SPEED', message: 'Speed must be non-negative' }
    });
  }

  const newPoint = {
    id: `gps-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    tripId: tripId || 'trip-901',
    vehicleId: vehicleId || 'veh-101',
    driverId: req.user?.userId || 'drv-201',
    latitude,
    longitude,
    speed: speed || 0,
    heading: heading || 0,
    accuracy: accuracy || 5,
    timestamp: timestamp || new Date().toISOString(),
    synced: true
  };

  GPS_LOGS_STORE.push(newPoint);

  // Update vehicle live status in store
  const targetVeh = VEHICLES.find((v) => v.id === newPoint.vehicleId || v.registration === vehicleId);
  if (targetVeh) {
    targetVeh.lat = latitude;
    targetVeh.lng = longitude;
    targetVeh.speed = speed || 0;
    targetVeh.heading = heading || 0;
    targetVeh.lastGpsAt = new Date().toISOString();

    // Check geofence compliance in real time
    const { hasViolation } = checkGeofenceViolations(latitude, longitude, targetVeh);
    if (hasViolation) {
      targetVeh.status = 'geofence_violation';
    } else {
      targetVeh.status = speed > 5 ? 'moving' : 'idle';
    }
  }

  // Broadcast real-time Socket.IO update (Requirement 15)
  broadcastGpsUpdate({
    vehicleId: targetVeh ? targetVeh.id : newPoint.vehicleId,
    registration: targetVeh ? targetVeh.registration : 'KA-01-EQ-9042',
    lat: latitude,
    lng: longitude,
    speed: speed || 0,
    heading: heading || 0,
    status: targetVeh?.status || (speed > 5 ? 'moving' : 'idle'),
    timestamp: newPoint.timestamp
  });

  return res.status(201).json({ success: true, data: newPoint });
};

export const syncOfflineGPSBatch = async (req, res) => {
  const { points = [] } = req.body;
  if (!Array.isArray(points)) {
    return res.status(422).json({
      success: false,
      error: { code: 'INVALID_BATCH', message: 'Points payload must be an array' }
    });
  }

  let synced = 0;
  let duplicates = 0;
  let failed = 0;

  for (const pt of points) {
    if (pt.latitude != null && pt.longitude != null) {
      // Basic deduplication check by timestamp
      const exists = GPS_LOGS_STORE.some(
        (existing) => existing.timestamp === pt.timestamp && existing.tripId === pt.tripId
      );
      if (exists) {
        duplicates++;
      } else {
        GPS_LOGS_STORE.push({
          id: `gps-sync-${Date.now()}-${synced}`,
          tripId: pt.tripId || 'trip-901',
          vehicleId: pt.vehicleId || 'veh-101',
          driverId: req.user?.userId || 'drv-201',
          latitude: pt.latitude,
          longitude: pt.longitude,
          speed: pt.speed || 0,
          heading: pt.heading || 0,
          accuracy: pt.accuracy || 5,
          timestamp: pt.timestamp || new Date().toISOString(),
          synced: true
        });
        synced++;
      }
    } else {
      failed++;
    }
  }

  return res.json({
    success: true,
    data: { synced, duplicates, failed, message: 'Offline GPS points processed successfully' }
  });
};

export const getLiveVehicles = async (req, res) => {
  const liveVehicles = VEHICLES.map((v) => ({
    vehicleId: v.id,
    registrationNumber: v.registration,
    driverId: v.assignedDriverId || 'drv-201',
    driverName: v.assignedDriverName || 'Rajesh Kumar',
    latitude: v.lat,
    longitude: v.lng,
    speed: v.speed,
    heading: v.heading,
    status: v.status,
    lastGpsAt: v.lastGpsUpdate || new Date().toISOString()
  }));

  return res.json({ success: true, data: liveVehicles });
};

export const getTripRoutePoints = async (req, res) => {
  const { tripId } = req.params;
  const points = GPS_LOGS_STORE.filter((p) => p.tripId === tripId);
  return res.json({ success: true, data: points });
};
