import { DEMO_GEOFENCES } from '../../../client/src/api/mockData.js';
import { broadcastGeofenceViolation, broadcastAlert } from '../services/socketService.js';
import { ALERTS } from './alertController.js';
import { VEHICLES } from './vehicleController.js';
import prisma from '../repositories/store.js';

export let GEOFENCES = [...DEMO_GEOFENCES];

// Haversine formula to compute distance in meters between two lat/lon points
export const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Recent violation cache to prevent alert flooding (debounce 30s per vehicle per geofence)
const violationCooldowns = new Map();

/**
 * Check if coordinates violate any active geofence
 */
export const checkGeofenceViolations = (lat, lng, vehicle) => {
  if (lat == null || lng == null) return { hasViolation: false, violations: [] };

  const violations = [];
  const now = Date.now();
  const vehicleReg = vehicle?.registration || vehicle?.vehicleReg || 'KA-01-EQ-9042';

  // 1. Check Restricted Zones (Violation if INSIDE any restricted zone)
  const restrictedZones = GEOFENCES.filter(
    (z) => (z.type || '').toUpperCase() === 'RESTRICTED' && z.center && z.center.length >= 2
  );

  for (const zone of restrictedZones) {
    const distMeters = calculateDistanceMeters(lat, lng, zone.center[0], zone.center[1]);
    const radiusMeters = zone.radius || 5000;
    if (distMeters <= radiusMeters) {
      violations.push({
        zone,
        distMeters,
        reason: `Entered restricted zone "${zone.name}" (distance: ${(distMeters / 1000).toFixed(2)} km, zone radius: ${(radiusMeters / 1000).toFixed(1)} km)`
      });
    }
  }

  // 2. Check Permitted Zones
  // If driver has an explicitly anchored geofence, evaluate against their specific corridor
  const driverAnchorZone = GEOFENCES.find(
    (z) =>
      (z.isDriverAnchor || z.id === `geo-driver-${vehicleReg}`) &&
      (z.vehicleReg === vehicleReg || !z.vehicleReg) &&
      (z.type || '').toUpperCase() === 'PERMITTED' &&
      z.center &&
      z.center.length >= 2
  );

  if (driverAnchorZone) {
    const distMeters = calculateDistanceMeters(lat, lng, driverAnchorZone.center[0], driverAnchorZone.center[1]);
    const radiusMeters = driverAnchorZone.radius || 12000;
    if (distMeters > radiusMeters) {
      violations.push({
        zone: driverAnchorZone,
        distMeters,
        reason: `Exited assigned driver corridor "${driverAnchorZone.name}" (${(distMeters / 1000).toFixed(2)} km from center, allowed radius: ${(radiusMeters / 1000).toFixed(1)} km)`
      });
    }
  } else {
    // If no driver anchor, vehicle is compliant if within ANY permitted corridor
    const permittedZones = GEOFENCES.filter(
      (z) => (z.type || '').toUpperCase() === 'PERMITTED' && z.center && z.center.length >= 2
    );

    if (permittedZones.length > 0) {
      const isInsideAny = permittedZones.some((z) => {
        const d = calculateDistanceMeters(lat, lng, z.center[0], z.center[1]);
        return d <= (z.radius || 5000);
      });

      if (!isInsideAny) {
        violations.push({
          zone: permittedZones[0],
          distMeters: 0,
          reason: `Exited all designated permitted logistics corridors (current coordinates: [${lat.toFixed(4)}, ${lng.toFixed(4)}])`
        });
      }
    }
  }

  if (violations.length > 0) {
    for (const v of violations) {
      const cooldownKey = `${vehicleReg}_${v.zone.id}`;
      const lastTriggered = violationCooldowns.get(cooldownKey) || 0;

      if (now - lastTriggered > 30000) {
        violationCooldowns.set(cooldownKey, now);

        const alertItem = {
          id: `alt-geo-${now}-${Math.floor(Math.random() * 1000)}`,
          category: 'Geofence',
          severity: 'High',
          vehicleReg,
          driverName: vehicle?.assignedDriverName || 'Rajesh Kumar',
          description: v.reason,
          timestamp: new Date().toISOString(),
          status: 'Open',
          location: { lat, lng }
        };

        ALERTS.unshift(alertItem);
        broadcastAlert(alertItem);
        broadcastGeofenceViolation({
          vehicleId: vehicle?.id || vehicleReg,
          registration: vehicleReg,
          geofenceId: v.zone.id,
          geofenceName: v.zone.name,
          lat,
          lng,
          reason: v.reason,
          timestamp: alertItem.timestamp
        });
      }
    }
  }

  return { hasViolation: violations.length > 0, violations };
};

