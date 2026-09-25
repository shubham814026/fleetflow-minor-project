import { mlServiceClient } from '../services/mlServiceClient.js';

export const getFuelInsights = async (req, res) => {
  const data = await mlServiceClient.getFuelInsights();
  return res.json({ success: true, data });
};

export const getFraudInsights = async (req, res) => {
  const data = await mlServiceClient.getFraudInsights();
  return res.json({ success: true, data });
};

export const getMaintenanceInsights = async (req, res) => {
  const data = await mlServiceClient.getMaintenancePrediction(req.params.vehicleId);
  return res.json({ success: true, data });
};
