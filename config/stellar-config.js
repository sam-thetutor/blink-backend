const { Networks } = require('@stellar/stellar-sdk');

// Stellar network configuration
const STELLAR_CONFIG = {
  testnet: {
    network: Networks.TESTNET,
    horizonUrl: 'https://horizon-testnet.stellar.org',
    passphrase: 'Test SDF Network ; September 2015'
  },
  mainnet: {
    network: Networks.PUBLIC,
    horizonUrl: 'https://horizon.stellar.org',
    passphrase: 'Public Global Stellar Network ; September 2015'
  }
};

// Get current network configuration based on environment
const getCurrentNetwork = () => {
  const network = process.env.STELLAR_NETWORK || 'testnet';
  return STELLAR_CONFIG[network];
};

// CAIP-2 blockchain identifier for Stellar
const STELLAR_BLOCKCHAIN_ID = 'stellar:1'; // Stellar mainnet
const STELLAR_TESTNET_BLOCKCHAIN_ID = 'stellar:2'; // Stellar testnet

// Get blockchain ID based on current network
const getBlockchainId = () => {
  const network = process.env.STELLAR_NETWORK || 'testnet';
  return network === 'testnet' ? STELLAR_TESTNET_BLOCKCHAIN_ID : STELLAR_BLOCKCHAIN_ID;
};

// Blinks specification version
const BLINK_VERSION = '2.4';

module.exports = {
  STELLAR_CONFIG,
  getCurrentNetwork,
  getBlockchainId,
  BLINK_VERSION
}; 