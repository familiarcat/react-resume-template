#!/usr/bin/env node

/**
 * Verify Amplify Deployment
 * 
 * This script verifies that an Amplify Gen 2 deployment was successful
 * by checking for required files and testing the deployed application.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
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
const success = (message) => console.log(`${colors.green}✓ ${message}${colors.reset}`);
const warning = (message) => console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
const error = (message) => console.log(`${colors.red}✗ ${message}${colors.reset}`);
const info = (message) => console.log(`${colors.blue}ℹ ${message}${colors.reset}`);

// Function to execute shell commands
function runCommand(command, options = {}) {
  const { silent = false, ignoreError = false } = options;
  
  try {
    if (!silent) {
      info(`Executing: ${command}`);
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
  log('\n=== Checking Required Files ===');
  
  const requiredFiles = [
    '.next/required-server-files.json',
    '.next/routes-manifest.json',
    '.next/build-manifest.json',
    'out/.next/required-server-files.json',
    'out/.next/routes-manifest.json',
    'out/.next/build-manifest.json',
    'required-server-files.json',
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

// Function to check if the application is deployed
async function checkDeployment(url) {
  log('\n=== Checking Deployment ===');
  
  return new Promise((resolve) => {
    info(`Checking URL: ${url}`);
    
    https.get(url, (res) => {
      const { statusCode } = res;
      
      if (statusCode === 200) {
        success(`Deployment is live: ${url} (Status: ${statusCode})`);
        resolve(true);
      } else {
        error(`Deployment check failed: ${url} (Status: ${statusCode})`);
        resolve(false);
      }
    }).on('error', (err) => {
      error(`Deployment check error: ${err.message}`);
      resolve(false);
    });
  });
}

// Function to run tests against the deployed application
function runDeploymentTests() {
  log('\n=== Running Deployment Tests ===');
  
  // Run the tests
  const testResult = runCommand('npm run test:amplify', { ignoreError: true });
  
  if (testResult.success) {
    success('Deployment tests passed');
    return true;
  } else {
    error('Deployment tests failed');
    return false;
  }
}

// Main function
async function main() {
  log('\n=== Verifying Amplify Deployment ===');
  
  // Start timer
  const startTime = Date.now();
  
  // Check required files
  const filesExist = checkRequiredFiles();
  if (!filesExist) {
    error('Required files check failed');
    // Continue anyway to check deployment
  }
  
  // Get deployment URL from environment or command line
  const deploymentUrl = process.env.DEPLOYMENT_URL || process.argv[2] || 'https://main.d28u81cjrxr0oe.amplifyapp.com';
  
  // Check deployment
  const deploymentLive = await checkDeployment(deploymentUrl);
  if (!deploymentLive) {
    error('Deployment check failed');
    // Continue anyway to run tests
  }
  
  // Run deployment tests
  const testsPass = runDeploymentTests();
  if (!testsPass) {
    error('Deployment tests failed');
    // Continue anyway to provide a complete report
  }
  
  // Calculate elapsed time
  const endTime = Date.now();
  const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);
  
  // Final report
  log('\n=== Deployment Verification Report ===');
  log(`Time: ${elapsedSeconds} seconds`);
  log(`Required Files: ${filesExist ? 'PASS' : 'FAIL'}`);
  log(`Deployment: ${deploymentLive ? 'PASS' : 'FAIL'}`);
  log(`Tests: ${testsPass ? 'PASS' : 'FAIL'}`);
  log(`Overall: ${filesExist && deploymentLive && testsPass ? 'PASS' : 'FAIL'}`);
  
  // Return success if all checks pass
  return filesExist && deploymentLive && testsPass;
}

// Run the main function
if (require.main === module) {
  main().then(success => {
    if (success) {
      log('\n=== Deployment Verification Successful ===');
      process.exit(0);
    } else {
      log('\n=== Deployment Verification Failed ===');
      process.exit(1);
    }
  }).catch(err => {
    error(`Verification failed: ${err.message}`);
    process.exit(1);
  });
}

// Export functions for use in other scripts
module.exports = {
  checkRequiredFiles,
  checkDeployment,
  runDeploymentTests
};
