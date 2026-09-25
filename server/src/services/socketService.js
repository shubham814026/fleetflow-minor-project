import { Server } from 'socket.io';

let io = null;

export const initSocket = (server, clientUrl) => {
  io = new Server(server, {
    cors: {
      origin: clientUrl || '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    // Join room handlers
    socket.on('join:admin', () => {
      socket.join('fleet:admins');
      console.log(`Socket ${socket.id} joined room: fleet:admins`);
    });

    socket.on('join:vehicle', (vehicleId) => {
      socket.join(`vehicle:${vehicleId}`);
      console.log(`Socket ${socket.id} joined room: vehicle:${vehicleId}`);
    });

    socket.on('join:trip', (tripId) => {
      socket.join(`trip:${tripId}`);
      console.log(`Socket ${socket.id} joined room: trip:${tripId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    console.warn('Socket.IO not initialized yet');
  }
  return io;
};

export const broadcastGpsUpdate = (data) => {
  if (io) {
    io.to('fleet:admins').emit('gps:update', data);
    io.to(`vehicle:${data.vehicleId}`).emit('gps:update', data);
    if (data.tripId) {
      io.to(`trip:${data.tripId}`).emit('gps:update', data);
    }
  }
};

export const broadcastAlert = (alertData) => {
  if (io) {
    io.to('fleet:admins').emit('alert:new', alertData);
    if (alertData.category === 'SOS') {
      io.to('fleet:admins').emit('sos:new', alertData);
    }
  }
};

export const broadcastGeofenceViolation = (violationData) => {
  if (io) {
    io.to('fleet:admins').emit('geofence:violation', violationData);
  }
};

export const broadcastTripEvent = (eventName, tripData) => {
  if (io) {
    io.to('fleet:admins').emit(eventName, tripData);
    if (tripData.vehicleId) {
      io.to(`vehicle:${tripData.vehicleId}`).emit(eventName, tripData);
    }
  }
};
