import apiClient from '../services/apiClient';
import {
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  INITIAL_TRIPS,
  INITIAL_ALERTS,
  DEMO_FUEL_METRICS,
  DEMO_UTILISATION,
  DEMO_GEOFENCES,
  DEMO_SALARIES,
  DEMO_AUDIT_LOGS
} from './mockData';

// Local volatile storage for dynamic demo updates when backend is offline
let mockVehicles = [...INITIAL_VEHICLES];
let mockDrivers = [...INITIAL_DRIVERS];
let mockTrips = [...INITIAL_TRIPS];
let mockAlerts = [...INITIAL_ALERTS];

// Helper to simulate network latency for realistic state testing
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const authApi = {
  login: async (email, password, role = 'Super Admin') => {
    try {
      const res = await apiClient.post('/auth/login', { email, password, role });
      return res.data;
    } catch (e) {
      await delay();
      const userObj = {
        id: email.includes('driver') ? 'drv-201' : 'usr-100',
        name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        email,
        role: email.includes('driver') ? 'Driver' : role || 'Super Admin',
        token: `jwt_token_demo_${Date.now()}`
      };
      return { token: userObj.token, user: userObj };
    }
  },

  verifySecondaryAuth: async (secondaryId, secondaryPassword) => {
    try {
      const res = await apiClient.post('/auth/secondary-verify', { secondaryId, secondaryPassword });
      return res.data;
    } catch (e) {
      await delay(400);
      if (secondaryId === 'SEC-1234' && secondaryPassword === 'admin123') {
        const token = `secondary_token_${Date.now()}`;
        sessionStorage.setItem('fleetflow_secondary_token', token);
        return { success: true, token, message: 'Secondary Authentication Verified' };
      }
      // Demo validation accept any secondary password with > 3 chars for ease of testing, unless specific error test
      if (secondaryId && secondaryPassword && secondaryPassword.length >= 3) {
        const token = `secondary_token_${Date.now()}`;
        sessionStorage.setItem('fleetflow_secondary_token', token);
        return { success: true, token, message: 'Secondary Authentication Verified' };
      }
      throw new Error('Invalid Secondary Credentials');
    }
  }
};

export const vehicleApi = {
  getAll: async () => {
    try {
      const res = await apiClient.get('/vehicles');
      return res.data;
    } catch (e) {
      await delay();
      return mockVehicles;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(`/vehicles/${id}`);
      return res.data;
    } catch (e) {
      await delay();
      const v = mockVehicles.find((x) => x.id === id) || mockVehicles[0];
      return v;
    }
  },

  create: async (vehicleData) => {
    try {
      const res = await apiClient.post('/vehicles', vehicleData);
      return res.data;
    } catch (e) {
      await delay();
      const newV = {
        id: `veh-${Date.now()}`,
        status: 'moving',
        lat: 12.9716 + (Math.random() - 0.5) * 0.1,
        lng: 77.5946 + (Math.random() - 0.5) * 0.1,
        speed: 45,
        heading: 90,
        fuelLevel: 100,
        odometer: 1000,
        lastGpsUpdate: new Date().toISOString(),
        ...vehicleData
      };
      mockVehicles.unshift(newV);
      return newV;
    }
  },

  updateStatus: async (id, status) => {
    try {
      const res = await apiClient.patch(`/vehicles/${id}/status`, { status });
      return res.data;
    } catch (e) {
      await delay();
      mockVehicles = mockVehicles.map((v) => (v.id === id ? { ...v, status } : v));
      return { id, status };
    }
  },

  getUtilisation: async () => {
    try {
      const res = await apiClient.get('/vehicles/utilisation');
      return res.data;
    } catch (e) {
      await delay();
      return DEMO_UTILISATION;
    }
  }
};

