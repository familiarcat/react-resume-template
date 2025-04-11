#!/usr/bin/env node

/**
 * Amplify Gen 2 Full Deployment Script
 * 
 * This script deploys the Amplify Gen 2 backend, generates the client, and seeds the data.
 */

const { deployBackend, generateClient, checkDeployment } = require('./deploy-amplify-gen2');
const { configureAmplify, seedData } = require('./seed-amplify-gen2');
const { generateClient: generateAmplifyClient } = require('@aws-amplify/api');

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

// Main function
async function main() {
  log('\n=== Amplify Gen 2 Full Deployment ===');
  
  // Deploy the backend
  info('Step 1: Deploying the backend...');
  const deploySuccess = await deployBackend();
  if (!deploySuccess) {
    error('Failed to deploy backend. Cannot proceed.');
    return false;
  }
  
  // Wait a moment for the deployment to complete
  info('Waiting for deployment to complete...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Generate the client
  info('Step 2: Generating the client...');
  const generateSuccess = await generateClient();
  if (!generateSuccess) {
    warning('Failed to generate client. Continuing anyway...');
  }
  
  // Check the deployment
  info('Step 3: Checking the deployment...');
  const checkSuccess = await checkDeployment();
  if (!checkSuccess) {
    warning('Failed to verify deployment. The deployment may still be in progress.');
    warning('Waiting longer before proceeding...');
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  
  // Configure Amplify
  info('Step 4: Configuring Amplify...');
  const amplifyConfigured = await configureAmplify();
  if (!amplifyConfigured) {
    error('Failed to configure Amplify. Cannot seed data.');
    return false;
  }
  
  // Generate Amplify client
  info('Step 5: Generating Amplify client...');
  const client = generateAmplifyClient();
  
  // Seed data
  info('Step 6: Seeding data...');
  const seedingCompleted = await seedData(client);
  if (!seedingCompleted) {
    error('Data seeding failed.');
    return false;
  }
  
  success('Full deployment process completed successfully');
  info('Your Amplify Gen 2 backend has been deployed and seeded with data.');
  info('You can now use the backend in your application.');
  
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
  main
};
