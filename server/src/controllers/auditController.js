import { DEMO_AUDIT_LOGS } from '../../../client/src/api/mockData.js';

// Central in-memory audit log ledger
export let AUDIT_LOGS_STORE = [...DEMO_AUDIT_LOGS];

/**
 * Log a structured audit event to the ledger
 */
export const logAuditEvent = ({ user, role, action, target, ip, timestamp }) => {
  const newEntry = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    user: user || 'system@smartfleet.ai',
    role: role || 'Super Admin',
    action: action || 'SECURITY_EVENT',
    target: target || 'System Resource',
    timestamp: timestamp || new Date().toISOString(),
    ip: ip || '127.0.0.1'
  };

  AUDIT_LOGS_STORE.unshift(newEntry);
  return newEntry;
};

export const getAuditLogs = async (req, res) => {
  const { search, role, action, limit = 50 } = req.query;
  let results = [...AUDIT_LOGS_STORE];

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (log) =>
        (log.user && log.user.toLowerCase().includes(q)) ||
        (log.action && log.action.toLowerCase().includes(q)) ||
        (log.target && log.target.toLowerCase().includes(q)) ||
        (log.role && log.role.toLowerCase().includes(q))
    );
  }

  if (role && role !== 'ALL') {
    results = results.filter(
      (log) => log.role && log.role.toLowerCase().replace(/[\s_-]/g, '') === role.toLowerCase().replace(/[\s_-]/g, '')
    );
  }

  if (action && action !== 'ALL') {
    results = results.filter(
      (log) => log.action && log.action.toLowerCase().includes(action.toLowerCase())
    );
  }

  const capped = results.slice(0, parseInt(limit, 10) || 50);

  return res.json({
    success: true,
    data: capped,
    total: results.length
  });
};

export const createAuditLog = async (req, res) => {
  const { action, target, role, user } = req.body || {};

  if (!action) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_ACTION', message: 'Action description is required' }
    });
  }

  const entry = logAuditEvent({
    user: user || req.user?.email || 'admin@fleetflow.com',
    role: role || req.user?.role || 'Super Admin',
    action,
    target: target || 'Manual Audit Entry',
    ip: req.ip || '127.0.0.1'
  });

  return res.status(201).json({ success: true, data: entry });
};