export const driverApi = {
  getAll: async () => {
    try {
      const res = await apiClient.get('/drivers');
      return res.data;
    } catch (e) {
      await delay();
      return mockDrivers;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(`/drivers/${id}`);
      return res.data;
    } catch (e) {
      await delay();
      return mockDrivers.find((d) => d.id === id) || mockDrivers[0];
    }
  },

  create: async (driverData) => {
    try {
      const res = await apiClient.post('/drivers', driverData);
      return res.data;
    } catch (e) {
      await delay();
      const newD = {
        id: `drv-${Date.now()}`,
        status: 'Active',
        safetyScore: 90,
        totalTrips: 0,
        rating: 5.0,
        joinedDate: new Date().toISOString().split('T')[0],
        ...driverData
      };
      mockDrivers.unshift(newD);
      return newD;
    }
  },

  getSafetyMetrics: async () => {
    try {
      const res = await apiClient.get('/drivers/safety-metrics');
      return res.data;
    } catch (e) {
      await delay();
      return {
        overallSafetyScore: 89,
        totalSpeedingEvents: 14,
        harshBrakingEvents: 8,
        harshAccelerationEvents: 5,
        leaderboard: mockDrivers.sort((a, b) => b.safetyScore - a.safetyScore)
      };
    }
  }
};

