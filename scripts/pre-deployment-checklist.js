#!/usr/bin/env node

/**
 * Pre-Deployment Checklist
 * 
 * This script runs a series of checks to ensure that the application
 * is ready for deployment to Amplify Gen 2.
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

// Function to check if required files exist in the repository
function checkRequiredFiles() {
  log('\n=== Checking Required Files ===');
  
  const requiredFiles = [
    'amplify.yml',
    'package.json',
    'next.config.js',
    'scripts/amplify-minimal-build.js',
    'scripts/amplify-fix-required-files.js',
    'app/lib/amplify-server-conduit.ts',
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

// Function to check if the tests pass
function runTests() {
  log('\n=== Running Tests ===');
  
  // Run the tests
  const testResult = runCommand('npm run test:amplify', { ignoreError: true });
  
  if (testResult.success) {
    success('Tests passed');
    return true;
  } else {
    error('Tests failed');
    return false;
  }
}

// Function to check if the build process works
function checkBuild() {
  log('\n=== Checking Build Process ===');
  
  // Run the build
  const buildResult = runCommand('npm run amplify:gen2:build', { ignoreError: true });
  
  if (buildResult.success) {
    success('Build process works');
    return true;
  } else {
    error('Build process failed');
    return false;
  }
}

// Function to check if the required files are created by the build process
function checkBuildOutput() {
  log('\n=== Checking Build Output ===');
  
  // Fix required files
  runCommand('npm run amplify:gen2:fix-files', { ignoreError: true });
  
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

// Function to check AWS credentials
function checkAwsCredentials() {
  log('\n=== Checking AWS Credentials ===');
  
  // Check if AWS credentials are configured
  const awsResult = runCommand('aws sts get-caller-identity', { silent: true, ignoreError: true });
  
  if (awsResult.success) {
    success('AWS credentials are configured');
    return true;
  } else {
    warning('AWS credentials are not configured or invalid');
    warning('You will need to configure AWS credentials before deploying');
    return false;
  }
}

// Function to check if Amplify CLI is installed
function checkAmplifyCli() {
  log('\n=== Checking Amplify CLI ===');
  
  // Check if Amplify CLI is installed
  const amplifyResult = runCommand('npx ampx --version', { silent: true, ignoreError: true });
  
  if (amplifyResult.success) {
    success(`Amplify CLI is installed: ${amplifyResult.output.trim()}`);
    return true;
  } else {
    warning('Amplify CLI is not installed or not in PATH');
    warning('You will need to install Amplify CLI before deploying');
    return false;
  }
}

// Main function
async function main() {
  log('\n=== Pre-Deployment Checklist ===');
  
  // Start timer
  const startTime = Date.now();
  
  // Run checks
  const filesExist = checkRequiredFiles();
  const testsPass = runTests();
  const buildWorks = checkBuild();
  const buildOutputExists = checkBuildOutput();
  const awsCredentialsConfigured = checkAwsCredentials();
  const amplifyCliInstalled = checkAmplifyCli();
  
  // Calculate elapsed time
  const endTime = Date.now();
  const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);
  
  // Final report
  log('\n=== Pre-Deployment Checklist Report ===');
  log(`Time: ${elapsedSeconds} seconds`);
  log(`Required Files: ${filesExist ? 'PASS' : 'FAIL'}`);
  log(`Tests: ${testsPass ? 'PASS' : 'FAIL'}`);
  log(`Build Process: ${buildWorks ? 'PASS' : 'FAIL'}`);
  log(`Build Output: ${buildOutputExists ? 'PASS' : 'FAIL'}`);
  log(`AWS Credentials: ${awsCredentialsConfigured ? 'PASS' : 'WARNING'}`);
  log(`Amplify CLI: ${amplifyCliInstalled ? 'PASS' : 'WARNING'}`);
  
  // Overall result
  const requiredChecks = filesExist && testsPass && buildWorks && buildOutputExists;
  const warningChecks = awsCredentialsConfigured && amplifyCliInstalled;
  
  if (requiredChecks) {
    if (warningChecks) {
      success('\n=== All checks passed! You are ready to deploy. ===');
    } else {
      warning('\n=== Required checks passed, but some warnings were found. ===');
      warning('You may need to address these warnings before deploying.');
    }
    return true;
  } else {
    error('\n=== Some required checks failed. ===');
    error('You need to address these issues before deploying.');
    return false;
  }
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
    error(`Checklist failed: ${err.message}`);
    process.exit(1);
  });
}

// Export functions for use in other scripts
module.exports = {
  checkRequiredFiles,
  runTests,
  checkBuild,
  checkBuildOutput,
  checkAwsCredentials,
  checkAmplifyCli
};
