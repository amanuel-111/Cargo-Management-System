const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB, sequelize } = require('./config/db');
require('./models'); // register all models + associations
const errorHandler = require('./middleware/errorHandler');
const socketHandler = require('./sockets/socketHandler');
const traccarPoller = require('./services/traccarPoller');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const shipmentRoutes = require('./routes/shipments');
const vehicleRoutes = require('./routes/vehicles');
const trackingRoutes = require('./routes/tracking');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');
const paymentRoutes   = require('./routes/payments');

const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET', 'POST'], credentials: true },
});
socketHandler(io);

// Attach io to every request
app.use((req, res, next) => { req.io = io; next(); });

// Security
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: 'Too many requests, please try again later' },
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') app.use(morgan('tiny'));

// Health check
app.get('/health', (req, res) =>
  res.json({ success: true, message: 'Smart Transport API running', db: 'MySQL (MAMP)', timestamp: new Date() })
);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments',  paymentRoutes);

app.use('*', (req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  // Use alter:true only in development, and only when schema actually changes
  // In production use migrations instead
  const syncOptions = process.env.NODE_ENV === 'development'
    ? { alter: { drop: false }, logging: false }  // alter but never drop columns
    : { logging: false };                          // production: no-op sync
  await sequelize.sync(syncOptions);
  console.log('✅ All MySQL tables synced');
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    traccarPoller.start(io);
  });
};

start();

module.exports = { app, io };
