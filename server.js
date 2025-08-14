const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const corsMiddleware = require('./middleware/cors');
const routes = require('./routes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS middleware for Stellar Blinks
app.use(corsMiddleware);

// Additional CORS for broader compatibility
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-blockchain-ids', 'x-action-version'],
  exposedHeaders: ['x-blockchain-ids', 'x-action-version']
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', routes);

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    error: 'Internal server error',
    message: error.message || 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist`,
    availableRoutes: [
      '/api/health',
      '/api/actions/transfer-xlm',
      '/api/actions/transfer-xlm/icon'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Stellar XLM Blinks Backend Server Started');
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⭐ Stellar Network: ${process.env.STELLAR_NETWORK || 'testnet'}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`💫 XLM Transfer Blink: http://localhost:${PORT}/api/actions/transfer-xlm`);
  console.log(`📱 CORS Origin: ${process.env.CORS_ORIGIN || '*'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app; 