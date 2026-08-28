import cron from 'node-cron';
import { GPS_OFFLINE_THRESHOLD_MINS } from '../config/env.js';
import { broadcastAlert } from '../services/socketService.js';

let activeVehiclesStore = [];

export const initGPSOfflineDetector = (getVehiclesFn, createAlertFn) => {
  // Schedule to run every 1 minute
  cron.schedule('* * * * *', async () => {
    try {
      const vehicles = await getVehiclesFn();
      const cutoffTime = new Date(Date.now() - GPS_OFFLINE_THRESHOLD_MINS * 60 * 1000);

      for (const veh of vehicles) {
        if (veh.status !== 'offline' && veh.lastGpsAt) {
          const lastUpdate = new Date(veh.lastGpsAt);
          if (lastUpdate < cutoffTime) {
            console.warn(`Vehicle ${veh.registrationNumber} offline > ${GPS_OFFLINE_THRESHOLD_MINS} mins. Creating alert.`);
            const newAlert = {
              id: `alt-off-${Date.now()}`,
              category: 'GPS Offline',
              severity: 'Medium',
              vehicleReg: veh.registrationNumber,
              driverName: veh.assignedDriverName || 'Driver',
              description: `GPS signal lost for over ${GPS_OFFLINE_THRESHOLD_MINS} minutes. Vehicle marked offline.`,
              timestamp: new Date().toISOString(),
              status: 'Open'
            };

            await createAlertFn(newAlert);
            broadcastAlert(newAlert);
          }
        }
      }
    } catch (err) {
      console.error('Error running GPS offline background detector:', err);
    }
  });
};
