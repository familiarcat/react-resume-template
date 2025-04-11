#!/usr/bin/env node

/**
 * Test Amplify Build
 * 
 * This script tests the Amplify Gen 2 build process locally
 * to ensure it will work in the Amplify environment.
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
const log = (message) => console.log(`${colors.blue}[Test] ${message}${colors.reset}`);
const success = (message) => console.log(`${colors.green}✓ ${message}${colors.reset}`);
const warning = (message) => console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
const error = (message) => console.log(`${colors.red}✗ ${message}${colors.reset}`);

// Function to execute shell commands
function runCommand(command, options = {}) {
  const { silent = false, ignoreError = false } = options;
  
  try {
    if (!silent) {
      log(`Executing: ${command}`);
    }
    
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit'
    });
    
    return { success: true, output };
  } catch (err) {
    if (!ignoreError) {
      error(`Command failed: ${command}`);
      error(err.message);
    }
    
    return { success: false, error: err, output: err.stdout };
  }
}

// Function to check if required files exist
function checkRequiredFiles() {
  log('Checking required files...');
  
  const requiredFiles = [
    '.next/required-server-files.json',
    '.next/routes-manifest.json',
    'out/.next/required-server-files.json',
    'out/.next/routes-manifest.json'
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      success(`File exists: ${file}`);
    } else {
      error(`File missing: ${file}`);
      allFilesExist = false;
    }
  }
  
  return allFilesExist;
}

// Main function
async function main() {
  log('Starting Amplify build test...');
  
  // Start timer
  const startTime = Date.now();
  
  // Run the build
  log('Running Amplify Gen 2 build...');
  const buildResult = runCommand('npm run amplify:gen2:build');
  
  if (!buildResult.success) {
    error('Build failed');
    return false;
  }
  
  success('Build completed');
  
  // Check required files
  const filesExist = checkRequiredFiles();
  
  if (!filesExist) {
    error('Required files check failed');
    return false;
  }
  
  success('Required files check passed');
  
  // Calculate elapsed time
  const endTime = Date.now();
  const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);
  
  success(`Test completed in ${elapsedSeconds} seconds`);
  return true;
}

// Run the main function
if (require.main === module) {
  main().then(success => {
    if (success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  }).catch(err => {
    error(`Test failed: ${err.message}`);
    process.exit(1);
  });
}

// Export functions for use in other scripts
module.exports = {
  checkRequiredFiles
};
