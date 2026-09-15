import { DEMO_FUEL_METRICS } from '../../../client/src/api/mockData.js';
import { mlServiceClient } from '../services/mlServiceClient.js';

export const getFuelMetrics = async (req, res) => {
  try {
    const liveInsights = await mlServiceClient.getFuelInsights();
    const responseData = {
      ...DEMO_FUEL_METRICS,
      aiInsights: liveInsights
    };
    return res.json({ success: true, data: responseData });
  } catch (err) {
    return res.json({ success: true, data: DEMO_FUEL_METRICS });
  }
};

export const addFuelLog = async (req, res) => {
  const body = req.body;
  const newLog = {
    id: `fuel-${Date.now()}`,
    vehicleId: body.vehicleId || 'veh-101',
    date: body.date || new Date().toISOString(),
    litres: body.litres || 50,
    cost: body.cost || 4800,
    odometer: body.odometer || 142500
  };

  return res.status(201).json({ success: true, data: newLog });
};
