# Stellar XLM Blinks Backend

A backend service that implements Stellar XLM transfer functionality following the [Dialect Blinks specification](https://docs.dialect.to/blinks). This service allows users to create and interact with Stellar XLM transfer Blinks that can be shared, embedded, and used across any platform that supports the Blinks standard.

## 🚀 Features

- **XLM Transfer Blinks**: Create shareable Stellar XLM transfer links
- **Dialect Blinks Compliant**: Follows the exact specification for blockchain actions
- **Stellar Testnet Support**: Built for development and testing
- **Freighter Wallet Ready**: Optimized for Stellar wallet integration
- **RESTful API**: Clean, documented endpoints for easy integration

## 🏗️ Architecture

The service follows the Dialect Blinks architecture with two main components:

1. **Blink Provider (This Backend)**: Serves XLM transfer transactions via REST API
2. **Blink Client (Frontend)**: Renders and interacts with the Blinks

### Project Structure

```
backend/
├── config/
│   └── stellar-config.js      # Stellar network configuration
├── middleware/
│   └── cors.js               # CORS middleware for Blinks
├── routes/
│   ├── actions/
│   │   └── transfer-xlm.js   # XLM transfer Blink endpoints
│   └── index.js              # Route organization
├── services/
│   └── stellar-xlm-service.js # Core Stellar transaction logic
├── server.js                  # Main Express server
├── package.json              # Dependencies and scripts
└── env.example               # Environment configuration
```

## 🛠️ Installation

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Stellar testnet account (for testing)

### Setup

1. **Clone and install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment configuration:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## ⚙️ Configuration

### Environment Variables

```bash
# Stellar Network Configuration
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Stellar Testnet Configuration
STELLAR_TESTNET_PASSPHRASE=Test SDF Network ; September 2015
```

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### XLM Transfer Blink

#### GET - Blink Metadata
```
GET /api/actions/transfer-xlm
```
Returns the Blink configuration following Dialect specification.

**Response Example:**
```json
{
  "type": "action",
  "icon": "http://localhost:3001/api/actions/transfer-xlm/icon",
  "label": "Transfer XLM",
  "title": "Transfer XLM on Stellar",
  "description": "Send XLM to any Stellar account. Choose a preset amount or enter a custom amount.",
  "links": {
    "actions": [
      {
        "type": "transaction",
        "label": "1 XLM",
        "href": "/api/actions/transfer-xlm?amount=1"
      },
      {
        "type": "transaction",
        "label": "Custom Transfer",
        "href": "/api/actions/transfer-xlm?amount={amount}&recipient={recipient}",
        "parameters": [
          {
            "name": "amount",
            "label": "Amount in XLM",
            "type": "number",
            "required": true,
            "min": 0.0000001,
            "max": 1000000
          },
          {
            "name": "recipient",
            "label": "Recipient Stellar Address",
            "type": "string",
            "required": true,
            "pattern": "^G[A-Z0-9]{55}$"
          }
        ]
      }
    ]
  }
}
```

#### POST - Create Transaction
```
POST /api/actions/transfer-xlm
```

**Request Body:**
```json
{
  "amount": "10.5",
  "recipient": "GABC123...",
  "account": "GXYZ789...",
  "memo": "Optional memo"
}
```

**Response Example:**
```json
{
  "type": "transaction",
  "transaction": "AAAA...", // XDR format transaction
  "message": "Transfer 10.5 XLM to GABC123...",
  "metadata": {
    "amount": 10.5,
    "amountStroops": 105000000,
    "recipient": "GABC123...",
    "source": "GXYZ789...",
    "fee": "100",
    "network": "testnet",
    "memo": "Optional memo"
  }
}
```

#### OPTIONS - CORS Preflight
```
OPTIONS /api/actions/transfer-xlm
```

### Icon Endpoint
```
GET /api/actions/transfer-xlm/icon
```
Returns an SVG icon for the Blink.

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

### Adding New Blinks

To add new Stellar operation Blinks:

1. Create a new service in `services/`
2. Create a new route in `routes/actions/`
3. Update the main routes index
4. Follow the Dialect Blinks specification

### Testing

The service is designed to work with:
- **Stellar Testnet**: For development and testing
- **Freighter Wallet**: Primary Stellar wallet integration
- **Dialect Blinks Client**: For rendering and interaction

## 🌐 Integration

### With Dialect Blinks

This backend follows the [Dialect Blinks specification](https://docs.dialect.to/blinks) exactly, making it compatible with:

- Dialect Blinks clients
- Wallets that support Blinks
- Social platforms that unfurl Blinks
- Any application that implements the Blinks standard

### With Stellar Applications

- **Freighter Wallet**: Direct integration
- **Stellar SDK**: Full compatibility
- **Horizon API**: Network interaction
- **Custom Frontends**: Easy integration via REST API

## 🔒 Security

- **Input Validation**: All inputs are validated before processing
- **CORS Configuration**: Properly configured for cross-origin requests
- **Error Handling**: Comprehensive error handling without information leakage
- **Rate Limiting**: To be implemented for production use

## 🚧 Limitations & Future Improvements

### Current Limitations
- Only supports XLM transfers (no other assets)
- Testnet only (mainnet support planned)
- Basic transaction building (advanced features planned)

### Planned Features
- **Multi-asset Support**: Transfer custom Stellar tokens
- **Path Payments**: Cross-currency transfers
- **Account Management**: Create and manage accounts
- **Multi-signature**: Support for multi-sig operations
- **Mainnet Support**: Production-ready mainnet deployment

## 📚 Resources

- [Dialect Blinks Documentation](https://docs.dialect.to/blinks)
- [Stellar SDK Documentation](https://stellar.github.io/js-stellar-sdk/)
- [Stellar Testnet](https://www.stellar.org/developers/guides/getting-started/create-account.html)
- [Freighter Wallet](https://www.freighter.app/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
- Check the [Dialect documentation](https://docs.dialect.to/blinks)
- Review Stellar SDK documentation
- Open an issue in this repository

---

**Note**: This service is designed for development and testing. For production use, ensure proper security measures, rate limiting, and mainnet configuration. 