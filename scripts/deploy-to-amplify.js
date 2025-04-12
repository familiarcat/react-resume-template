#!/usr/bin/env node

/**
 * Deploy to Amplify
 * 
 * This script deploys the application to AWS Amplify Gen 2.
 * It runs the pre-deployment checklist, deploys the application,
 * and verifies the deployment.
 */

const { execSync } = require('child_process');
const preDeploymentChecklist = require('./pre-deployment-checklist');
const verifyDeployment = require('./verify-amplify-deployment');

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

// Function to deploy to Amplify
async function deployToAmplify() {
  log('\n=== Deploying to Amplify ===');
  
  // Run the deployment command
  const deployResult = runCommand('npm run amplify:gen2:cicd', { ignoreError: true });
  
  if (deployResult.success) {
    success('Deployment to Amplify successful');
    return true;
  } else {
    error('Deployment to Amplify failed');
    return false;
  }
}

// Function to get the deployment URL
function getDeploymentUrl() {
  log('\n=== Getting Deployment URL ===');
  
  // Try to get the deployment URL from the Amplify CLI
  const urlResult = runCommand('npx ampx outputs', { silent: true, ignoreError: true });
  
  if (urlResult.success) {
    try {
      const outputs = JSON.parse(urlResult.output);
      const url = outputs.api?.GraphQL?.endpoint || 'https://main.d28u81cjrxr0oe.amplifyapp.com';
      success(`Deployment URL: ${url}`);
      return url;
    } catch (err) {
      warning('Failed to parse Amplify outputs');
      warning('Using default deployment URL');
      return 'https://main.d28u81cjrxr0oe.amplifyapp.com';
    }
  } else {
    warning('Failed to get deployment URL from Amplify CLI');
    warning('Using default deployment URL');
    return 'https://main.d28u81cjrxr0oe.amplifyapp.com';
  }
}

// Main function
async function main() {
  log('\n=== Deploying to Amplify Gen 2 ===');
  
  // Start timer
  const startTime = Date.now();
  
  // Run pre-deployment checklist
  log('\n=== Running Pre-Deployment Checklist ===');
  const checklistResult = await preDeploymentChecklist.checkRequiredFiles() &&
                          await preDeploymentChecklist.runTests() &&
                          await preDeploymentChecklist.checkBuild() &&
                          await preDeploymentChecklist.checkBuildOutput();
  
  if (!checklistResult) {
    error('Pre-deployment checklist failed');
    return false;
  }
  
  success('Pre-deployment checklist passed');
  
  // Deploy to Amplify
  const deployResult = await deployToAmplify();
  if (!deployResult) {
    error('Deployment failed');
    return false;
  }
  
  // Get deployment URL
  const deploymentUrl = getDeploymentUrl();
  
  // Wait for deployment to complete
  log('\n=== Waiting for Deployment to Complete ===');
  info('This may take a few minutes...');
  
  // Wait for 2 minutes
  await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000));
  
  // Verify deployment
  log('\n=== Verifying Deployment ===');
  const verifyResult = await verifyDeployment.checkDeployment(deploymentUrl);
  
  if (!verifyResult) {
    error('Deployment verification failed');
    return false;
  }
  
  success('Deployment verification passed');
  
  // Calculate elapsed time
  const endTime = Date.now();
  const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);
  const elapsedMinutes = (elapsedSeconds / 60).toFixed(2);
  
  // Final report
  log('\n=== Deployment Report ===');
  log(`Time: ${elapsedMinutes} minutes (${elapsedSeconds} seconds)`);
  log(`Deployment URL: ${deploymentUrl}`);
  log(`Checklist: ${checklistResult ? 'PASS' : 'FAIL'}`);
  log(`Deployment: ${deployResult ? 'PASS' : 'FAIL'}`);
  log(`Verification: ${verifyResult ? 'PASS' : 'FAIL'}`);
  
  // Overall result
  if (checklistResult && deployResult && verifyResult) {
    success('\n=== Deployment Successful! ===');
    success(`Your application is now live at: ${deploymentUrl}`);
    return true;
  } else {
    error('\n=== Deployment Failed ===');
    error('Please check the logs for more information.');
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
    error(`Deployment failed: ${err.message}`);
    process.exit(1);
  });
}

// Export functions for use in other scripts
module.exports = {
  deployToAmplify,
  getDeploymentUrl
};
