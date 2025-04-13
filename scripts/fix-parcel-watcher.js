#!/usr/bin/env node

/**
 * Fix Parcel Watcher Script
 * 
 * This script fixes issues with @parcel/watcher in AWS Amplify deployment.
 * It installs the correct platform-specific binary for the current environment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

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
const info = (message) => console.log(`${colors.blue}[INFO]${colors.reset} ${message}`);
const success = (message) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);
const warning = (message) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);
const error = (message) => console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);

// Function to detect platform
const detectPlatform = () => {
  const platform = os.platform();
  const arch = os.arch();
  
  info(`Detected platform: ${platform}-${arch}`);
  
  if (platform === 'linux' && arch === 'x64') {
    return '@parcel/watcher-linux-x64-glibc';
  } else if (platform === 'darwin' && arch === 'x64') {
    return '@parcel/watcher-darwin-x64';
  } else if (platform === 'darwin' && arch === 'arm64') {
    return '@parcel/watcher-darwin-arm64';
  } else if (platform === 'win32' && arch === 'x64') {
    return '@parcel/watcher-win32-x64';
  } else {
    warning(`Unsupported platform: ${platform}-${arch}`);
    return null;
  }
};

// Function to install platform-specific watcher
const installWatcher = (packageName) => {
  if (!packageName) {
    error('No package name provided');
    return false;
  }
  
  try {
    info(`Installing ${packageName}...`);
    execSync(`npm install ${packageName} --no-save`, { stdio: 'inherit' });
    success(`Successfully installed ${packageName}`);
    return true;
  } catch (err) {
    error(`Failed to install ${packageName}: ${err.message}`);
    return false;
  }
};

// Function to check if running in AWS Amplify
const isRunningInAmplify = () => {
  return !!process.env.AWS_EXECUTION_ENV && process.env.AWS_EXECUTION_ENV.startsWith('AWS_ECS');
};

// Main function
async function main() {
  log('\n=== Fixing Parcel Watcher ===');
  
  // Start timer
  const startTime = Date.now();
  
  try {
    // Check if running in AWS Amplify
    if (isRunningInAmplify()) {
      info('Running in AWS Amplify environment');
      // In Amplify, we know we need the Linux x64 glibc version
      const result = installWatcher('@parcel/watcher-linux-x64-glibc');
      
      // Calculate elapsed time
      const endTime = Date.now();
      const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);
      
      if (result) {
        success(`Parcel watcher fixed in ${elapsedSeconds} seconds`);
        return true;
      } else {
        error(`Failed to fix parcel watcher after ${elapsedSeconds} seconds`);
        return false;
      }
    } else {
      // Detect platform and install appropriate watcher
      const packageName = detectPlatform();
      if (!packageName) {
        warning('Could not determine appropriate package for your platform');
        return false;
      }
      
      const result = installWatcher(packageName);
      
      // Calculate elapsed time
      const endTime = Date.now();
      const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);
      
      if (result) {
        success(`Parcel watcher fixed in ${elapsedSeconds} seconds`);
        return true;
      } else {
        error(`Failed to fix parcel watcher after ${elapsedSeconds} seconds`);
        return false;
      }
    }
  } catch (err) {
    error(`Unexpected error: ${err.message}`);
    return false;
  }
}

// Run the main function
if (require.main === module) {
  main().then(success => {
    if (success) {
      log('\n=== Fixing Parcel Watcher Successful ===');
      process.exit(0);
    } else {
      log('\n=== Fixing Parcel Watcher Failed ===');
      process.exit(1);
    }
  }).catch(err => {
    error(`Unexpected error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { main };
