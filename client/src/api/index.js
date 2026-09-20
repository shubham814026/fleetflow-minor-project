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
      const payload = res.data?.data || res.data;
      return payload;
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
      const secToken = res.data?.secondaryToken || res.data?.token;
      if (secToken) {
        sessionStorage.setItem('fleetflow_secondary_token', secToken);
      }
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
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : mockVehicles;
    } catch (e) {
      await delay();
      return mockVehicles;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(`/vehicles/${id}`);
      return res.data?.data || res.data;
    } catch (e) {
      await delay();
      const v = mockVehicles.find((x) => x.id === id) || mockVehicles[0];
      return v;
    }
  },

  create: async (vehicleData) => {
    try {
      const res = await apiClient.post('/vehicles', vehicleData);
      const created = res.data?.data || res.data;
      mockVehicles.unshift(created);
      return created;
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
      return res.data?.data || res.data;
    } catch (e) {
      await delay();
      mockVehicles = mockVehicles.map((v) => (v.id === id ? { ...v, status } : v));
      return { id, status };
    }
  },

  getUtilisation: async () => {
    try {
      const res = await apiClient.get('/vehicles/utilisation');
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : DEMO_UTILISATION;
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
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : mockDrivers;
    } catch (e) {
      await delay();
      return mockDrivers;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(`/drivers/${id}`);
      return res.data?.data || res.data;
    } catch (e) {
      await delay();
      return mockDrivers.find((d) => d.id === id) || mockDrivers[0];
    }
  },

  create: async (driverData) => {
    try {
      const res = await apiClient.post('/drivers', driverData);
      const created = res.data?.data || res.data;
      mockDrivers.unshift(created);
      return created;
    } catch (e) {
      await delay();
      const newD = {
        id: `drv-${Date.now()}`,
        status: 'Active',
        safetyScore: 92,
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
      const data = res.data?.data || res.data;
      if (data && data.overallSafetyScore !== undefined) {
        return data;
      }
      return {
        overallSafetyScore: 89,
        totalSpeedingEvents: 14,
        harshBrakingEvents: 8,
        harshAccelerationEvents: 5,
        leaderboard: [...mockDrivers].sort((a, b) => (b.safetyScore || 90) - (a.safetyScore || 90))
      };
    } catch (e) {
      await delay();
      return {
        overallSafetyScore: 89,
        totalSpeedingEvents: 14,
        harshBrakingEvents: 8,
        harshAccelerationEvents: 5,
        leaderboard: [...mockDrivers].sort((a, b) => (b.safetyScore || 90) - (a.safetyScore || 90))
      };
    }
  }
};

