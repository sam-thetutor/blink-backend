#!/usr/bin/env node

/**
 * Stellar XLM Blinks Backend Build Script
 * This script handles building, testing, and packaging the backend service
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${step} ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Build steps
const buildSteps = [
  {
    name: 'Clean',
    command: 'npm run build:clean',
    description: 'Cleaning build artifacts',
  },
  {
    name: 'Lint',
    command: 'npm run lint',
    description: 'Running code linting',
  },
  {
    name: 'Type Check',
    command: 'npm run type-check',
    description: 'Checking code syntax',
  },
  {
    name: 'Test',
    command: 'npm test',
    description: 'Running tests',
  },
  {
    name: 'Format Check',
    command: 'npm run format:check',
    description: 'Checking code formatting',
  },
];

async function runBuild() {
  const startTime = Date.now();

  log('🚀 Starting Stellar XLM Blinks Backend Build', 'bright');
  log('='.repeat(60), 'bright');

  try {
    // Check if we're in the right directory
    if (!fs.existsSync('package.json')) {
      throw new Error(
        'package.json not found. Please run this script from the backend directory.'
      );
    }

    // Check Node.js version
    const nodeVersion = process.version;
    logInfo(`Node.js version: ${nodeVersion}`);

    // Install dependencies if needed
    if (!fs.existsSync('node_modules')) {
      logStep('📦', 'Installing dependencies...');
      execSync('npm install', { stdio: 'inherit' });
      logSuccess('Dependencies installed');
    }

    // Run build steps
    for (const step of buildSteps) {
      logStep(step.name, step.description);

      try {
        execSync(step.command, { stdio: 'inherit' });
        logSuccess(`${step.name} completed successfully`);
      } catch (error) {
        logError(`${step.name} failed: ${error.message}`);
        throw error;
      }
    }

    // Create build info
    const buildInfo = {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      npmVersion: execSync('npm --version', { encoding: 'utf8' }).trim(),
      buildTime: Date.now() - startTime,
      environment: process.env.NODE_ENV || 'development',
    };

    // Save build info
    fs.writeFileSync('build-info.json', JSON.stringify(buildInfo, null, 2));

    // Create production build if requested
    if (process.argv.includes('--prod')) {
      logStep('🏭', 'Creating production build...');

      // Create dist directory
      if (!fs.existsSync('dist')) {
        fs.mkdirSync('dist');
      }

      // Copy necessary files
      const filesToCopy = [
        'server.js',
        'package.json',
        'package-lock.json',
        'env.example',
        'routes/',
        'services/',
        'config/',
        'middleware/',
        'test-blink.js',
        'README.md',
      ];

      for (const file of filesToCopy) {
        if (fs.existsSync(file)) {
          if (fs.lstatSync(file).isDirectory()) {
            // Copy directory
            execSync(`cp -r ${file} dist/`, { stdio: 'inherit' });
          } else {
            // Copy file
            execSync(`cp ${file} dist/`, { stdio: 'inherit' });
          }
        }
      }

      // Create production package.json
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      delete packageJson.devDependencies;
      delete packageJson.scripts;
      packageJson.scripts = {
        start: 'node server.js',
      };

      fs.writeFileSync(
        'dist/package.json',
        JSON.stringify(packageJson, null, 2)
      );

      logSuccess('Production build created in dist/ directory');
    }

    const buildTime = Date.now() - startTime;
    logSuccess(`Build completed successfully in ${buildTime}ms`);
    log('='.repeat(60), 'bright');

    if (process.argv.includes('--prod')) {
      logInfo('Production build available in dist/ directory');
      logInfo('To deploy: cd dist && npm install --production && npm start');
    }
  } catch (error) {
    logError(`Build failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  log('Stellar XLM Blinks Backend Build Script', 'bright');
  log('Usage:', 'cyan');
  log('  node build.js           - Run development build');
  log('  node build.js --prod    - Run production build');
  log('  node build.js --help    - Show this help message');
  process.exit(0);
}

// Run the build
runBuild();
