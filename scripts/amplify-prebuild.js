#!/usr/bin/env node

/**
 * Amplify Pre-Build Script
 *
 * This script runs before the build process in AWS Amplify.
 * It ensures that all dependencies are properly installed and the package-lock.json is up to date.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

// Function to execute shell commands
function execCommand(command, options = {}) {
  try {
    log(`\n$ ${command}`);
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'inherit',
      ...options
    });
    return { success: true, output };
  } catch (err) {
    if (options.ignoreError) {
      warning(`Command failed but continuing: ${command}`);
      warning(`Error: ${err.message}`);
      return { success: false, error: err };
    }
    throw err;
  }
}

// Function to check if running in AWS Amplify
function isRunningInAmplify() {
  return !!process.env.AWS_EXECUTION_ENV;
}

// Function to check Node.js version
function checkNodeVersion() {
  const nodeVersion = process.version;
  info(`Node.js version: ${nodeVersion}`);

  // Parse version string (e.g., 'v18.18.2' -> [18, 18, 2])
  const versionParts = nodeVersion.slice(1).split('.').map(Number);

  // Check if Node.js version is >= 18.19.0
  if (versionParts[0] < 18 || (versionParts[0] === 18 && versionParts[1] < 19)) {
    warning(`Node.js version ${nodeVersion} may be too old for AWS SDK v3 and Amplify Gen 2.`);
    warning('Recommended version is >= 18.19.0 or >= 20.5.0');
  } else {
    success(`Node.js version ${nodeVersion} is compatible with AWS SDK v3 and Amplify Gen 2.`);
  }
}

// Function to ensure Smithy dependencies are installed
function ensureSmithyDependencies() {
  info('Ensuring Smithy dependencies are installed...');

  const smithyPackages = [
    '@smithy/is-array-buffer@2.2.0',
    '@smithy/credential-provider-imds@2.3.0',
    '@smithy/util-hex-encoding@2.2.0',
    '@smithy/util-uri-escape@2.2.0',
    '@smithy/util-utf8@2.3.0',
    '@smithy/util-buffer-from@2.2.0'
  ];

  // Install each package explicitly
  smithyPackages.forEach(pkg => {
    try {
      info(`Installing ${pkg}...`);
      execSync(`npm install ${pkg} --no-save`, { stdio: 'inherit' });
    } catch (err) {
      warning(`Failed to install ${pkg}: ${err.message}`);
    }
  });

  success('Smithy dependencies installation completed.');
}

// Function to update package-lock.json
function updatePackageLock() {
  info('Updating package-lock.json...');

  try {
    // First try to use our custom fix-package-lock script
    execSync('node scripts/fix-package-lock.js', { stdio: 'inherit' });

    // Then update the package-lock.json with npm
    execSync('npm install --package-lock-only', { stdio: 'inherit' });
    success('package-lock.json updated successfully.');
  } catch (err) {
    error(`Failed to update package-lock.json: ${err.message}`);
  }
}

// Main function
async function main() {
  log('\n=== Amplify Pre-Build Script ===');

  // Start timer
  const startTime = Date.now();

  // Check if running in AWS Amplify
  if (isRunningInAmplify()) {
    info('Running in AWS Amplify environment.');
  } else {
    info('Running in local environment.');
  }

  // Check Node.js version
  checkNodeVersion();

  // Ensure Smithy dependencies are installed
  ensureSmithyDependencies();

  // Update package-lock.json
  updatePackageLock();

  // Install dependencies with --no-audit to speed up installation
  info('Installing dependencies...');
  execCommand('npm install --no-audit', { ignoreError: true });

  // Calculate elapsed time
  const endTime = Date.now();
  const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);

  success(`\nPre-build completed in ${elapsedSeconds} seconds.`);
}

// Run the main function
main().catch(err => {
  error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