export const getGeofences = async (req, res) => {
  try {
    const dbZones = await prisma.geofences.findMany();
    if (dbZones && dbZones.length > 0) {
      const cityCoords = {
        Mumbai: [19.0760, 72.8777],
        Delhi: [28.6139, 77.2090],
        Bengaluru: [12.9716, 77.5946],
        Hyderabad: [17.3850, 78.4867],
        Chennai: [13.0827, 80.2707],
        Kolkata: [22.5726, 88.3639],
        Pune: [18.5204, 73.8567],
        Ahmedabad: [23.0225, 72.5714]
      };

      const mapped = dbZones.map((z) => {
        let center = [12.9716, 77.5946];
        for (const [cityName, coords] of Object.entries(cityCoords)) {
          if (z.name?.toLowerCase().includes(cityName.toLowerCase())) {
            center = coords;
            break;
          }
        }
        const isRestricted = z.name?.toLowerCase().includes('red') || z.name?.toLowerCase().includes('restrict');
        return {
          id: z.id,
          name: z.name,
          type: isRestricted ? 'Restricted' : 'Permitted',
          center: center,
          radius: z.radius ? Number(z.radius) : 5000,
          color: isRestricted ? '#EF4444' : '#10B981',
          isActive: z.is_active
        };
      });

      const anchors = GEOFENCES.filter((g) => g.isDriverAnchor);
      return res.json({ success: true, data: [...anchors, ...mapped] });
    }
  } catch (err) {
    console.warn('Prisma getGeofences error:', err.message);
  }

  return res.json({ success: true, data: GEOFENCES });
};

/**
 * Explicitly anchor/create a geofence around a driver's exact GPS location
 */
export const anchorDriverGeofence = async (req, res) => {
  const {
    vehicleReg = 'KA-01-EQ-9042',
    driverName = 'Rajesh Kumar',
    latitude,
    longitude,
    lat,
    lng,
    radius = 12000,
    name,
    type = 'Permitted'
  } = req.body;

  const finalLat = latitude != null ? Number(latitude) : Number(lat);
  const finalLng = longitude != null ? Number(longitude) : Number(lng);

  if (isNaN(finalLat) || isNaN(finalLng)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_COORDS', message: 'Valid latitude and longitude are required to anchor geofence' }
    });
  }

  const existingIdx = GEOFENCES.findIndex(
    (g) => g.id === `geo-driver-${vehicleReg}` || (g.isDriverAnchor && g.vehicleReg === vehicleReg)
  );

  const zoneData = {
    id: `geo-driver-${vehicleReg}`,
    name: name || `Active Operating Corridor (${vehicleReg})`,
    type: type,
    center: [finalLat, finalLng],
    radius: Number(radius) || 12000,
    color: type.toUpperCase() === 'RESTRICTED' ? '#EF4444' : '#10B981',
    isDriverAnchor: true,
    vehicleReg,
    driverName,
    anchoredAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    GEOFENCES[existingIdx] = zoneData;
  } else {
    // Put driver's active geofence right at the top
    GEOFENCES.unshift(zoneData);
  }

  // Also update vehicle's current location in VEHICLES store
  const targetVeh = VEHICLES.find((v) => v.registration === vehicleReg || v.id === vehicleReg);
  if (targetVeh) {
    targetVeh.lat = finalLat;
    targetVeh.lng = finalLng;
    targetVeh.lastGpsUpdate = new Date().toISOString();
  }

  return res.status(200).json({
    success: true,
    message: `Geofence successfully anchored on driver's actual GPS location for ${vehicleReg}`,
    data: zoneData
  });
};

export const createGeofence = async (req, res) => {
  const body = req.body;

  let center = body.center;
  if (!center || !Array.isArray(center) || center.length < 2) {
    const activeVeh = VEHICLES.find((v) => v.lat != null && v.lng != null);
    center = activeVeh ? [activeVeh.lat, activeVeh.lng] : [12.9716, 77.5946];
  }

  const radius = body.radius ? Number(body.radius) : 10000;
  const isRestricted = (body.type || '').toUpperCase() === 'RESTRICTED';

  try {
    const owner = await prisma.owners.findFirst();
    if (owner) {
      const dbZone = await prisma.geofences.create({
        data: {
          owner_id: owner.id,
          name: body.name || 'New Logistics Corridor',
          radius: radius,
          is_active: true,
          polygon: { center, type: body.type || 'Permitted' }
        }
      });

      const newG = {
        id: dbZone.id,
        name: dbZone.name,
        type: isRestricted ? 'Restricted' : 'Permitted',
        center,
        radius,
        color: isRestricted ? '#EF4444' : '#10B981',
        isActive: true,
        isDriverAnchor: Boolean(body.isDriverAnchor),
        vehicleReg: body.vehicleReg || null
      };

      GEOFENCES.unshift(newG);
      return res.status(201).json({ success: true, data: newG });
    }
  } catch (err) {
    console.warn('Prisma createGeofence error, using fallback:', err.message);
  }

  const newG = {
    id: `geo-${Date.now()}`,
    name: body.name || 'New Logistics Corridor',
    type: body.type || 'Permitted',
    center,
    radius,
    color: isRestricted ? '#EF4444' : '#10B981',
    isDriverAnchor: Boolean(body.isDriverAnchor),
    vehicleReg: body.vehicleReg || null
  };

  GEOFENCES.push(newG);
  return res.status(201).json({ success: true, data: newG });
};

export const deleteGeofence = async (req, res) => {
  const { id } = req.params;
  const isUuid = typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (isUuid) {
    try {
      await prisma.geofences.delete({ where: { id } });
    } catch (err) {
      console.warn('Prisma deleteGeofence error:', err.message);
    }
  }

  GEOFENCES = GEOFENCES.filter((g) => g.id !== id);
  return res.json({ success: true, data: { id, deleted: true } });
};

