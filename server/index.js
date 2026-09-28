import http from 'http';
import app from './app.js';
import { PORT, CLIENT_URL } from './src/config/env.js';
import { initSocket } from './src/services/socketService.js';
import { initGPSOfflineDetector } from './src/jobs/gpsOfflineDetector.js';
import { getVehicles } from './src/controllers/vehicleController.js';
import { ALERTS } from './src/controllers/alertController.js';

const server = http.createServer(app);

// Initialize Socket.IO Server
initSocket(server, CLIENT_URL);

// Initialize background GPS offline detector job (Requirement 14)
initGPSOfflineDetector(
  async () => {
    // Adapter to fetch vehicles list for background job
    return new Promise((resolve) => {
      getVehicles({ query: {} }, {
        json: (data) => resolve(data.data || [])
      });
    });
  },
  async (newAlert) => {
    ALERTS.unshift(newAlert);
  }
);

server.listen(PORT, () => {
  console.log(`SmartFleet AI Backend Gateway running on http://localhost:${PORT}`);
  console.log(`Swagger Interactive Docs available at http://localhost:${PORT}/api/docs`);
});
