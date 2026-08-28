import { INITIAL_ALERTS } from '../../../client/src/api/mockData.js';

let ALERTS = [...INITIAL_ALERTS];

export const getAlerts = async (req, res) => {
  const { category, severity, status } = req.query;
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
