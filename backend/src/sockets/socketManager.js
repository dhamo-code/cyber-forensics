const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let io;

const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('No auth token'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.role = decoded.role;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (user: ${socket.userId})`);

    // Join user room
    socket.join(`user:${socket.userId}`);

    // Analysts and admins get all alerts
    if (['admin', 'analyst'].includes(socket.role)) {
      socket.join('analysts');
    }

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  logger.info('Socket.io initialized');
  return io;
};

const emitAlert = (alert) => {
  if (!io) return;
  io.to('analysts').emit('new:alert', alert);
};

const emitNotification = (userId, notification) => {
  if (!io) return;
  io.to(`user:${userId}`).emit('notification', notification);
};

const emitThreatAlert = (severity, data) => {
  if (!io) return;
  if (severity === 'critical') {
    io.emit('critical:threat', data);
  } else {
    io.to('analysts').emit('threat:detected', data);
  }
};

const getIO = () => io;

module.exports = {
  initializeSocket,
  emitAlert,
  emitNotification,
  emitThreatAlert,
  getIO,
};