export const tripApi = {
  getAll: async () => {
    try {
      const res = await apiClient.get('/trips');
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : mockTrips;
    } catch (e) {
      await delay();
      return mockTrips;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(`/trips/${id}`);
      return res.data?.data || res.data;
    } catch (e) {
      await delay();
      return mockTrips.find((t) => t.id === id) || mockTrips[0];
    }
  },

  startTrip: async (tripData) => {
    try {
      const res = await apiClient.post('/trips/start', tripData);
      const created = res.data?.data || res.data;
      mockTrips.unshift(created);
      try {
        localStorage.setItem('fleetflow_active_trip', JSON.stringify(created));
      } catch (err) {}
      return created;
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
        avgSpeed: 45,
        fuelConsumedLitres: 0,
        ...tripData
      };
      mockTrips.unshift(newTrip);
      try {
        localStorage.setItem('fleetflow_active_trip', JSON.stringify(newTrip));
      } catch (err) {}
      return newTrip;
    }
  },

  endTrip: async (id, summaryData) => {
    try {
      const res = await apiClient.post(`/trips/${id}/end`, summaryData);
      const updated = res.data?.data || res.data;
      mockTrips = mockTrips.map((t) => (t.id === id ? { ...t, ...updated, status: 'Completed' } : t));
      try {
        localStorage.removeItem('fleetflow_active_trip');
      } catch (err) {}
      return updated;
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
      try {
        localStorage.removeItem('fleetflow_active_trip');
      } catch (err) {}
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
      return res.data?.data || res.data;
    } catch (e) {
      await delay();
      return DEMO_FUEL_METRICS;
    }
  },

  addFuelLog: async (log) => {
    try {
      const res = await apiClient.post('/fuel/logs', log);
      return res.data?.data || res.data;
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
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : mockAlerts;
    } catch (e) {
      await delay();
      return mockAlerts;
    }
  },

  sendSOS: async (sosPayload) => {
    try {
      const res = await apiClient.post('/alerts/sos', sosPayload);
      const created = res.data?.data || res.data;
      mockAlerts.unshift(created);
      return created;
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
      return res.data?.data || res.data;
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
      return res.data?.data || res.data;
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
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : [
        { id: 'm-1', vehicleReg: 'KA-01-EQ-9042', serviceType: 'Engine Oil & Filter', lastServiceDate: '2026-05-10', nextServiceDate: '2026-09-10', odometer: 142500, status: 'Due Soon' },
        { id: 'm-2', vehicleReg: 'MH-12-PQ-4821', serviceType: 'Tire Alignment & Rotation', lastServiceDate: '2026-02-15', nextServiceDate: '2026-08-15', odometer: 89400, status: 'Overdue' },
        { id: 'm-3', vehicleReg: 'DL-01-AB-1234', serviceType: 'Brake Pad Replacement', lastServiceDate: '2026-07-01', nextServiceDate: '2026-11-01', odometer: 64200, status: 'Due' }
      ];
    } catch (e) {
      await delay();
      return [
        { id: 'm-1', vehicleReg: 'KA-01-EQ-9042', serviceType: 'Engine Oil & Filter', lastServiceDate: '2026-05-10', nextServiceDate: '2026-09-10', odometer: 142500, status: 'Due Soon' },
        { id: 'm-2', vehicleReg: 'MH-12-PQ-4821', serviceType: 'Tire Alignment & Rotation', lastServiceDate: '2026-02-15', nextServiceDate: '2026-08-15', odometer: 89400, status: 'Overdue' },
        { id: 'm-3', vehicleReg: 'DL-01-AB-1234', serviceType: 'Brake Pad Replacement', lastServiceDate: '2026-07-01', nextServiceDate: '2026-11-01', odometer: 64200, status: 'Due' }
      ];
    }
  },

  create: async (record) => {
    try {
      const res = await apiClient.post('/maintenance', record);
      return res.data?.data || res.data;
    } catch (e) {
      await delay();
      return { id: `m-${Date.now()}`, ...record };
    }
  }
};

export const geofenceApi = {
  getAll: async () => {
    try {
      const res = await apiClient.get('/geofences');
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : DEMO_GEOFENCES;
    } catch (e) {
      await delay();
      return DEMO_GEOFENCES;
    }
  },

  create: async (zone) => {
    try {
      const res = await apiClient.post('/geofences', zone);
      return res.data?.data || res.data;
    } catch (e) {
      await delay();
      return { id: `geo-${Date.now()}`, ...zone };
    }
  },

  anchorDriverGeofence: async (payload) => {
    try {
      const res = await apiClient.post('/geofences/driver-anchor', payload);
      return res.data?.data || res.data;
    } catch (e) {
      await delay();
      const mockZone = {
        id: `geo-driver-${payload.vehicleReg || 'KA-01-EQ-9042'}`,
        name: payload.name || `Active Operating Corridor (${payload.vehicleReg || 'KA-01-EQ-9042'})`,
        type: payload.type || 'Permitted',
        center: [payload.latitude || payload.lat, payload.longitude || payload.lng],
        radius: payload.radius || 12000,
        color: (payload.type || '').toUpperCase() === 'RESTRICTED' ? '#EF4444' : '#10B981',
        isDriverAnchor: true,
        vehicleReg: payload.vehicleReg || 'KA-01-EQ-9042',
        anchoredAt: new Date().toISOString()
      };
      return mockZone;
    }
  },

  delete: async (id) => {
    try {
      const res = await apiClient.delete(`/geofences/${id}`);
      return res.data?.data || res.data;
    } catch (e) {
      await delay();
      return { id, deleted: true };
    }
  }
};

