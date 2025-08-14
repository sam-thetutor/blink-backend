const {
  TransactionBuilder,
  Networks,
  Operation,
  Keypair,
  Memo,
  Asset,
  BASE_FEE,
  Horizon,
} = require('@stellar/stellar-sdk');
const { getCurrentNetwork } = require('../config/stellar-config');

class StellarXLMService {
  constructor() {
    this.networkConfig = getCurrentNetwork();
    // Initialize Horizon server
    this.horizonServer = new Horizon.Server(this.networkConfig.horizonUrl);
  }

  /**
   * Create a Stellar XLM transfer transaction
   * @param {string} sourceAccount - Source account public key
   * @param {string} destinationAccount - Destination account public key
   * @param {string} amount - Amount in XLM (will be converted to stroops)
   * @param {string} memo - Optional memo for the transaction
   * @returns {Object} Transaction data ready for signing
   */
  async createXLMTransferTransaction(
    sourceAccount,
    destinationAccount,
    amount,
    memo = ''
  ) {
    try {
      // Validate inputs
      if (!sourceAccount || !destinationAccount || !amount) {
        throw new Error(
          'Missing required parameters: sourceAccount, destinationAccount, amount'
        );
      }

      // Validate Stellar addresses
      if (!this.isValidStellarAddress(sourceAccount)) {
        throw new Error('Invalid source account address');
      }
      if (!this.isValidStellarAddress(destinationAccount)) {
        throw new Error('Invalid destination account address');
      }

      // Convert XLM to stroops (1 XLM = 10000000 stroops)
      const stroops = Math.floor(parseFloat(amount) * 10000000);
      if (stroops <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Load the source account from Horizon to get the current sequence number
      const sourceAccountObj =
        await this.horizonServer.loadAccount(sourceAccount);

      // Create the transfer operation
      const transferOperation = Operation.payment({
        destination: destinationAccount,
        asset: Asset.native(), // Native XLM asset
        amount: stroops.toString(),
      });

      // Build the transaction using the loaded account
      const transaction = new TransactionBuilder(sourceAccountObj, {
        fee: BASE_FEE,
        networkPassphrase: this.networkConfig.passphrase,
      }).addOperation(transferOperation);

      // Add memo if provided
      if (memo) {
        transaction.addMemo(Memo.text(memo));
      }

      // Set timeout (5 minutes)
      transaction.setTimeout(300);

      // Build the transaction
      const builtTransaction = transaction.build();

      // Return transaction data for client signing
      return {
        transaction: builtTransaction.toXDR(),
        networkPassphrase: this.networkConfig.passphrase,
        network: this.networkConfig.network,
        fee: BASE_FEE,
        amount: stroops,
        amountXLM: amount,
      };
    } catch (error) {
      console.error('Error creating XLM transfer transaction:', error);
      throw error;
    }
  }

  /**
   * Validate Stellar address format
   * @param {string} address - Stellar address to validate
   * @returns {boolean} True if valid Stellar address
   */
  isValidStellarAddress(address) {
    try {
      // Basic validation - Stellar addresses are 56 characters long and start with G
      if (!address || typeof address !== 'string') {
        return false;
      }

      if (address.length !== 56 || !address.startsWith('G')) {
        return false;
      }

      // Try to create a PublicKey object (this will throw if invalid)
      Keypair.fromPublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get account information from Stellar network
   * @param {string} accountId - Stellar account ID
   * @returns {Object} Account information
   */
  async getAccountInfo(accountId) {
    try {
      if (!this.isValidStellarAddress(accountId)) {
        throw new Error('Invalid account address');
      }

      const response = await fetch(
        `${this.networkConfig.horizonUrl}/accounts/${accountId}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Account not found');
        }
        throw new Error(`Failed to fetch account: ${response.statusText}`);
      }

      const accountData = await response.json();
      return {
        accountId: accountData.id,
        sequence: accountData.sequence,
        balances: accountData.balances,
        thresholds: accountData.thresholds,
        signers: accountData.signers,
      };
    } catch (error) {
      console.error('Error fetching account info:', error);
      throw error;
    }
  }

  /**
   * Submit a signed transaction to the Stellar network
   * @param {string} signedTransactionXDR - Signed transaction in XDR format
   * @returns {Object} Transaction result
   */
  async submitTransaction(signedTransactionXDR) {
    try {
      const response = await fetch(
        `${this.networkConfig.horizonUrl}/transactions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `tx=${encodeURIComponent(signedTransactionXDR)}`,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Transaction failed: ${errorData.extras?.result_codes?.operations?.join(', ') || errorData.detail || 'Unknown error'}`
        );
      }

      const result = await response.json();
      return {
        hash: result.hash,
        ledger: result.ledger,
        successful: result.successful,
        resultCode: result.result_code,
        resultCodeString: result.result_code_s,
      };
    } catch (error) {
      console.error('Error submitting transaction:', error);
      throw error;
    }
  }
}

module.exports = StellarXLMService;
