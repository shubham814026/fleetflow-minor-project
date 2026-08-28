import { DEMO_AUDIT_LOGS } from '../../../client/src/api/mockData.js';
import { AUDIT_LOGS } from './authController.js';

export const getAuditLogs = async (req, res) => {
  const combined = [...AUDIT_LOGS, ...DEMO_AUDIT_LOGS];
  return res.json({ success: true, data: combined });
};