export const salaryApi = {
  getAll: async (params = {}) => {
    try {
      const res = await apiClient.get('/salary', { params });
      return res.data;
    } catch (e) {
      await delay();
      return {
        success: true,
        data: DEMO_SALARIES,
        stats: {
          totalRecords: DEMO_SALARIES.length,
          totalDisbursed: 73000,
          totalPending: 32000,
          totalFailed: 30000,
          avgSalary: 33750
        }
      };
    }
  },

  create: async (data) => {
    try {
      const res = await apiClient.post('/salary', data);
      return res.data?.data || res.data;
    } catch (e) {
      await delay();
      return { id: `sal-${Date.now()}`, ...data, status: 'Pending', txnId: '-' };
    }
  },

  updateStatus: async (id, status, txnId) => {
    try {
      const res = await apiClient.patch(`/salary/${id}`, { status, txnId });
      return res.data?.data || res.data;
    } catch (e) {
      await delay();
      return { id, status, txnId: txnId || `TXN${Date.now().toString().slice(-8)}` };
    }
  },

  batchDisburse: async (ids) => {
    try {
      const res = await apiClient.post('/salary/batch-disburse', { ids });
      return res.data;
    } catch (e) {
      await delay();
      return { success: true, message: 'Processed batch disbursement' };
    }
  },

  delete: async (id) => {
    try {
      const res = await apiClient.delete(`/salary/${id}`);
      return res.data;
    } catch (e) {
      await delay();
      return { success: true };
    }
  }
};

export const profileApi = {
  getProfile: async () => {
    try {
      const res = await apiClient.get('/auth/profile');
      return res.data?.data || res.data;
    } catch (e) {
      await delay();
      const rawAuth = localStorage.getItem('fleetflow_auth');
      const u = rawAuth ? JSON.parse(rawAuth)?.user : null;
      return {
        id: u?.id || 'usr-105',
        name: u?.name || 'Fleet Admin',
        email: u?.email || 'admin@fleetflow.com',
        role: u?.role || 'SUPER_ADMIN',
        phone: '+91 98765 43210',
        department: 'Fleet Operations & Logistics',
        designation: 'Head of Fleet Operations',
        emergencyContact: '+91 98765 00000',
        bio: 'Managing SmartFleet AI telemetry, real-time vehicle corridors, and dispatch logistics.',
        twoFactorEnabled: true,
        joinedDate: '2023-01-15',
        lastLoginAt: new Date().toISOString()
      };
    }
  },

  updateProfile: async (profileData) => {
    try {
      const res = await apiClient.put('/auth/profile', profileData);
      return res.data?.data || res.data;
    } catch (e) {
      await delay();
      return { user: profileData };
    }
  },

  changePassword: async (passwords) => {
    try {
      const res = await apiClient.post('/auth/change-password', passwords);
      return res.data?.data || res.data;
    } catch (e) {
      await delay();
      return { success: true };
    }
  }
};

export const settingsApi = {
  get: async () => {
    try {
      const res = await apiClient.get('/settings');
      return res.data?.data || res.data;
    } catch (e) {
      await delay();
      const stored = localStorage.getItem('fleetflow_settings');
      return stored ? JSON.parse(stored) : {
        gpsIntervalSec: 15,
        secondaryAuthTimeoutMins: 15,
        enableSoundAlerts: true,
        enableOfflineBuffering: true,
        autoRecenterMap: true,
        mapTileTheme: 'Dark Navigation',
        speedLimitThresholdKmH: 80,
        fuelPricePerLiter: 94.50,
        alertEmailNotifications: true
      };
    }
  },

  update: async (settingsData) => {
    try {
      const res = await apiClient.put('/settings', settingsData);
      return res.data?.data || res.data;
    } catch (e) {
      await delay();
      localStorage.setItem('fleetflow_settings', JSON.stringify(settingsData));
      return settingsData;
    }
  }
};

export const auditApi = {
  getAll: async (params = {}) => {
    try {
      const res = await apiClient.get('/audit-logs', { params });
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : DEMO_AUDIT_LOGS;
    } catch (e) {
      await delay();
      return DEMO_AUDIT_LOGS;
    }
  },

  log: async (eventData) => {
    try {
      const res = await apiClient.post('/audit-logs', eventData);
      return res.data?.data || res.data;
    } catch (e) {
      await delay();
      return { id: `aud-${Date.now()}`, ...eventData, timestamp: new Date().toISOString() };
    }
  }
};

