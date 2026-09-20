import { logAuditEvent } from './auditController.js';

// Central in-memory system settings configuration
let SYSTEM_SETTINGS = {
  gpsIntervalSec: 15,
  secondaryAuthTimeoutMins: 15,
  enableSoundAlerts: true,
  enableOfflineBuffering: true,
  autoRecenterMap: true,
  mapTileTheme: 'Dark Navigation',
  speedLimitThresholdKmH: 80,
  fuelPricePerLiter: 94.50,
  alertEmailNotifications: true,
  lastUpdatedAt: new Date().toISOString(),
  updatedBy: 'System Default'
};

export const getSettings = async (req, res) => {
  return res.json({
    success: true,
    data: SYSTEM_SETTINGS
  });
};

export const updateSettings = async (req, res) => {
  const updates = req.body || {};

  if (updates.gpsIntervalSec !== undefined) {
    SYSTEM_SETTINGS.gpsIntervalSec = Math.max(5, Math.min(120, parseInt(updates.gpsIntervalSec, 10)));
  }

  if (updates.secondaryAuthTimeoutMins !== undefined) {
    SYSTEM_SETTINGS.secondaryAuthTimeoutMins = Math.max(5, Math.min(120, parseInt(updates.secondaryAuthTimeoutMins, 10)));
  }

  if (updates.enableSoundAlerts !== undefined) {
    SYSTEM_SETTINGS.enableSoundAlerts = Boolean(updates.enableSoundAlerts);
  }

  if (updates.enableOfflineBuffering !== undefined) {
    SYSTEM_SETTINGS.enableOfflineBuffering = Boolean(updates.enableOfflineBuffering);
  }

  if (updates.autoRecenterMap !== undefined) {
    SYSTEM_SETTINGS.autoRecenterMap = Boolean(updates.autoRecenterMap);
  }

  if (updates.mapTileTheme !== undefined) {
    SYSTEM_SETTINGS.mapTileTheme = String(updates.mapTileTheme);
  }

  if (updates.speedLimitThresholdKmH !== undefined) {
    SYSTEM_SETTINGS.speedLimitThresholdKmH = Math.max(40, Math.min(140, parseInt(updates.speedLimitThresholdKmH, 10)));
  }

  if (updates.fuelPricePerLiter !== undefined) {
    SYSTEM_SETTINGS.fuelPricePerLiter = Math.max(50, Math.min(200, parseFloat(updates.fuelPricePerLiter)));
  }

  if (updates.alertEmailNotifications !== undefined) {
    SYSTEM_SETTINGS.alertEmailNotifications = Boolean(updates.alertEmailNotifications);
  }

  SYSTEM_SETTINGS.lastUpdatedAt = new Date().toISOString();
  SYSTEM_SETTINGS.updatedBy = req.user?.email || 'Admin';

  logAuditEvent({
    user: req.user?.email || 'admin@fleetflow.com',
    role: req.user?.role || 'SUPER_ADMIN',
    action: 'SYSTEM_SETTINGS_UPDATED',
    target: 'System & Telemetry Preferences',
    ip: req.ip || '127.0.0.1'
  });

  return res.json({
    success: true,
    message: 'System preferences saved successfully',
    data: SYSTEM_SETTINGS
  });
};
