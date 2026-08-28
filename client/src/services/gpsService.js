import { openDB } from 'idb';
import { gpsApi } from '../api';

const DB_NAME = 'SmartFleetGPS_DB';
const STORE_NAME = 'offline_gps_points';

// Initialize IndexedDB database for offline buffering
async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('tripId', 'tripId', { unique: false });
        store.createIndex('synced', 'synced', { unique: false });
      }
    }
  });
}

class GPSService {
  constructor() {
    this.watchId = null;
    this.activeTripId = null;
    this.lastPosition = null;
    this.isTracking = false;
    this.onPositionChange = null;
    this.isSyncing = false;

    // Listen to network status for auto-sync
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.syncOfflinePoints());
    }
  }

  // High accuracy one-time position fetch
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            speed: position.coords.speed || 0,
            heading: position.coords.heading || 0,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp).toISOString()
          };
          resolve(coords);
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  // Start continuous tracking during an active trip
  startTracking(tripId, callback) {
    if (this.isTracking) return;

    this.activeTripId = tripId;
    this.isTracking = true;
    this.onPositionChange = callback;

    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const currentPos = {
          tripId: this.activeTripId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed != null ? Math.round(position.coords.speed * 3.6) : 0, // m/s to km/h
          heading: position.coords.heading != null ? Math.round(position.coords.heading) : 0,
          accuracy: Math.round(position.coords.accuracy),
          timestamp: new Date(position.timestamp).toISOString(),
          synced: false
        };

        // Calculate speed/heading if browser didn't supply them directly
        if (this.lastPosition) {
          if (!currentPos.speed) {
            currentPos.speed = this.calculateSpeed(this.lastPosition, currentPos);
          }
          if (!currentPos.heading) {
            currentPos.heading = this.calculateHeading(this.lastPosition, currentPos);
          }
        }

        this.lastPosition = currentPos;

        if (this.onPositionChange) {
          this.onPositionChange(currentPos);
        }

        // Send to backend or queue offline
        if (navigator.onLine) {
          try {
            await gpsApi.sendPoints(currentPos);
          } catch (err) {
            console.warn('Failed to send GPS point online, queueing locally...', err);
            await this.queueOfflinePoint(currentPos);
          }
        } else {
          await this.queueOfflinePoint(currentPos);
        }
      },
      (error) => {
        console.error('GPS Watch Position error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000
      }
    );
  }

  // Stop tracking
  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
    this.activeTripId = null;
    this.lastPosition = null;
  }

  // Queue point into IndexedDB
  async queueOfflinePoint(point) {
    try {
      const db = await getDB();
      await db.add(STORE_NAME, { ...point, queuedAt: Date.now() });
      console.log('Queued GPS point offline in IndexedDB:', point);
    } catch (err) {
      console.error('Error storing offline GPS point in IndexedDB:', err);
    }
  }

  // Sync stored offline points when network recovers
  async syncOfflinePoints() {
    if (this.isSyncing || !navigator.onLine) return;
    this.isSyncing = true;

    try {
      const db = await getDB();
      const allPoints = await db.getAll(STORE_NAME);

      if (!allPoints || allPoints.length === 0) {
        this.isSyncing = false;
        return;
      }

      console.log(`Online! Syncing ${allPoints.length} offline GPS points...`);
      await gpsApi.syncOfflinePoints(allPoints);

      // Clear synced records
      const tx = db.transaction(STORE_NAME, 'readwrite');
      await tx.objectStore(STORE_NAME).clear();
      await tx.done;

      console.log('Successfully synced and cleared offline GPS buffer.');
    } catch (err) {
      console.error('Failed to sync offline GPS points:', err);
    } finally {
      this.isSyncing = false;
    }
  }

  // Haversine formula to compute distance between two lat/lng points in km
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  }

  // Calculate speed between two points in km/h
  calculateSpeed(pos1, pos2) {
    const distKm = this.calculateDistance(pos1.latitude, pos1.longitude, pos2.latitude, pos2.longitude);
    const timeHours = (new Date(pos2.timestamp) - new Date(pos1.timestamp)) / 3600000;
    if (timeHours <= 0) return 0;
    return Math.round(distKm / timeHours);
  }

  // Calculate heading angle in degrees (0 - 360)
  calculateHeading(pos1, pos2) {
    const dLon = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;
    const lat1 = (pos1.latitude * Math.PI) / 180;
    const lat2 = (pos2.latitude * Math.PI) / 180;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const brng = (Math.atan2(y, x) * 180) / Math.PI;
    return Math.round((brng + 360) % 360);
  }
}

export const gpsService = new GPSService();
export default gpsService;
