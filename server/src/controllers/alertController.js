import { INITIAL_ALERTS } from '../../../client/src/api/mockData.js';
import prisma from '../repositories/store.js';

let ALERTS = [...INITIAL_ALERTS];

export const getAlerts = async (req, res) => {
  const { category, severity, status } = req.query;

  try {
    const dbAlerts = await prisma.geofence_alerts.findMany({
      take: 40,
      orderBy: { created_at: 'desc' },
      include: {
        vehicles: true,
        drivers: { include: { users: true } },
        geofences: true
      }
    });

    if (dbAlerts && dbAlerts.length > 0) {
      let formatted = dbAlerts.map((a) => ({
        id: a.id,
        category: a.alert_type === 'EXIT' ? 'Geofence' : 'Route',
        severity: a.alert_type === 'EXIT' ? 'High' : 'Medium',
        vehicleReg: a.vehicles?.registration_number || 'KA-01-EQ-9042',
        driverName: a.drivers?.users?.name || 'Fleet Driver',
        description: `${a.alert_type === 'EXIT' ? 'Vehicle exited' : 'Vehicle entered'} zone: ${a.geofences?.name || 'Corridor'}`,
        timestamp: a.created_at ? new Date(a.created_at).toISOString() : new Date().toISOString(),
        status: a.mail_sent ? 'Reviewed' : 'Open',
        location: { lat: 12.9716, lng: 77.5946 }
      }));

      // Combine with any live runtime alerts (e.g. SOS or Fraud)
      const memAlerts = ALERTS.filter((a) => a.id.startsWith('alt-') || a.category.toLowerCase() === 'fraud');
      const combined = [...memAlerts, ...formatted];

      let filtered = combined;
      if (category) {
        filtered = filtered.filter((a) => a.category.toLowerCase() === category.toLowerCase());
      }
      if (status) {
        filtered = filtered.filter((a) => a.status.toLowerCase() === status.toLowerCase());
      }
      return res.json({ success: true, data: filtered });
    }
  } catch (err) {
    console.warn('Prisma getAlerts error, using fallback:', err.message);
  }

  let filtered = [...ALERTS];
  if (category) {
    filtered = filtered.filter((a) => a.category.toLowerCase() === category.toLowerCase());
  }
  if (status) {
    filtered = filtered.filter((a) => a.status.toLowerCase() === status.toLowerCase());
  }

  return res.json({ success: true, data: filtered });
};

export const updateAlertStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await prisma.geofence_alerts.update({
      where: { id },
      data: { mail_sent: status.toLowerCase() === 'resolved' || status.toLowerCase() === 'reviewed' }
    });
  } catch (err) {
    // ignore if not a db uuid
  }

  let updated = null;
  ALERTS = ALERTS.map((a) => {
    if (a.id === id) {
      updated = { ...a, status };
      return updated;
    }
    return a;
  });

  return res.json({ success: true, data: updated || { id, status } });
};

export const getFraudAlerts = async (req, res) => {
  const fraudList = ALERTS.filter((a) => a.category.toLowerCase() === 'fraud');
  return res.json({ success: true, data: fraudList });
};

export { ALERTS };
