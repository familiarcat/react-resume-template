#!/usr/bin/env node

/**
 * Force Deploy Amplify Gen 2 Backend
 * 
 * This script forces a deployment of the Amplify Gen 2 backend and verifies table creation.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

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

// Function to force deploy the backend
async function forceDeployBackend() {
  log('\n=== Force Deploying Amplify Gen 2 Backend ===');
  
  // Set AWS profile
  process.env.AWS_PROFILE = 'AmplifyUser';
  
  // Unset AWS credentials if they exist
  delete process.env.AWS_ACCESS_KEY_ID;
  delete process.env.AWS_SECRET_ACCESS_KEY;
  delete process.env.AWS_SESSION_TOKEN;
  
  // Clean up any existing deployment
  info('Cleaning up any existing deployment...');
  runCommand('rm -f amplify_outputs.json', { silent: true, ignoreError: true });
  
  // Deploy the backend with force flag
  info('Deploying backend with force flag...');
  const result = runCommand('npx ampx deploy --force --profile AmplifyUser');
  
  if (result.success) {
    success('Backend deployed successfully');
    
    // Wait for deployment to complete
    info('Waiting for deployment to complete...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    return true;
  } else {
    error('Failed to deploy backend');
    return false;
  }
}

// Function to verify table creation
async function verifyTableCreation() {
  log('\n=== Verifying DynamoDB Table Creation ===');
  
  // Check if amplify_outputs.json exists
  const amplifyOutputsPath = path.join(process.cwd(), 'amplify_outputs.json');
  
  if (!fs.existsSync(amplifyOutputsPath)) {
    error('amplify_outputs.json file not found. Deployment may have failed.');
    return false;
  }
  
  try {
    const amplifyOutputs = JSON.parse(fs.readFileSync(amplifyOutputsPath, 'utf8'));
    
    if (!amplifyOutputs.data?.aws_region) {
      error('AWS region not found in amplify_outputs.json');
      return false;
    }
    
    // Configure AWS SDK
    const region = amplifyOutputs.data.aws_region;
    AWS.config.update({ region });
    
    // Create DynamoDB client
    const dynamoDB = new AWS.DynamoDB();
    
    // List tables
    info('Listing DynamoDB tables...');
    const { TableNames } = await dynamoDB.listTables().promise();
    
    if (!TableNames || TableNames.length === 0) {
      error('No DynamoDB tables found');
      return false;
    }
    
    // Filter tables for this project
    const projectTables = TableNames.filter(tableName => 
      tableName.includes('Todo') || 
      tableName.includes('Resume') || 
      tableName.includes('Summary') ||
      tableName.includes('ContactInformation') ||
      tableName.includes('Reference') ||
      tableName.includes('Education') ||
      tableName.includes('School') ||
      tableName.includes('Degree') ||
      tableName.includes('Experience') ||
      tableName.includes('Position') ||
      tableName.includes('Skill')
    );
    
    if (projectTables.length === 0) {
      error('No project-related DynamoDB tables found');
      return false;
    }
    
    success(`Found ${projectTables.length} project-related DynamoDB tables:`);
    projectTables.forEach(tableName => {
      info(`- ${tableName}`);
    });
    
    return true;
  } catch (err) {
    error(`Failed to verify table creation: ${err.message}`);
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

// Main function
async function main() {
  log('\n=== Amplify Gen 2 Force Deployment ===');
  
  // Force deploy the backend
  const deploySuccess = await forceDeployBackend();
  if (!deploySuccess) {
    error('Failed to deploy backend. Cannot proceed.');
    return false;
  }
  
  // Verify table creation
  const verifySuccess = await verifyTableCreation();
  if (!verifySuccess) {
    warning('Failed to verify table creation. The deployment may still be in progress.');
    warning('Wait a few minutes and try running the verification again.');
  }
  
  // Generate the client
  const generateSuccess = await generateClient();
  if (!generateSuccess) {
    warning('Failed to generate client. Continuing anyway...');
  }
  
  success('Force deployment process completed');
  info('If tables were not created, try the following:');
  info('1. Check your AWS credentials and permissions');
  info('2. Make sure your data model is correctly defined');
  info('3. Try running the verification again after a few minutes');
  
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
  forceDeployBackend,
  verifyTableCreation,
  generateClient
};
