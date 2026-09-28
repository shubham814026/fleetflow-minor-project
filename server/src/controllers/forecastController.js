import { mlServiceClient } from '../services/mlServiceClient.js';

export const getForecast = async (req, res) => {
  const data = await mlServiceClient.getDemandForecast();
  return res.json({ success: true, data });
};
