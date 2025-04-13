/**
 * AWS Credential Provider
 * 
 * This module provides a centralized way to get AWS credentials for the project.
 * It handles credential conflicts, refreshes expired credentials, and provides
 * proper error handling.
 */

const { fromIni, fromEnv, fromProcess, fromTemporaryCredentials } = require('@aws-sdk/credential-providers');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const fs = require('fs');
const path = require('path');
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
const success = (message) => console.log(`${colors.green}✓ ${message}${colors.reset}`);
const warning = (message) => console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
const error = (message) => console.log(`${colors.red}✗ ${message}${colors.reset}`);
const info = (message) => console.log(`${colors.blue}ℹ ${message}${colors.reset}`);

// Check if running in CI/CD environment
const isRunningInCI = () => {
  return !!(process.env.CI || process.env.CODEBUILD_BUILD_ID || process.env.AWS_EXECUTION_ENV);
};

// Check if using local DynamoDB
const isUsingLocalDynamoDB = () => {
  return process.env.USE_LOCAL_DYNAMODB === 'true';
};

// Get local DynamoDB endpoint
const getLocalDynamoDBEndpoint = () => {
  return process.env.DYNAMODB_LOCAL_ENDPOINT || 'http://localhost:8000';
};

/**
 * Get AWS credentials for DynamoDB
 * 
 * This function returns AWS credentials for DynamoDB operations.
 * It handles credential conflicts, refreshes expired credentials,
 * and provides proper error handling.
 * 
 * @param {string} environment - The environment (development, production)
 * @returns {object} - AWS credentials configuration
 */
function getAwsCredentials(environment = 'development') {
  // If using local DynamoDB, return fake credentials
  if (isUsingLocalDynamoDB() && !isRunningInCI()) {
    info(`Using local DynamoDB for ${environment} environment`);
    return {
      credentials: {
        accessKeyId: 'LOCAL_FAKE_KEY',
        secretAccessKey: 'LOCAL_FAKE_SECRET',
      },
      endpoint: getLocalDynamoDBEndpoint(),
      region: process.env.AWS_REGION || 'us-east-2',
    };
  }

  // If running in CI/CD environment, use instance credentials
  if (isRunningInCI()) {
    info(`Using instance credentials for ${environment} environment in CI/CD`);
    return {
      region: process.env.AWS_REGION || 'us-east-2',
    };
  }

  // Check if AWS_PROFILE is set
  if (process.env.AWS_PROFILE) {
    info(`Using AWS profile: ${process.env.AWS_PROFILE} for ${environment} environment`);
    return {
      credentials: fromIni({
        profile: process.env.AWS_PROFILE,
      }),
      region: process.env.AWS_REGION || 'us-east-2',
    };
  }

  // Check if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    info(`Using AWS access keys for ${environment} environment`);
    return {
      credentials: fromEnv(),
      region: process.env.AWS_REGION || 'us-east-2',
    };
  }

  // If no credentials are found, try to use default profile
  warning(`No AWS credentials found for ${environment} environment, using default profile`);
  return {
    credentials: fromIni(),
    region: process.env.AWS_REGION || 'us-east-2',
  };
}

/**
 * Get DynamoDB client
 * 
 * This function returns a DynamoDB client with the proper credentials.
 * 
 * @param {string} environment - The environment (development, production)
 * @returns {DynamoDBClient} - DynamoDB client
 */
function getDynamoDBClient(environment = 'development') {
  const config = getAwsCredentials(environment);
  
  // If using local DynamoDB, add endpoint
  if (isUsingLocalDynamoDB() && !isRunningInCI()) {
    config.endpoint = getLocalDynamoDBEndpoint();
  }
  
  return new DynamoDBClient(config);
}

/**
 * Test AWS credentials
 * 
 * This function tests AWS credentials by creating a DynamoDB client
 * and making a simple request.
 * 
 * @param {string} environment - The environment (development, production)
 * @returns {Promise<boolean>} - True if credentials are valid, false otherwise
 */
async function testAwsCredentials(environment = 'development') {
  try {
    const client = getDynamoDBClient(environment);
    
    // Make a simple request to test credentials
    await client.send({
      Action: 'ListTables',
      Version: '2012-08-10',
    });
    
    success(`AWS credentials for ${environment} environment are valid`);
    return true;
  } catch (err) {
    warning(`AWS credentials for ${environment} environment are invalid: ${err.message}`);
    return false;
  }
}

/**
 * Fix AWS credentials
 * 
 * This function fixes AWS credentials by updating the .env file
 * and environment variables.
 * 
 * @param {string} environment - The environment (development, production)
 * @returns {Promise<boolean>} - True if credentials were fixed, false otherwise
 */
async function fixAwsCredentials(environment = 'development') {
  // If using local DynamoDB, no need to fix credentials
  if (isUsingLocalDynamoDB() && !isRunningInCI()) {
    info(`Using local DynamoDB for ${environment} environment, no need to fix credentials`);
    return true;
  }
  
  // If running in CI/CD environment, no need to fix credentials
  if (isRunningInCI()) {
    info(`Running in CI/CD environment, using instance credentials`);
    return true;
  }
  
  // Check if AWS_PROFILE and AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY are both set
  if (process.env.AWS_PROFILE && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    warning(`Both AWS_PROFILE and AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY are set for ${environment} environment`);
    warning(`This can cause conflicts. Using AWS_PROFILE and unsetting AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY`);
    
    // Update environment variables
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    
    // Update .env file
    updateEnvFile({
      AWS_ACCESS_KEY_ID: '',
      AWS_SECRET_ACCESS_KEY: '',
    });
    
    return true;
  }
  
  // If no credentials are found, try to use default profile
  if (!process.env.AWS_PROFILE && !process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_SECRET_ACCESS_KEY) {
    warning(`No AWS credentials found for ${environment} environment, using default profile`);
    
    // Update environment variables
    process.env.AWS_PROFILE = 'default';
    
    // Update .env file
    updateEnvFile({
      AWS_PROFILE: 'default',
    });
    
    return true;
  }
  
  return true;
}

/**
 * Update .env file
 * 
 * This function updates the .env file with the provided values.
 * 
 * @param {object} updates - Key-value pairs to update in .env file
 * @returns {boolean} - True if .env file was updated, false otherwise
 */
function updateEnvFile(updates) {
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';
  
  // Read existing .env file if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Apply updates
  Object.entries(updates).forEach(([key, value]) => {
    // If key exists, replace it
    if (envContent.includes(`${key}=`)) {
      envContent = envContent.replace(new RegExp(`${key}=.*`, 'm'), `${key}=${value}`);
    } else {
      // Otherwise, add it
      envContent += `\n${key}=${value}`;
    }
  });
  
  // Write updated .env file
  fs.writeFileSync(envPath, envContent);
  
  info('.env file updated with new settings');
  return true;
}

module.exports = {
  getAwsCredentials,
  getDynamoDBClient,
  testAwsCredentials,
  fixAwsCredentials,
  isRunningInCI,
  isUsingLocalDynamoDB,
  getLocalDynamoDBEndpoint,
};
