const express = require('express');
const router = express.Router();

// Import action routes
const transferXlmRoutes = require('./actions/transfer-xlm');

// Mount action routes
router.use('/actions', transferXlmRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Stellar XLM Blinks Backend',
    timestamp: new Date().toISOString(),
    network: process.env.STELLAR_NETWORK || 'testnet',
  });
});

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    service: 'Stellar XLM Blinks Backend',
    description:
      'Backend service for Stellar XLM transfer Blinks following Dialect specification',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      transferXlm: '/api/actions/transfer-xlm',
      documentation: 'https://docs.dialect.to/blinks',
    },
  });
});

module.exports = router;
