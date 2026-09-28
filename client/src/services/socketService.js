import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket && this.socket.connected) return;

    this.socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Socket.IO connected to SmartFleet real-time gateway:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('Socket.IO disconnected:', reason);
    });

    // Wire up events to internal listener callbacks
    const events = [
      'gps:update',
      'vehicle:online',
      'vehicle:offline',
      'trip:started',
      'trip:ended',
      'alert:new',
      'sos:new',
      'geofence:violation'
    ];

    events.forEach((event) => {
      this.socket.on(event, (data) => {
        if (this.listeners.has(event)) {
          this.listeners.get(event).forEach((cb) => cb(data));
        }
      });
    });
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return () => {
      if (this.listeners.has(event)) {
        this.listeners.get(event).delete(callback);
      }
    };
  }

  emit(event, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, unable to emit event:', event);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
export default socketService;
