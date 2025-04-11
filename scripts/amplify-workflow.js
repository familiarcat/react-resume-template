#!/usr/bin/env node

/**
 * Amplify Gen 2 Workflow Script
 * 
 * This script implements a complete workflow for Amplify Gen 2 development and production:
 * - Development: Deploy to sandbox, seed with development data
 * - Production: Deploy to cloud, seed with production data
 */

const { deployToDevelopment, deployToProduction } = require('./optimize-amplify-deploy');
const { configureAmplify, seedData } = require('./seed-env-data');
const { generateClient } = require('@aws-amplify/api');
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

// Function to verify DynamoDB tables
async function verifyDynamoDBTables(environment = 'development') {
  log(`\n=== Verifying DynamoDB Tables for ${environment} ===`);
  
  // Check if AWS CLI is installed
  const awsCliCheck = runCommand('aws --version', { silent: true, ignoreError: true });
  if (!awsCliCheck.success) {
    warning('AWS CLI not found. Cannot verify DynamoDB tables.');
    return false;
  }
  
  // Set AWS profile
  process.env.AWS_PROFILE = 'AmplifyUser';
  
  // List DynamoDB tables
  info('Listing DynamoDB tables...');
  const listTablesResult = runCommand('aws dynamodb list-tables --profile AmplifyUser', { silent: true });
  
  if (!listTablesResult.success) {
    error('Failed to list DynamoDB tables');
    return false;
  }
  
  try {
    const tableData = JSON.parse(listTablesResult.output);
    const tables = tableData.TableNames || [];
    
    // Filter tables for this project
    const projectTables = tables.filter(tableName => 
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
      warning('No project-related DynamoDB tables found');
      return false;
    }
    
    success(`Found ${projectTables.length} project-related DynamoDB tables:`);
    projectTables.forEach(tableName => {
      info(`- ${tableName}`);
    });
    
    return true;
  } catch (err) {
    error(`Failed to parse DynamoDB tables: ${err.message}`);
    return false;
  }
}

// Function to run development workflow
async function developmentWorkflow() {
  log('\n=== Running Development Workflow ===');
  
  // Step 1: Deploy to development environment
  info('Step 1: Deploying to development environment...');
  const deploySuccess = await deployToDevelopment();
  if (!deploySuccess) {
    error('Failed to deploy to development environment. Cannot proceed.');
    return false;
  }
  
  // Step 2: Verify DynamoDB tables
  info('Step 2: Verifying DynamoDB tables...');
  const tablesVerified = await verifyDynamoDBTables('development');
  if (!tablesVerified) {
    warning('Failed to verify DynamoDB tables. Continuing anyway...');
  }
  
  // Step 3: Configure Amplify
  info('Step 3: Configuring Amplify...');
  const amplifyConfigured = await configureAmplify('development');
  if (!amplifyConfigured) {
    error('Failed to configure Amplify. Cannot proceed.');
    return false;
  }
  
  // Step 4: Generate client
  info('Step 4: Generating client...');
  const client = generateClient();
  
  // Step 5: Seed development data
  info('Step 5: Seeding development data...');
  const seedingCompleted = await seedData(client, 'development');
  if (!seedingCompleted) {
    error('Failed to seed development data.');
    return false;
  }
  
  success('Development workflow completed successfully');
  return true;
}

// Function to run production workflow
async function productionWorkflow() {
  log('\n=== Running Production Workflow ===');
  
  // Step 1: Deploy to production environment
  info('Step 1: Deploying to production environment...');
  const deploySuccess = await deployToProduction();
  if (!deploySuccess) {
    error('Failed to deploy to production environment. Cannot proceed.');
    return false;
  }
  
  // Step 2: Verify DynamoDB tables
  info('Step 2: Verifying DynamoDB tables...');
  const tablesVerified = await verifyDynamoDBTables('production');
  if (!tablesVerified) {
    warning('Failed to verify DynamoDB tables. Continuing anyway...');
  }
  
  // Step 3: Configure Amplify
  info('Step 3: Configuring Amplify...');
  const amplifyConfigured = await configureAmplify('production');
  if (!amplifyConfigured) {
    error('Failed to configure Amplify. Cannot proceed.');
    return false;
  }
  
  // Step 4: Generate client
  info('Step 4: Generating client...');
  const client = generateClient();
  
  // Step 5: Seed production data
  info('Step 5: Seeding production data...');
  const seedingCompleted = await seedData(client, 'production');
  if (!seedingCompleted) {
    error('Failed to seed production data.');
    return false;
  }
  
  success('Production workflow completed successfully');
  return true;
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const environment = args[0] || 'development';
  
  if (!['development', 'production'].includes(environment)) {
    error(`Invalid environment: ${environment}. Must be 'development' or 'production'.`);
    return false;
  }
  
  log(`\n=== Amplify Gen 2 Workflow (${environment}) ===`);
  
  if (environment === 'production') {
    return await productionWorkflow();
  } else {
    return await developmentWorkflow();
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
    error(`Script failed: ${err.message}`);
    process.exit(1);
  });
}

// Export functions for use in other scripts
module.exports = {
  developmentWorkflow,
  productionWorkflow,
  verifyDynamoDBTables
};
