import { DEMO_GEOFENCES } from '../../../client/src/api/mockData.js';
import { broadcastGeofenceViolation } from '../services/socketService.js';

let GEOFENCES = [...DEMO_GEOFENCES];

export const getGeofences = async (req, res) => {
  return res.json({ success: true, data: GEOFENCES });
};

export const createGeofence = async (req, res) => {
  const body = req.body;
  const newG = {
    id: `geo-${Date.now()}`,
    name: body.name || 'New Logistics Corridor',
    type: body.type || 'PERMITTED',
    center: body.center || [12.9716, 77.5946],
    radius: body.radius || 5000,
    color: body.type === 'RESTRICTED' ? '#EF4444' : '#10B981'
  };

  GEOFENCES.push(newG);
  return res.status(201).json({ success: true, data: newG });
};

export const deleteGeofence = async (req, res) => {
  const { id } = req.params;
  GEOFENCES = GEOFENCES.filter((g) => g.id !== id);
  return res.json({ success: true, data: { id, deleted: true } });
};
