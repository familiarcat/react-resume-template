#!/usr/bin/env node

/**
 * Dependency Verification Script
 *
 * This script verifies that all required dependencies are installed
 * and installs any missing dependencies.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Helper functions
const log = (message) => console.log(message);
const success = (message) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);
const warning = (message) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);
const error = (message) => console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);
const info = (message) => console.log(`${colors.blue}[INFO]${colors.reset} ${message}`);

// List of required dependencies
const requiredDependencies = {
  // Core dependencies
  'next': '^14.0.0',
  'react': '^18.2.0',
  'react-dom': '^18.2.0',

  // UI utilities
  'clsx': '^2.0.0',
  'classnames': '^2.3.2',
  'tailwind-merge': '^1.14.0',

  // UI components
  '@headlessui/react': '^1.7.0',
  '@heroicons/react': '^2.0.0',

  // AWS Amplify (if needed)
  'aws-amplify': '^6.0.0'
};

// List of required dev dependencies
const requiredDevDependencies = {
  'typescript': '^5.0.0',
  '@types/react': '^18.2.0',
  '@types/react-dom': '^18.2.0',
  '@types/node': '^20.0.0',
  '@types/classnames': '^2.3.1'
};

// Function to verify and install dependencies
async function verifyDependencies() {
  log('\n=== Verifying Dependencies ===');

  try {
    // Read package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Check for missing dependencies
    const missingDependencies = [];
    const outdatedDependencies = [];

    Object.entries(requiredDependencies).forEach(([dep, version]) => {
      if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
        missingDependencies.push(`${dep}@${version}`);
      }
    });

    // Check for missing dev dependencies
    const missingDevDependencies = [];

    Object.entries(requiredDevDependencies).forEach(([dep, version]) => {
      if (!packageJson.devDependencies || !packageJson.devDependencies[dep]) {
        missingDevDependencies.push(`${dep}@${version}`);
      }
    });

    // Install missing dependencies
    if (missingDependencies.length > 0) {
      info(`Installing missing dependencies: ${missingDependencies.join(', ')}`);
      try {
        execSync(`npm install ${missingDependencies.join(' ')} --save`, { stdio: 'inherit' });
        success('Missing dependencies installed successfully');
      } catch (err) {
        error(`Failed to install dependencies: ${err.message}`);
      }
    } else {
      success('All required dependencies are installed');
    }

    // Install missing dev dependencies
    if (missingDevDependencies.length > 0) {
      info(`Installing missing dev dependencies: ${missingDevDependencies.join(', ')}`);
      try {
        execSync(`npm install ${missingDevDependencies.join(' ')} --save-dev`, { stdio: 'inherit' });
        success('Missing dev dependencies installed successfully');
      } catch (err) {
        error(`Failed to install dev dependencies: ${err.message}`);
      }
    } else {
      success('All required dev dependencies are installed');
    }

    // Verify node_modules
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      warning('node_modules directory not found');
      info('Running npm install to create node_modules');
      execSync('npm install', { stdio: 'inherit' });
    }

    // Verify critical dependencies in node_modules
    const criticalDeps = ['clsx', 'classnames', 'tailwind-merge', '@headlessui/react', '@heroicons/react', 'next', 'react', 'react-dom'];
    const missingModules = [];

    criticalDeps.forEach(dep => {
      const depPath = path.join(nodeModulesPath, dep);
      if (!fs.existsSync(depPath)) {
        missingModules.push(dep);
      }
    });

    if (missingModules.length > 0) {
      warning(`Some critical modules are missing from node_modules: ${missingModules.join(', ')}`);
      info('Running npm install to fix missing modules');
      execSync('npm install', { stdio: 'inherit' });
    } else {
      success('All critical modules are present in node_modules');
    }

    return true;
  } catch (err) {
    error(`Dependency verification failed: ${err.message}`);
    return false;
  }
}

// Run the verification if this script is executed directly
if (require.main === module) {
  verifyDependencies().then(result => {
    if (result) {
      success('\nDependency verification completed successfully');
      process.exit(0);
    } else {
      error('\nDependency verification failed');
      process.exit(1);
    }
  });
}

module.exports = { verifyDependencies };
