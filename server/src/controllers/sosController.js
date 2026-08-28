import { broadcastAlert } from '../services/socketService.js';

let SOS_ALERTS = [];

export const triggerSOS = async (req, res) => {
  const { driverId, vehicleId, vehicleReg, driverName, lat, lng } = req.body;

  const newSOS = {
    id: `alt-sos-${Date.now()}`,
    category: 'SOS',
    severity: 'Critical',
    vehicleReg: vehicleReg || 'KA-01-EQ-9042',
    driverName: driverName || req.user?.name || 'Driver',
    description: `EMERGENCY SOS ALERT Triggered at Lat: ${lat?.toFixed(4)}, Lng: ${lng?.toFixed(4)}`,
    timestamp: new Date().toISOString(),
    status: 'Open',
    location: { lat, lng }
  };

  SOS_ALERTS.unshift(newSOS);
  broadcastAlert(newSOS);

  return res.status(201).json({ success: true, data: newSOS });
};

export const getActiveSOS = async (req, res) => {
  const active = SOS_ALERTS.filter((s) => s.status === 'Open');
  return res.json({ success: true, data: active });
};

export const resolveSOS = async (req, res) => {
  const { id } = req.params;
  SOS_ALERTS = SOS_ALERTS.map((s) => (s.id === id ? { ...s, status: 'Resolved' } : s));
  return res.json({ success: true, data: { id, status: 'Resolved' } });
};

export { SOS_ALERTS };