export const tripApi = {
  getAll: async () => {
    try {
      const res = await apiClient.get('/trips');
      return res.data;
    } catch (e) {
      await delay();
      return mockTrips;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(`/trips/${id}`);
      return res.data;
    } catch (e) {
      await delay();
      return mockTrips.find((t) => t.id === id) || mockTrips[0];
    }
  },

  startTrip: async (tripData) => {
    try {
      const res = await apiClient.post('/trips/start', tripData);
      return res.data;
    } catch (e) {
      await delay();
      const newTrip = {
        id: `trip-${Date.now()}`,
        tripCode: `TRP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'In Transit',
        distanceKm: 0,
        durationHours: 0.1,
        idleMinutes: 0,
        startTime: new Date().toISOString(),
        endTime: null,
        avgSpeed: 0,
        fuelConsumedLitres: 0,
        ...tripData
      };
      mockTrips.unshift(newTrip);
      return newTrip;
    }
  },

  endTrip: async (id, summaryData) => {
    try {
      const res = await apiClient.post(`/trips/${id}/end`, summaryData);
      return res.data;
    } catch (e) {
      await delay();
      mockTrips = mockTrips.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'Completed',
              endTime: new Date().toISOString(),
              ...summaryData
            }
          : t
      );
      return { id, status: 'Completed', ...summaryData };
    }
  }
};

export const gpsApi = {
  sendPoints: async (point) => {
    try {
      const res = await apiClient.post('/gps/points', point);
      return res.data;
    } catch (e) {
      // Quietly acknowledge live endpoint missing in demo mode
      return { success: true, synced: true, timestamp: new Date().toISOString() };
    }
  },

  syncOfflinePoints: async (pointsArray) => {
    try {
      const res = await apiClient.post('/gps/sync-offline', { points: pointsArray });
      return res.data;
    } catch (e) {
      await delay(200);
      return { success: true, count: pointsArray.length, message: 'Offline GPS points synchronized' };
    }
  }
};

export const fuelApi = {
  getMetrics: async () => {
    try {
      const res = await apiClient.get('/fuel/metrics');
      return res.data;
    } catch (e) {
      await delay();
      return DEMO_FUEL_METRICS;
    }
  },

  addFuelLog: async (log) => {
    try {
      const res = await apiClient.post('/fuel/logs', log);
      return res.data;
    } catch (e) {
      await delay();
      return { id: `fuel-${Date.now()}`, ...log };
    }
  }
};

export const alertApi = {
  getAll: async () => {
    try {
      const res = await apiClient.get('/alerts');
      return res.data;
    } catch (e) {
      await delay();
      return mockAlerts;
    }
  },

  sendSOS: async (sosPayload) => {
    try {
      const res = await apiClient.post('/alerts/sos', sosPayload);
      return res.data;
    } catch (e) {
      await delay();
      const newSOS = {
        id: `alt-sos-${Date.now()}`,
        category: 'SOS',
        severity: 'Critical',
        vehicleReg: sosPayload.vehicleReg || 'KA-01-EQ-9042',
        driverName: sosPayload.driverName || 'Current Driver',
        description: `EMERGENCY SOS ALERT Triggered at Lat: ${sosPayload.lat?.toFixed(4)}, Lng: ${sosPayload.lng?.toFixed(4)}`,
        timestamp: new Date().toISOString(),
        status: 'Open',
        location: { lat: sosPayload.lat, lng: sosPayload.lng }
      };
      mockAlerts.unshift(newSOS);
      return newSOS;
    }
  },

  updateStatus: async (id, status) => {
    try {
      const res = await apiClient.patch(`/alerts/${id}`, { status });
      return res.data;
    } catch (e) {
      await delay();
      mockAlerts = mockAlerts.map((a) => (a.id === id ? { ...a, status } : a));
      return { id, status };
    }
  }
};

export const forecastApi = {
  getDemand: async () => {
    try {
      const res = await apiClient.get('/forecast/demand');
      return res.data;
    } catch (e) {
      await delay();
      return {
        nextWeekDemandTrips: 184,
        peakDay: 'Friday',
        predictedVehicleDeficit: 3,
        demandByRegion: [
          { region: 'Bengaluru ICD', trips: 64, trend: '+12%' },
          { region: 'Mumbai JNPT', trips: 78, trend: '+18%' },
          { region: 'Delhi NCR', trips: 42, trend: '+5%' }
        ]
      };
    }
  }
};

export const maintenanceApi = {
  getRecords: async () => {
    try {
      const res = await apiClient.get('/maintenance');
      return res.data;
    } catch (e) {
      await delay();
      return [
        { id: 'm-1', vehicleReg: 'KA-01-EQ-9042', serviceType: 'Engine Oil & Filter', lastServiceDate: '2026-05-10', nextServiceDate: '2026-09-10', odometer: 142500, status: 'Due Soon' },
        { id: 'm-2', vehicleReg: 'MH-12-PQ-4821', serviceType: 'Tire Alignment & Rotation', lastServiceDate: '2026-02-15', nextServiceDate: '2026-08-15', odometer: 89400, status: 'Overdue' },
        { id: 'm-3', vehicleReg: 'DL-01-AB-1234', serviceType: 'Brake Pad Replacement', lastServiceDate: '2026-07-01', nextServiceDate: '2026-11-01', odometer: 64200, status: 'Due' }
      ];
    }
  }
};

export const geofenceApi = {
  getAll: async () => {
    try {
      const res = await apiClient.get('/geofences');
      return res.data;
    } catch (e) {
      await delay();
      return DEMO_GEOFENCES;
    }
  },

  create: async (zone) => {
    try {
      const res = await apiClient.post('/geofences', zone);
      return res.data;
    } catch (e) {
      await delay();
      return { id: `geo-${Date.now()}`, ...zone };
    }
  }
};

export const salaryApi = {
  getAll: async () => {
    try {
      const res = await apiClient.get('/salaries');
      return res.data;
    } catch (e) {
      await delay();
      return DEMO_SALARIES;
    }
  },

  updateStatus: async (id, status, txnId) => {
    try {
      const res = await apiClient.patch(`/salaries/${id}`, { status, txnId });
      return res.data;
    } catch (e) {
      await delay();
      return { id, status, txnId: txnId || `TXN${Date.now().toString().slice(-8)}` };
    }
  }
};

export const auditApi = {
  getAll: async () => {
    try {
      const res = await apiClient.get('/audit-logs');
      return res.data;
    } catch (e) {
      await delay();
      return DEMO_AUDIT_LOGS;
    }
  }
};
