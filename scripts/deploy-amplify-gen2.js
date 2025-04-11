#!/usr/bin/env node

/**
 * Amplify Gen 2 Deployment Script
 * 
 * This script deploys the Amplify Gen 2 backend and generates the client.
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

// Function to check if the backend is initialized
function isBackendInitialized() {
  const resourcePath = path.join(process.cwd(), 'amplify', 'data', 'resource.ts');
  return fs.existsSync(resourcePath);
}

// Function to deploy the backend
async function deployBackend() {
  log('\n=== Deploying Amplify Gen 2 Backend ===');
  
  // Check if the backend is initialized
  if (!isBackendInitialized()) {
    error('Backend is not initialized. Make sure you have an amplify/data/resource.ts file.');
    return false;
  }
  
  // Set AWS profile
  process.env.AWS_PROFILE = 'AmplifyUser';
  
  // Unset AWS credentials if they exist
  delete process.env.AWS_ACCESS_KEY_ID;
  delete process.env.AWS_SECRET_ACCESS_KEY;
  delete process.env.AWS_SESSION_TOKEN;
  
  // Deploy the backend
  info('Deploying backend with ampx deploy...');
  const result = runCommand('npx ampx deploy --profile AmplifyUser');
  
  if (result.success) {
    success('Backend deployed successfully');
    return true;
  } else {
    error('Failed to deploy backend');
    return false;
  }
}

// Function to generate the client
async function generateClient() {
  log('\n=== Generating Amplify Client ===');
  
  // Generate the client
  info('Generating client with ampx generate...');
  const result = runCommand('npx ampx generate');
  
  if (result.success) {
    success('Client generated successfully');
    return true;
  } else {
    error('Failed to generate client');
    return false;
  }
}

// Function to check the deployment
async function checkDeployment() {
  log('\n=== Checking Deployment ===');
  
  // Check if amplify_outputs.json exists
  const amplifyOutputsPath = path.join(process.cwd(), 'amplify_outputs.json');
  
  if (!fs.existsSync(amplifyOutputsPath)) {
    error('amplify_outputs.json file not found. Deployment may have failed.');
    return false;
  }
  
  try {
    const amplifyOutputs = JSON.parse(fs.readFileSync(amplifyOutputsPath, 'utf8'));
    
    if (!amplifyOutputs.data?.url || !amplifyOutputs.data?.api_key) {
      error('API URL or API key not found in amplify_outputs.json');
      return false;
    }
    
    success('Deployment verified successfully');
    info(`API URL: ${amplifyOutputs.data.url}`);
    info(`API Key: ${amplifyOutputs.data.api_key.substring(0, 5)}...${amplifyOutputs.data.api_key.substring(amplifyOutputs.data.api_key.length - 5)}`);
    
    return true;
  } catch (err) {
    error(`Failed to verify deployment: ${err.message}`);
    return false;
  }
}

// Main function
async function main() {
  log('\n=== Amplify Gen 2 Deployment ===');
  
  // Deploy the backend
  const deploySuccess = await deployBackend();
  if (!deploySuccess) {
    error('Failed to deploy backend. Cannot proceed.');
    return false;
  }
  
  // Wait a moment for the deployment to complete
  info('Waiting for deployment to complete...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Generate the client
  const generateSuccess = await generateClient();
  if (!generateSuccess) {
    warning('Failed to generate client. Continuing anyway...');
  }
  
  // Check the deployment
  const checkSuccess = await checkDeployment();
  if (!checkSuccess) {
    warning('Failed to verify deployment. The deployment may still be in progress.');
  }
  
  success('Deployment process completed');
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
    error(`Script failed: ${err.message}`);
    process.exit(1);
  });
}

// Export functions for use in other scripts
module.exports = {
  deployBackend,
  generateClient,
  checkDeployment
};
