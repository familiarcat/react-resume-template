#!/usr/bin/env node

/**
 * Memory-Efficient Installation Script
 * 
 * This script performs a memory-efficient installation of dependencies
 * by installing packages in smaller batches to avoid memory issues.
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

// Function to execute shell commands with memory limits
function execCommandWithMemory(command, options = {}) {
  try {
    log(`\n$ ${command}`);
    
    // Add NODE_OPTIONS to limit memory if not already set
    const env = { ...process.env };
    if (!env.NODE_OPTIONS || !env.NODE_OPTIONS.includes('--max-old-space-size=')) {
      env.NODE_OPTIONS = `${env.NODE_OPTIONS || ''} --max-old-space-size=2048`;
    }
    
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'inherit',
      env,
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

// Function to get available memory
function getAvailableMemory() {
  try {
    if (process.platform === 'linux') {
      const memInfo = fs.readFileSync('/proc/meminfo', 'utf8');
      const availableMatch = memInfo.match(/MemAvailable:\s+(\d+)/);
      if (availableMatch && availableMatch[1]) {
        // Convert from KB to MB
        return Math.floor(parseInt(availableMatch[1], 10) / 1024);
      }
    }
  } catch (err) {
    warning(`Could not determine available memory: ${err.message}`);
  }
  
  // Default to a conservative estimate
  return isRunningInAmplify() ? 1024 : 4096;
}

// Function to install dependencies in batches
async function installDependenciesInBatches() {
  info('Installing dependencies in batches to reduce memory usage...');
  
  // Read package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch (err) {
    error(`Failed to read package.json: ${err.message}`);
    return false;
  }
  
  // Get dependencies and devDependencies
  const dependencies = { ...packageJson.dependencies };
  const devDependencies = { ...packageJson.devDependencies };
  
  // Install core dependencies first (AWS SDK and Amplify packages)
  const coreDependencies = {};
  const otherDependencies = {};
  
  // Separate core dependencies from other dependencies
  Object.entries(dependencies).forEach(([name, version]) => {
    if (name.startsWith('@aws-sdk/') || name.startsWith('@aws-amplify/') || name.startsWith('@smithy/')) {
      coreDependencies[name] = version;
    } else {
      otherDependencies[name] = version;
    }
  });
  
  // Install production dependencies first
  info('Installing core AWS dependencies...');
  const coreDepsList = Object.entries(coreDependencies)
    .map(([name, version]) => `${name}@${version.replace(/^\^|~/, '')}`)
    .join(' ');
  
  if (coreDepsList) {
    try {
      execCommandWithMemory(`npm install --no-save --no-audit --no-fund ${coreDepsList}`);
    } catch (err) {
      warning(`Failed to install core dependencies: ${err.message}`);
      warning('Continuing with installation...');
    }
  }
  
  // Install other dependencies in batches
  const batchSize = 10;
  const otherDepsList = Object.entries(otherDependencies);
  const batches = [];
  
  for (let i = 0; i < otherDepsList.length; i += batchSize) {
    batches.push(otherDepsList.slice(i, i + batchSize));
  }
  
  info(`Installing other dependencies in ${batches.length} batches...`);
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const batchDepsList = batch
      .map(([name, version]) => `${name}@${version.replace(/^\^|~/, '')}`)
      .join(' ');
    
    info(`Installing batch ${i + 1}/${batches.length}...`);
    
    try {
      execCommandWithMemory(`npm install --no-save --no-audit --no-fund ${batchDepsList}`);
    } catch (err) {
      warning(`Failed to install batch ${i + 1}: ${err.message}`);
      warning('Continuing with next batch...');
    }
  }
  
  // Install dev dependencies in batches
  const devDepsList = Object.entries(devDependencies);
  const devBatches = [];
  
  for (let i = 0; i < devDepsList.length; i += batchSize) {
    devBatches.push(devDepsList.slice(i, i + batchSize));
  }
  
  info(`Installing dev dependencies in ${devBatches.length} batches...`);
  
  for (let i = 0; i < devBatches.length; i++) {
    const batch = devBatches[i];
    const batchDepsList = batch
      .map(([name, version]) => `${name}@${version.replace(/^\^|~/, '')}`)
      .join(' ');
    
    info(`Installing dev batch ${i + 1}/${devBatches.length}...`);
    
    try {
      execCommandWithMemory(`npm install --no-save --no-audit --no-fund --save-dev ${batchDepsList}`);
    } catch (err) {
      warning(`Failed to install dev batch ${i + 1}: ${err.message}`);
      warning('Continuing with next batch...');
    }
  }
  
  // Final npm install to ensure package-lock.json is updated
  info('Running final npm install to ensure all dependencies are installed...');
  try {
    execCommandWithMemory('npm install --no-audit --no-fund --prefer-offline');
    success('All dependencies installed successfully');
    return true;
  } catch (err) {
    error(`Failed to install dependencies: ${err.message}`);
    return false;
  }
}

// Main function
async function main() {
  log('\n=== Memory-Efficient Installation ===');
  
  // Start timer
  const startTime = Date.now();
  
  // Check available memory
  const availableMemory = getAvailableMemory();
  info(`Available memory: ${availableMemory} MB`);
  
  // Check if running in AWS Amplify
  if (isRunningInAmplify()) {
    info('Running in AWS Amplify environment.');
  } else {
    info('Running in local environment.');
  }
  
  // Install dependencies in batches
  const result = await installDependenciesInBatches();
  
  // Calculate elapsed time
  const endTime = Date.now();
  const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);
  
  if (result) {
    success(`\nInstallation completed in ${elapsedSeconds} seconds.`);
  } else {
    warning(`\nInstallation completed with issues in ${elapsedSeconds} seconds.`);
  }
  
  return result;
}

// Run the main function
if (require.main === module) {
  main().catch(err => {
    error(`Unexpected error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { installDependenciesInBatches, main };
