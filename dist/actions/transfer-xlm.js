const express = require('express');
const router = express.Router();
const StellarXLMService = require('../../services/stellar-xlm-service');
const {
  getCurrentNetwork,
  getBlockchainId,
} = require('../../config/stellar-config');

const stellarService = new StellarXLMService();

// GET endpoint - Returns Blink metadata for UI rendering
router.get('/', (req, res) => {
  const network = getCurrentNetwork();
  const blockchainId = getBlockchainId();

  const response = {
    type: 'action',
    icon: `${req.protocol}://${req.get('host')}/api/actions/transfer-xlm/icon`,
    label: 'Send XLM',
    title: 'Transfer XLM on Stellar',
    description:
      'Send XLM instantly to any Stellar address. Choose from preset amounts or enter a custom amount. This Blink provides a complete interactive experience for XLM transfers.',
    links: {
      actions: [
        {
          type: 'transaction',
          label: '1 XLM',
          href: `/api/actions/transfer-xlm?amount=1&recipient={recipient}`,
          parameters: [
            {
              name: 'recipient',
              label: 'Recipient Stellar Address',
              type: 'text',
              required: true,
              pattern: '^G[A-Z0-9]{55}$',
            },
          ],
        },
        {
          type: 'transaction',
          label: '5 XLM',
          href: `/api/actions/transfer-xlm?amount=5&recipient={recipient}`,
          parameters: [
            {
              name: 'recipient',
              label: 'Recipient Stellar Address',
              type: 'text',
              required: true,
              pattern: '^G[A-Z0-9]{55}$',
            },
          ],
        },
        {
          type: 'transaction',
          label: '10 XLM',
          href: `/api/actions/transfer-xlm?amount=10&recipient={recipient}`,
          parameters: [
            {
              name: 'recipient',
              label: 'Recipient Stellar Address',
              type: 'text',
              required: true,
              pattern: '^G[A-Z0-9]{55}$',
            },
          ],
        },
        {
          type: 'transaction',
          label: 'Custom Amount',
          href: `/api/actions/transfer-xlm?amount={amount}&recipient={recipient}&memo={memo}`,
          parameters: [
            {
              name: 'amount',
              label: 'Amount in XLM',
              type: 'number',
              required: true,
              min: 0.0000001,
              max: 1000000,
            },
            {
              name: 'recipient',
              label: 'Recipient Stellar Address',
              type: 'text',
              required: true,
              pattern: '^G[A-Z0-9]{55}$',
            },
            {
              name: 'memo',
              label: 'Memo (Optional)',
              type: 'text',
              required: false,
            },
          ],
        },
      ],
    },
  };

  res.json(response);
});

// POST endpoint - Creates XLM transfer transaction
router.post('/', async (req, res) => {
  try {
    const { amount, recipient, account, memo = '' } = req.body;

    // Validate required fields
    if (!amount || !recipient || !account) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Amount, recipient, and account are required',
      });
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Amount must be a positive number',
      });
    }

    // Validate recipient address format
    if (!/^G[A-Z0-9]{55}$/.test(recipient)) {
      return res.status(400).json({
        error: 'Invalid recipient address',
        message:
          'Recipient must be a valid Stellar address (56 characters, starting with G)',
      });
    }

    // Create XLM transfer transaction
    const transactionResult = await stellarService.createXLMTransferTransaction(
      account,
      recipient,
      amount,
      memo
    );

    const network = getCurrentNetwork();
    const amountStroops = Math.round(amountNum * 10000000); // Convert to stroops

    res.json({
      type: 'transaction',
      message: `Transfer ${amount} XLM to ${recipient}`,
      transaction: transactionResult,
      metadata: {
        amount: amountNum,
        amountStroops,
        recipient,
        source: account,
        fee: '100', // Base fee in stroops
        network: network.name,
        memo: memo || 'None',
      },
    });
  } catch (error) {
    console.error('Error creating XLM transfer transaction:', error);

    if (error.message.includes('NotFoundError')) {
      return res.status(404).json({
        error: 'Account not found',
        message: 'The source account does not exist on the Stellar network',
      });
    }

    res.status(500).json({
      error: 'Transaction creation failed',
      message: error.message || 'Failed to create transaction',
    });
  }
});

