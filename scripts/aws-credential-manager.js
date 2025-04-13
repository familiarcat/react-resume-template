#!/usr/bin/env node

/**
 * AWS Credential Manager
 * 
 * This script manages AWS credentials to ensure consistent authentication.
 * It resolves conflicts between AWS_PROFILE and AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY.
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
const success = (message) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);
const warning = (message) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);
const error = (message) => console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);
const info = (message) => console.log(`${colors.blue}[INFO]${colors.reset} ${message}`);

// Function to check if AWS credentials are set
function checkAwsCredentials() {
  const hasProfile = !!process.env.AWS_PROFILE;
  const hasKeys = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
  
  log('\n=== AWS Credential Check ===');
  
  if (hasProfile) {
    info(`AWS_PROFILE is set to: ${process.env.AWS_PROFILE}`);
  } else {
    warning('AWS_PROFILE is not set');
  }
  
  if (hasKeys) {
    info('AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set');
  } else {
    warning('AWS_ACCESS_KEY_ID and/or AWS_SECRET_ACCESS_KEY are not set');
  }
  
  if (hasProfile && hasKeys) {
    warning('Both AWS_PROFILE and AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY are set.');
    warning('This can cause conflicts. Automatically using AWS_PROFILE and unsetting AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY.');
    
    // Create or update .env file
    updateEnvFile();
    
    // Update process environment
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    
    success('AWS credentials conflict resolved. Using AWS_PROFILE for authentication.');
    return true;
  }
  
  if (!hasProfile && !hasKeys) {
    error('No AWS credentials found. Please set either AWS_PROFILE or AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY.');
    return false;
  }
  
  success('AWS credentials are properly configured.');
  return true;
}

// Function to update .env file
function updateEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';
  
  // Read existing .env file if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Remove AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
  envContent = envContent
    .replace(/^AWS_ACCESS_KEY_ID=.*$/m, '# AWS_ACCESS_KEY_ID=')
    .replace(/^AWS_SECRET_ACCESS_KEY=.*$/m, '# AWS_SECRET_ACCESS_KEY=');
  
  // Ensure AWS_PROFILE is set
  if (!envContent.includes('AWS_PROFILE=')) {
    envContent += `\nAWS_PROFILE=${process.env.AWS_PROFILE}\n`;
  }
  
  // Write updated .env file
  fs.writeFileSync(envPath, envContent);
  
  info('.env file updated to use AWS_PROFILE');
}

// Function to test AWS credentials
function testAwsCredentials() {
  try {
    log('\n=== Testing AWS Credentials ===');
    
    // Test AWS credentials by getting caller identity
    const identity = execSync('aws sts get-caller-identity --output json', { 
      encoding: 'utf8',
      env: process.env
    });
    
    info('Successfully authenticated with AWS:');
    console.log(identity);
    
    return true;
  } catch (err) {
    error(`AWS authentication failed: ${err.message}`);
    return false;
  }
}

// Main function
async function main() {
  // Check AWS credentials
  const credentialsOk = checkAwsCredentials();
  
  if (!credentialsOk) {
    process.exit(1);
  }
  
  // Test AWS credentials
  const testOk = testAwsCredentials();
  
  if (!testOk) {
    process.exit(1);
  }
  
  success('AWS credentials are properly configured and working.');
}

// Run the main function if this script is executed directly
if (require.main === module) {
  main().catch(err => {
    error(`Unexpected error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { checkAwsCredentials, testAwsCredentials };
