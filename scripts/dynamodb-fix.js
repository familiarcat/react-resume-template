#!/usr/bin/env node

/**
 * DynamoDB Fix Script
 * 
 * This script fixes DynamoDB access issues by:
 * 1. Testing DynamoDB access
 * 2. Setting up local DynamoDB endpoint if needed
 * 3. Ensuring proper AWS credentials for DynamoDB
 * 4. Creating missing tables
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

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

// Function to check if running in CI/CD environment
function isRunningInCI() {
  return !!(process.env.CI || process.env.CODEBUILD_BUILD_ID || process.env.AWS_EXECUTION_ENV);
}

// Function to test DynamoDB access
function testDynamoDBAccess() {
  log('\n=== Testing DynamoDB Access ===');
  
  try {
    // Test DynamoDB access by listing tables
    const tables = execSync('aws dynamodb list-tables --output json', {
      encoding: 'utf8',
      env: process.env
    });
    
    info('Successfully accessed DynamoDB:');
    console.log(tables);
    
    return true;
  } catch (err) {
    warning(`DynamoDB access failed: ${err.message}`);
    
    // If running in CI/CD environment, don't fail
    if (isRunningInCI()) {
      warning('Running in CI/CD environment, continuing despite DynamoDB access failure');
      return true;
    }
    
    warning('Could not access DynamoDB.');
    warning('Please ensure your AWS credentials have DynamoDB permissions.');
    
    return false;
  }
}

// Function to set up local DynamoDB
function setupLocalDynamoDB() {
  log('\n=== Setting Up Local DynamoDB ===');
  
  // Check if running in CI/CD environment
  if (isRunningInCI()) {
    info('Running in CI/CD environment, skipping local DynamoDB setup');
    return true;
  }
  
  info('Checking for local DynamoDB endpoint...');
  
  // Check if DYNAMODB_LOCAL_ENDPOINT is set
  if (!process.env.DYNAMODB_LOCAL_ENDPOINT) {
    info('Setting up local DynamoDB endpoint...');
    process.env.DYNAMODB_LOCAL_ENDPOINT = 'http://localhost:8000';
    
    // Update .env file
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      if (!envContent.includes('DYNAMODB_LOCAL_ENDPOINT=')) {
        envContent += '\nDYNAMODB_LOCAL_ENDPOINT=http://localhost:8000\n';
        fs.writeFileSync(envPath, envContent);
        info('Added DYNAMODB_LOCAL_ENDPOINT to .env file');
      }
    }
  } else {
    info(`Using local DynamoDB endpoint: ${process.env.DYNAMODB_LOCAL_ENDPOINT}`);
  }
  
  return true;
}

// Function to ensure AWS credentials for DynamoDB
function ensureDynamoDBCredentials() {
  log('\n=== Ensuring AWS Credentials for DynamoDB ===');
  
  // Check if running in CI/CD environment
  if (isRunningInCI()) {
    info('Running in CI/CD environment, using instance role for DynamoDB');
    return true;
  }
  
  // Check if AWS_PROFILE is set
  if (process.env.AWS_PROFILE) {
    info(`Using AWS profile: ${process.env.AWS_PROFILE}`);
    
    // Check if profile has DynamoDB permissions
    try {
      execSync(`aws dynamodb list-tables --profile ${process.env.AWS_PROFILE} --output json`, {
        encoding: 'utf8',
        stdio: 'ignore'
      });
      
      info(`AWS profile ${process.env.AWS_PROFILE} has DynamoDB permissions`);
      return true;
    } catch (err) {
      warning(`AWS profile ${process.env.AWS_PROFILE} does not have DynamoDB permissions`);
      warning('Please update your AWS profile with DynamoDB permissions');
      
      // Try to use default profile
      info('Trying to use default AWS profile...');
      process.env.AWS_PROFILE = 'default';
      
      // Update .env file
      const envPath = path.join(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');
        envContent = envContent.replace(/^AWS_PROFILE=.*$/m, `AWS_PROFILE=default`);
        fs.writeFileSync(envPath, envContent);
        info('Updated .env file to use default AWS profile');
      }
      
      return false;
    }
  }
  
  // Check if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    info('Using AWS access keys');
    
    // Check if access keys have DynamoDB permissions
    try {
      execSync('aws dynamodb list-tables --output json', {
        encoding: 'utf8',
        stdio: 'ignore',
        env: process.env
      });
      
      info('AWS access keys have DynamoDB permissions');
      return true;
    } catch (err) {
      warning('AWS access keys do not have DynamoDB permissions');
      warning('Please update your AWS access keys with DynamoDB permissions');
      return false;
    }
  }
  
  warning('No AWS credentials found');
  warning('Please set either AWS_PROFILE or AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY');
  return false;
}

// Function to create missing tables
function createMissingTables() {
  log('\n=== Creating Missing DynamoDB Tables ===');
  
  // Check if running in CI/CD environment
  if (isRunningInCI()) {
    info('Running in CI/CD environment, skipping table creation');
    return true;
  }
  
  // Check if dynamodb-util.js exists
  const dynamodbUtilPath = path.join(process.cwd(), 'scripts', 'dynamodb-util.js');
  if (!fs.existsSync(dynamodbUtilPath)) {
    warning('dynamodb-util.js not found');
    warning('Please create dynamodb-util.js to create missing tables');
    return false;
  }
  
  // Run dynamodb-util.js to create tables
  info('Running dynamodb-util.js to create tables...');
  try {
    execSync('node scripts/dynamodb-util.js create-tables', {
      encoding: 'utf8',
      stdio: 'inherit',
      env: process.env
    });
    
    info('Tables created successfully');
    return true;
  } catch (err) {
    warning(`Failed to create tables: ${err.message}`);
    return false;
  }
}

// Main function
async function main() {
  log('\n=== DynamoDB Fix ===');
  
  // Start timer
  const startTime = Date.now();
  
  // Test DynamoDB access
  const accessOk = testDynamoDBAccess();
  
  // Set up local DynamoDB if needed
  const localOk = setupLocalDynamoDB();
  
  // Ensure AWS credentials for DynamoDB
  const credentialsOk = ensureDynamoDBCredentials();
  
  // Create missing tables if needed
  const tablesOk = createMissingTables();
  
  // Calculate elapsed time
  const endTime = Date.now();
  const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);
  
  if (accessOk && localOk && credentialsOk && tablesOk) {
    success(`\nDynamoDB fix completed successfully in ${elapsedSeconds} seconds`);
    return true;
  } else {
    warning(`\nDynamoDB fix completed with issues in ${elapsedSeconds} seconds`);
    warning('Some DynamoDB operations may still fail');
    return false;
  }
}

// Run the main function if this script is executed directly
if (require.main === module) {
  main().then(result => {
    if (result) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  }).catch(err => {
    error(`Unexpected error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { testDynamoDBAccess, setupLocalDynamoDB, ensureDynamoDBCredentials, createMissingTables, main };