// GET icon endpoint - Returns SVG icon for the Blink
router.get('/icon', (req, res) => {
  const svgIcon = `
    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#357ABD;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="12" fill="url(#grad1)"/>
      <text x="32" y="40" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="white">XLM</text>
      <circle cx="32" cy="20" r="8" fill="white" opacity="0.3"/>
    </svg>
  `;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svgIcon);
});

// GET social media preview endpoint - Returns HTML with meta tags for unfurling
router.get('/preview', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const blinkUrl = `${baseUrl}/api/actions/transfer-xlm`;
  const iconUrl = `https://a2ede-rqaaa-aaaal-ai6sq-cai.raw.icp0.io/uploads/download.225.225.jpeg`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Send XLM on Stellar - Interactive Blink</title>
      
      <!-- Open Graph Meta Tags for Facebook, LinkedIn, etc. -->
      <meta property="og:title" content="Send XLM on Stellar" />
      <meta property="og:description" content="Transfer XLM instantly with this interactive Blink. Send 1, 5, 10 XLM or custom amounts directly from the link!" />
      <meta property="og:image" content="${iconUrl}" />
      <meta property="og:url" content="${blinkUrl}" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Stellar XLM Transfer Blink" />
      
      <!-- Twitter Card Meta Tags - Using App Card for interactive buttons -->
      <meta name="twitter:card" content="app" />
      <meta name="twitter:title" content="Send XLM on Stellar" />
      <meta name="twitter:description" content="Transfer XLM instantly with this interactive Blink. Send 1, 5, 10 XLM or custom amounts directly from the link!" />
      <meta name="twitter:image" content="${iconUrl}" />
      <meta name="twitter:url" content="${blinkUrl}" />
      
      <!-- Twitter App Card Specific Tags -->
      <meta name="twitter:app:country" content="US" />
      <meta name="twitter:app:name:iphone" content="Stellar XLM Transfer" />
      <meta name="twitter:app:name:ipad" content="Stellar XLM Transfer" />
      <meta name="twitter:app:name:googleplay" content="Stellar XLM Transfer" />
      <meta name="twitter:app:url:iphone" content="${blinkUrl}" />
      <meta name="twitter:app:url:ipad" content="${blinkUrl}" />
      <meta name="twitter:app:url:googleplay" content="${blinkUrl}" />
      
      <!-- Additional Meta Tags -->
      <meta name="description" content="Transfer XLM instantly with this interactive Blink. Send 1, 5, 10 XLM or custom amounts directly from the link!" />
      <meta name="keywords" content="Stellar, XLM, cryptocurrency, transfer, blockchain, blink" />
      <meta name="author" content="Stellar XLM Transfer Blink" />
      
      <!-- Favicon -->
      <link rel="icon" type="image/svg+xml" href="${iconUrl}" />
      
      <!-- Stellar Wallets Kit for embedded wallet functionality -->
      <script src="https://unpkg.com/@creit.tech/stellar-wallets-kit@latest/dist/index.umd.js"></script>
      
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .preview-container {
          max-width: 800px;
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          padding: 40px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          border-radius: 20px;
          background: linear-gradient(135deg, #4A90E2, #357ABD);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: bold;
        }
        h1 {
          margin: 0 0 20px 0;
          font-size: 2.5em;
          font-weight: 700;
        }
        .description {
          font-size: 1.2em;
          line-height: 1.6;
          margin-bottom: 30px;
          opacity: 0.9;
        }
        
        /* Interactive Action Buttons */
        .action-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin: 30px 0;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .action-btn {
          background: linear-gradient(135deg, #4CAF50, #45a049);
          color: white;
          border: none;
          padding: 16px 20px;
          font-size: 1rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }
        
        .action-btn.primary {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        }
        
        .action-btn.secondary {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }
        
        .action-btn.danger {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }
        
        /* Wallet Connection Section */
        .wallet-section {
          background: rgba(255, 255, 255, 0.1);
          padding: 24px;
          border-radius: 16px;
          margin: 24px 0;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .wallet-section h3 {
          margin: 0 0 16px 0;
          color: #ffffff;
        }
        
        .wallet-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .wallet-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }
        
        .wallet-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }
        
        .wallet-btn.connected {
          background: linear-gradient(135deg, #10b981, #059669);
          border-color: #10b981;
        }
        
        /* Transaction Form */
        .transaction-form {
          background: rgba(255, 255, 255, 0.1);
          padding: 24px;
          border-radius: 16px;
          margin: 24px 0;
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: none;
        }
        
        .transaction-form.show {
          display: block;
        }
        
        .form-group {
          margin-bottom: 16px;
          text-align: left;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #ffffff;
        }
        
        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 1rem;
        }
        
        .form-group input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #3b82f6;
          background: rgba(255, 255, 255, 0.2);
        }
        
        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 20px;
        }
        
        /* Status Messages */
        .status-message {
          padding: 12px 16px;
          border-radius: 8px;
          margin: 16px 0;
          font-weight: 500;
        }
        
        .status-success {
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid #10b981;
          color: #10b981;
        }
        
        .status-error {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid #ef4444;
          color: #ef4444;
        }
        
        .status-info {
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid #3b82f6;
          color: #3b82f6;
        }
        
        /* Features Grid */
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        .feature {
          background: rgba(255, 255, 255, 0.1);
          padding: 20px;
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .feature-icon {
          font-size: 2em;
          margin-bottom: 10px;
        }
        .feature h3 {
          margin: 0 0 10px 0;
          font-size: 1.2em;
        }
        .feature p {
          margin: 0;
          opacity: 0.8;
          font-size: 0.9em;
        }
        
        .note {
          margin-top: 20px;
          font-size: 0.9em;
          opacity: 0.7;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .action-buttons {
            grid-template-columns: 1fr;
          }
          
          .wallet-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .form-actions {
            flex-direction: column;
            align-items: center;
          }
        }
      </style>
    </head>
    <body>
      <div class="preview-container">
        <div class="icon">🌟</div>
        <h1>Send XLM on Stellar</h1>
        <p class="description">
          Transfer XLM instantly with this interactive Blink. Send 1, 5, 10 XLM or custom amounts directly from the link!
        </p>
        
        <!-- Interactive Action Buttons -->
        <div class="action-buttons">
          <button class="action-btn primary" onclick="quickSend(1)">
            🚀 Send 1 XLM
          </button>
          <button class="action-btn primary" onclick="quickSend(5)">
            🚀 Send 5 XLM
          </button>
          <button class="action-btn primary" onclick="quickSend(10)">
            🚀 Send 10 XLM
          </button>
          <button class="action-btn secondary" onclick="showCustomForm()">
            ✏️ Custom Amount
          </button>
        </div>
        
        <!-- Wallet Connection Section -->
        <div class="wallet-section">
          <h3>🔗 Connect Your Stellar Wallet</h3>
          <div class="wallet-buttons">
            <button class="wallet-btn" onclick="connectWallet('freighter')">
              🦊 Freighter
            </button>
            <button class="wallet-btn" onclick="connectWallet('lobstr')">
              💼 Lobstr
            </button>
            <button class="wallet-btn" onclick="connectWallet('albedo')">
              🌟 Albedo
            </button>
          </div>
          <div id="wallet-status" class="status-message status-info" style="display: none;">
            🔌 Please connect a wallet to continue
          </div>
        </div>
        
        <!-- Custom Transaction Form -->
        <div id="transaction-form" class="transaction-form">
          <h3>📝 Custom XLM Transfer</h3>
          <div class="form-group">
            <label for="amount">Amount (XLM):</label>
            <input type="number" id="amount" placeholder="Enter amount in XLM" min="0.0000001" max="1000000" step="0.0000001">
          </div>
          <div class="form-group">
            <label for="recipient">Recipient Address:</label>
            <input type="text" id="recipient" placeholder="G... (56 character Stellar address)" pattern="^G[A-Z0-9]{55}$">
          </div>
          <div class="form-group">
            <label for="memo">Memo (Optional):</label>
            <input type="text" id="recipient" placeholder="Enter memo text">
          </div>
          <div class="form-actions">
            <button class="action-btn primary" onclick="sendCustomTransaction()">
              🚀 Send XLM
            </button>
            <button class="action-btn secondary" onclick="hideCustomForm()">
              ❌ Cancel
            </button>
          </div>
        </div>
        
        <!-- Status Messages -->
        <div id="status-container"></div>
        
        <div class="features">
          <div class="feature">
            <div class="feature-icon">⚡</div>
            <h3>Instant Transfers</h3>
            <p>Send XLM in seconds with just a few clicks</p>
          </div>
          <div class="feature">
            <div class="feature-icon">🔗</div>
            <h3>Interactive UI</h3>
            <p>Complete experience embedded in the link</p>
          </div>
          <div class="feature">
            <div class="feature-icon">🌐</div>
            <h3>Universal Access</h3>
            <p>Works on any device with a web browser</p>
          </div>
          <div class="feature">
            <div class="feature-icon">🔒</div>
            <h3>Secure</h3>
            <p>Built on Stellar's secure blockchain</p>
          </div>
        </div>
        
        <p class="note">
          This link provides a complete interactive experience with embedded wallet functionality. 
          Users can connect their wallet and send XLM directly from Twitter, Discord, or any platform!
        </p>
      </div>
      
      <script>
        // Global state
        let connectedWallet = null;
        let walletAddress = null;
        
        // Initialize Stellar Wallets Kit
        let stellarKit = null;
        
        // Initialize the kit when page loads
        document.addEventListener('DOMContentLoaded', function() {
          if (typeof StellarWalletsKit !== 'undefined') {
            stellarKit = new StellarWalletsKit({
              network: 'TESTNET',
              modules: ['freighter', 'lobstr', 'albedo']
            });
            console.log('Stellar Wallets Kit initialized');
          } else {
            console.log('Stellar Wallets Kit not available');
          }
        });
        
        // Quick send functions
        function quickSend(amount) {
          if (!connectedWallet) {
            showStatus('Please connect a wallet first', 'error');
            return;
          }
          
          const recipient = prompt('Enter recipient Stellar address:');
          if (!recipient) return;
          
          if (!/^G[A-Z0-9]{55}$/.test(recipient)) {
            showStatus('Invalid Stellar address format', 'error');
            return;
          }
          
          showStatus('Preparing transaction...', 'info');
          
          // Create transaction using backend
          createTransaction(amount, recipient, '');
        }
        
        // Show custom form
        function showCustomForm() {
          if (!connectedWallet) {
            showStatus('Please connect a wallet first', 'error');
            return;
          }
          
          document.getElementById('transaction-form').classList.add('show');
        }
        
        // Hide custom form
        function hideCustomForm() {
          document.getElementById('transaction-form').classList.remove('show');
        }
        
        // Send custom transaction
        function sendCustomTransaction() {
          const amount = document.getElementById('amount').value;
          const recipient = document.getElementById('recipient').value;
          const memo = document.getElementById('memo').value;
          
          if (!amount || !recipient) {
            showStatus('Please fill in all required fields', 'error');
            return;
          }
          
          if (!/^G[A-Z0-9]{55}$/.test(recipient)) {
            showStatus('Invalid Stellar address format', 'error');
            return;
          }
          
          showStatus('Preparing transaction...', 'info');
          createTransaction(amount, recipient, memo);
        }
        
        // Connect wallet
        async function connectWallet(walletType) {
          try {
            showStatus('Connecting to ' + walletType + '...', 'info');
            
            if (stellarKit) {
              // Use Stellar Wallets Kit
              await stellarKit.openModal({
                onWalletSelected: async (option) => {
                  stellarKit.setWallet(option.id);
                  const { address } = await stellarKit.getAddress();
                  walletAddress = address;
                  connectedWallet = option.id;
                  updateWalletStatus();
                  showStatus('Wallet connected: ' + address.substring(0, 8) + '...', 'success');
                }
              });
            } else {
              // Fallback to basic wallet detection
              if (walletType === 'freighter' && window.stellar) {
                const publicKey = await window.stellar.requestPublicKey();
                walletAddress = publicKey;
                connectedWallet = 'freighter';
                updateWalletStatus();
                showStatus('Freighter connected: ' + publicKey.substring(0, 8) + '...', 'success');
              } else {
                showStatus(walletType + ' wallet not detected', 'error');
              }
            }
          } catch (error) {
            console.error('Wallet connection error:', error);
            showStatus('Failed to connect wallet: ' + error.message, 'error');
          }
        }
        
        // Update wallet status display
        function updateWalletStatus() {
          const statusEl = document.getElementById('wallet-status');
          if (connectedWallet && walletAddress) {
            statusEl.textContent = '✅ Connected: ' + walletAddress.substring(0, 8) + '...';
            statusEl.className = 'status-message status-success';
            statusEl.style.display = 'block';
            
            // Update wallet buttons
            document.querySelectorAll('.wallet-btn').forEach(btn => {
              btn.classList.remove('connected');
            });
            event.target.classList.add('connected');
          } else {
            statusEl.textContent = '🔌 Please connect a wallet to continue';
            statusEl.className = 'status-message status-info';
            statusEl.style.display = 'block';
          }
        }
        
        // Create transaction using backend
        async function createTransaction(amount, recipient, memo) {
          try {
            const response = await fetch('/api/actions/transfer-xlm', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                amount: amount,
                recipient: recipient,
                account: walletAddress,
                memo: memo
              })
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to create transaction');
            }
            
            const result = await response.json();
            showStatus('Transaction created successfully!', 'success');
            
            // Sign and submit transaction
            await signAndSubmitTransaction(result.transaction);
            
          } catch (error) {
            console.error('Transaction error:', error);
            showStatus('Transaction failed: ' + error.message, 'error');
          }
        }
        
        // Sign and submit transaction
        async function signAndSubmitTransaction(transactionXdr) {
          try {
            showStatus('Signing transaction...', 'info');
            
            if (stellarKit && connectedWallet) {
              // Use Stellar Wallets Kit
              const signedTx = await stellarKit.signTransaction(transactionXdr, {
                networkPassphrase: 'Test SDF Network ; September 2015'
              });
              
              showStatus('Transaction signed! Submitting...', 'info');
              
              // Submit to network
              const submitResponse = await fetch('/api/actions/transfer-xlm/submit', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  signedTransaction: signedTx.signedTxXdr
                })
              });
              
              if (submitResponse.ok) {
                showStatus('✅ Transaction submitted successfully!', 'success');
              } else {
                throw new Error('Failed to submit transaction');
              }
            } else {
              showStatus('Wallet not connected or kit not available', 'error');
            }
          } catch (error) {
            console.error('Signing error:', error);
            showStatus('Failed to sign transaction: ' + error.message, 'error');
          }
        }
        
        // Show status message
        function showStatus(message, type) {
          const container = document.getElementById('status-container');
          const statusEl = document.createElement('div');
          statusEl.className = 'status-message status-' + type;
          statusEl.textContent = message;
          
          container.innerHTML = '';
          container.appendChild(statusEl);
          
          // Auto-hide after 5 seconds
          setTimeout(() => {
            statusEl.remove();
          }, 5000);
        }
        
        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
          showStatus('Ready to send XLM! Connect your wallet to get started.', 'info');
        });
      </script>
    </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// POST endpoint for submitting signed transactions
router.post('/submit', async (req, res) => {
  try {
    const { signedTransaction } = req.body;

    if (!signedTransaction) {
      return res.status(400).json({
        error: 'Missing signed transaction',
        message: 'Signed transaction XDR is required',
      });
    }

    // Submit the signed transaction to Stellar network
    const result = await stellarService.submitTransaction(signedTransaction);

    res.json({
      success: true,
      message: 'Transaction submitted successfully',
      hash: result.hash,
      status: result.status,
      metadata: {
        network: getCurrentNetwork().name,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error submitting transaction:', error);

    res.status(500).json({
      error: 'Transaction submission failed',
      message: error.message || 'Failed to submit transaction',
    });
  }
});

// OPTIONS endpoint for CORS preflight
router.options('/', (req, res) => {
  res.status(200).end();
});

router.options('/submit', (req, res) => {
  res.status(200).end();
});

module.exports = router;