export const documentApi = {
  getAll: async () => {
    try {
      const res = await apiClient.get('/documents');
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : [
        { id: 'doc-1', title: 'Driving Licence - Rajesh Kumar', type: 'Licence', entity: 'Driver drv-201', expiryDate: '2028-04-14', status: 'Valid' },
        { id: 'doc-2', title: 'Vehicle Insurance - KA-01-EQ-9042', type: 'Insurance', entity: 'Vehicle veh-101', expiryDate: '2026-11-20', status: 'Valid' },
        { id: 'doc-3', title: 'PUC Certificate - MH-12-PQ-4821', type: 'PUC', entity: 'Vehicle veh-102', expiryDate: '2026-09-05', status: 'Expiring Soon' },
        { id: 'doc-4', title: 'Driving Licence - Venkatesh R', type: 'Licence', entity: 'Driver drv-204', expiryDate: '2026-06-30', status: 'Expired' }
      ];
    } catch (e) {
      await delay();
      return [
        { id: 'doc-1', title: 'Driving Licence - Rajesh Kumar', type: 'Licence', entity: 'Driver drv-201', expiryDate: '2028-04-14', status: 'Valid' },
        { id: 'doc-2', title: 'Vehicle Insurance - KA-01-EQ-9042', type: 'Insurance', entity: 'Vehicle veh-101', expiryDate: '2026-11-20', status: 'Valid' },
        { id: 'doc-3', title: 'PUC Certificate - MH-12-PQ-4821', type: 'PUC', entity: 'Vehicle veh-102', expiryDate: '2026-09-05', status: 'Expiring Soon' },
        { id: 'doc-4', title: 'Driving Licence - Venkatesh R', type: 'Licence', entity: 'Driver drv-204', expiryDate: '2026-06-30', status: 'Expired' }
      ];
    }
  },

  create: async (doc) => {
    try {
      const res = await apiClient.post('/documents', doc);
      return res.data?.data || res.data;
    } catch (e) {
      await delay();
      return { id: `doc-${Date.now()}`, ...doc };
    }
  }
};

export const routeApi = {
  optimize: async (routeData) => {
    try {
      const res = await apiClient.post('/routes/optimize', routeData);
      return res.data?.data || res.data;
    } catch (e) {
      await delay();
      return {
        success: true,
        distanceKm: 348.5,
        estimatedDurationHours: 5.8,
        recommendedSpeedKmh: 60,
        fuelEstimateLitres: 92,
        tollCount: 4,
        waypoints: [
          [12.9716, 77.5946],
          [12.9850, 78.2000],
          [12.9200, 79.1300],
          [13.0827, 80.2707]
        ]
      };
    }
  }
};

export const carbonApi = {
  getMetrics: async () => {
    try {
      const res = await apiClient.get('/carbon/metrics');
      return res.data?.data || res.data;
    } catch (e) {
      try {
        const [vData, fData] = await Promise.all([
          vehicleApi.getAll(),
          fuelApi.getMetrics()
        ]);
        const vehicles = Array.isArray(vData) ? vData : (vData?.data || []);
        const fuel = fData || {};
        const totalLitres = fuel.totalLitres || 4820;
        const totalCO2Tonnes = parseFloat(((totalLitres * 2.68) / 1000).toFixed(2));
        const avgCO2PerVehicle = vehicles.length > 0 ? parseFloat((totalCO2Tonnes / vehicles.length).toFixed(2)) : 2.84;
        const vehicleBreakdown = vehicles.map((v) => {
          const estLitres = Math.round((v.odometer || 12000) / 3.8);
          const co2 = parseFloat(((estLitres * 2.68) / 1000).toFixed(2));
          return {
            id: v.id,
            registration: v.registration,
            makeModel: v.makeModel,
            driver: v.assignedDriverName || 'Unassigned',
            co2Tonnes: co2,
            rating: co2 <= 2.2 ? 'Green A+' : co2 <= 3.2 ? 'Efficient A' : 'Standard B'
          };
        });
        return {
          totalCO2Tonnes,
          avgCO2PerVehicle,
          reductionVsLastMonth: 7.2,
          treeEquivalents: Math.round((totalCO2Tonnes * 1000) / 22),
          greenFleetScore: 86,
          vehicleBreakdown
        };
      } catch (err) {
        return {
          totalCO2Tonnes: 12.8,
          avgCO2PerVehicle: 2.56,
          reductionVsLastMonth: 7.2,
          treeEquivalents: 581,
          greenFleetScore: 86,
          vehicleBreakdown: []
        };
      }
    }
  }
};

export const reportApi = {
  getSummary: async () => {
    try {
      const res = await apiClient.get('/reports/summary');
      return res.data?.data || res.data;
    } catch (e) {
      await delay();
      return null;
    }
  },

  getLogbook: async () => {
    try {
      const res = await apiClient.get('/reports/logbook');
      return res.data?.data || res.data;
    } catch (e) {
      await delay();
      return [];
    }
  }
};

