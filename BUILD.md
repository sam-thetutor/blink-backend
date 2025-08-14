# 🚀 Stellar XLM Blinks Backend - Build Guide

This document explains how to build, test, and deploy the Stellar XLM Blinks Backend service.

## 📋 Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **Git**: For version control
- **Docker**: For containerized builds (optional)

## 🛠️ Available Build Scripts

### Basic Build Commands

```bash
# Development build (default)
npm run build

# Production build
npm run build:prod

# Clean build artifacts
npm run clean

# Run tests only
npm test

# Run tests in watch mode
npm run test:watch
```

### Code Quality Commands

```bash
# Lint code
npm run lint

# Check code formatting
npm run format:check

# Format code automatically
npm run format

# Type checking
npm run type-check
```

### Advanced Commands

```bash
# Validate everything
npm run validate

# Create deployment package
npm run package

# Check deployment readiness
npm run deploy:check
```

## 🔧 Build Process

### 1. Development Build

```bash
npm run build
```

This command runs:

- 🧹 **Clean**: Removes old build artifacts
- 🔍 **Lint**: Checks code quality with ESLint
- 🔍 **Type Check**: Validates JavaScript syntax
- 🧪 **Test**: Runs all tests
- ✅ **Post-build**: Creates build info

### 2. Production Build

```bash
npm run build:prod
```

This creates a production-ready build:

- Creates `dist/` directory
- Copies only necessary files
- Removes development dependencies
- Optimizes for production deployment

### 3. Custom Build Script

```bash
# Run the custom build script
node build.js

# Production build
node build.js --prod

# Show help
node build.js --help
```

## 🐳 Docker Builds

### Build Docker Image

```bash
# Build development image
docker build -t stellar-backend:dev .

# Build production image
docker build -t stellar-backend:prod --target production .
```

### Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# Start only backend
docker-compose up stellar-backend

# View logs
docker-compose logs -f stellar-backend

# Stop all services
docker-compose down
```

### Docker Commands

```bash
# Build and run
docker build -t stellar-backend .
docker run -p 3001:3001 stellar-backend

# Run with environment variables
docker run -p 3001:3001 \
  -e NODE_ENV=production \
  -e STELLAR_NETWORK=testnet \
  stellar-backend
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
node test-blink.js
```

### Test Coverage

```bash
# Run tests with coverage
npm run test:coverage
```

## 📦 Deployment

### 1. Local Deployment

```bash
# Build for production
npm run build:prod

# Start production server
cd dist
npm install --production
npm start
```

### 2. Docker Deployment

```bash
# Build production image
docker build -t stellar-backend:prod --target production .

# Run production container
docker run -d \
  --name stellar-backend \
  -p 3001:3001 \
  -e NODE_ENV=production \
  stellar-backend:prod
```

### 3. Cloud Deployment

#### Heroku

```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set STELLAR_NETWORK=testnet

# Deploy
git push heroku main
```

#### AWS ECS

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker tag stellar-backend:prod your-account.dkr.ecr.us-east-1.amazonaws.com/stellar-backend:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/stellar-backend:latest

# Deploy to ECS
aws ecs update-service --cluster your-cluster --service stellar-backend --force-new-deployment
```

## 🔍 Monitoring & Health Checks

### Health Check Endpoint

```bash
curl http://localhost:3001/api/health
```

Response:

```json
{
  "status": "healthy",
  "service": "Stellar XLM Blinks Backend",
  "timestamp": "2025-08-14T10:00:00.000Z",
  "network": "testnet"
}
```

### Docker Health Check

The Docker container includes automatic health checks:

- Checks every 30 seconds
- Timeout after 3 seconds
- Retries 3 times
- 5-second startup grace period

## 📊 Build Artifacts

### Generated Files

- `dist/` - Production build directory
- `build-info.json` - Build metadata
- `logs/` - Application logs (if configured)

### Build Info Structure

```json
{
  "timestamp": "2025-08-14T10:00:00.000Z",
  "nodeVersion": "v18.17.0",
  "npmVersion": "9.6.7",
  "buildTime": 1500,
  "environment": "production"
}
```

## 🚨 Troubleshooting

### Common Issues

#### Build Fails on Lint

```bash
# Fix linting issues automatically
npm run format

# Check specific files
npx eslint server.js
```

#### Tests Fail

```bash
# Check test configuration
node -c test-blink.js

# Run tests with verbose output
npm test -- --verbose
```

#### Docker Build Fails

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t stellar-backend .
```

### Environment Variables

Make sure these are set:

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3001)
- `STELLAR_NETWORK` - Stellar network (testnet/mainnet)
- `STELLAR_HORIZON_URL` - Stellar Horizon API URL
- `CORS_ORIGIN` - CORS allowed origins

## 📚 Additional Resources

- [Stellar Documentation](https://developers.stellar.org/)
- [Dialect Blinks Documentation](https://docs.dialect.to/blinks)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the build process: `npm run build`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
