import { INITIAL_ALERTS } from '../../../client/src/api/mockData.js';
import { mlServiceClient } from '../services/mlServiceClient.js';

let ALERTS = [...INITIAL_ALERTS];

export const getAlerts = async (req, res) => {
  const { category, severity, status } = req.query;

  // Enrich with live ML Model 7.3 Isolation Forest fraud insights
  try {
    const fraudInsights = await mlServiceClient.getFraudInsights();
    const liveFraudAlerts = fraudInsights
      .filter((f) => f.isAnomaly)
      .map((f) => ({
        id: f.id,
        category: 'Fraud',
        severity: f.severity || 'High',
        vehicleReg: f.vehicleReg,
        driverName: 'Rajesh Kumar',
        description: f.reason,
        status: 'Open',
        timestamp: new Date().toISOString(),
        fraudRiskScore: f.rawRiskScore,
        isLiveModel: true
      }));

    const existingIds = new Set(ALERTS.map((a) => a.id));
    for (const fa of liveFraudAlerts) {
      if (!existingIds.has(fa.id)) {
        ALERTS.unshift(fa);
        existingIds.add(fa.id);
      }
    }
  } catch (err) {
    // Graceful fallback to static alerts if ML microservice is busy
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
