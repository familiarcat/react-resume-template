#!/usr/bin/env node

/**
 * Ensure Node.js Version Script
 * 
 * This script checks if the current Node.js version matches the required version
 * and attempts to switch to the correct version if needed.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const semver = require('semver');

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

// Function to ensure the correct Node.js version
function ensureNodeVersion() {
  log('\n=== Ensuring Correct Node.js Version ===');
  
  try {
    // Get the current Node.js version
    const currentVersion = process.version;
    info(`Current Node.js version: ${currentVersion}`);
    
    // Get the required Node.js version from .nvmrc
    const nvmrcPath = path.join(process.cwd(), '.nvmrc');
    if (!fs.existsSync(nvmrcPath)) {
      warning('.nvmrc file not found');
      return false;
    }
    
    const requiredVersion = fs.readFileSync(nvmrcPath, 'utf8').trim();
    info(`Required Node.js version: ${requiredVersion}`);
    
    // Check if the current version matches the required version
    if (semver.satisfies(currentVersion, `>=${requiredVersion}`)) {
      success(`Node.js version ${currentVersion} satisfies the required version ${requiredVersion}`);
      return true;
    }
    
    // Try to switch to the required version using nvm
    warning(`Node.js version ${currentVersion} does not satisfy the required version ${requiredVersion}`);
    
    try {
      // Check if nvm is available
      execSync('command -v nvm', { stdio: 'ignore' });
      
      // Try to switch to the required version
      info(`Attempting to switch to Node.js version ${requiredVersion} using nvm`);
      execSync(`nvm use ${requiredVersion}`, { stdio: 'inherit' });
      
      // Check if the switch was successful
      const newVersion = execSync('node -v', { encoding: 'utf8' }).trim();
      if (semver.satisfies(newVersion, `>=${requiredVersion}`)) {
        success(`Successfully switched to Node.js version ${newVersion}`);
        return true;
      } else {
        warning(`Failed to switch to Node.js version ${requiredVersion}`);
      }
    } catch (nvmErr) {
      // nvm is not available, try to use n
      try {
        execSync('command -v n', { stdio: 'ignore' });
        
        // Try to switch to the required version
        info(`Attempting to switch to Node.js version ${requiredVersion} using n`);
        execSync(`sudo n ${requiredVersion}`, { stdio: 'inherit' });
        
        // Check if the switch was successful
        const newVersion = execSync('node -v', { encoding: 'utf8' }).trim();
        if (semver.satisfies(newVersion, `>=${requiredVersion}`)) {
          success(`Successfully switched to Node.js version ${newVersion}`);
          return true;
        } else {
          warning(`Failed to switch to Node.js version ${requiredVersion}`);
        }
      } catch (nErr) {
        // Neither nvm nor n is available
        warning('Neither nvm nor n is available to switch Node.js versions');
      }
    }
    
    // If we're in AWS Amplify, try to use the NODE_VERSION environment variable
    if (process.env.AWS_EXECUTION_ENV && process.env.AWS_EXECUTION_ENV.includes('Amplify')) {
      info('Running in AWS Amplify environment');
      
      // Set the NODE_VERSION environment variable
      process.env.NODE_VERSION = requiredVersion;
      info(`Set NODE_VERSION environment variable to ${requiredVersion}`);
      
      // Check if the AWS Amplify environment has the required Node.js version
      try {
        const availableVersions = execSync('ls -la /root/.nvm/versions/node', { encoding: 'utf8' });
        info(`Available Node.js versions in AWS Amplify:\n${availableVersions}`);
        
        if (availableVersions.includes(`v${requiredVersion}`)) {
          info(`Node.js version ${requiredVersion} is available in AWS Amplify`);
          
          // Try to use the required version
          execSync(`export NODE_VERSION=${requiredVersion}`, { stdio: 'inherit' });
          success(`Set NODE_VERSION to ${requiredVersion}`);
          return true;
        } else {
          warning(`Node.js version ${requiredVersion} is not available in AWS Amplify`);
        }
      } catch (amplifyErr) {
        warning(`Failed to check available Node.js versions in AWS Amplify: ${amplifyErr.message}`);
      }
    }
    
    // If all else fails, warn the user
    warning(`Unable to switch to Node.js version ${requiredVersion}`);
    warning('This may cause compatibility issues with some packages');
    return false;
  } catch (err) {
    error(`Failed to ensure Node.js version: ${err.message}`);
    return false;
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  const result = ensureNodeVersion();
  process.exit(result ? 0 : 1);
}

module.exports = { ensureNodeVersion };
