const { getBlockchainId, BLINK_VERSION } = require('../config/stellar-config');

// CORS middleware for Stellar Blinks
const corsMiddleware = (req, res, next) => {
  const blockchainId = getBlockchainId();

  // Set CORS headers for cross-origin requests
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, x-blockchain-ids, x-action-version'
  );
  res.header(
    'Access-Control-Expose-Headers',
    'x-blockchain-ids, x-action-version'
  );

  // Set Stellar blockchain-specific headers for Blinks compliance
  res.header('x-blockchain-ids', blockchainId);
  res.header('x-action-version', BLINK_VERSION);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
};

module.exports = corsMiddleware;
