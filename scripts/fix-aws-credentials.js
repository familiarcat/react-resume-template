#!/usr/bin/env node

/**
 * AWS Credentials Fix Script
 *
 * This script helps fix AWS credential issues by:
 * 1. Checking current AWS configuration
 * 2. Identifying credential conflicts
 * 3. Providing guidance on how to fix them
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = (message) => console.log(message);
const success = (message) => console.log(`${colors.green}✓ ${message}${colors.reset}`);
const warning = (message) => console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
const error = (message) => console.log(`${colors.red}✗ ${message}${colors.reset}`);
const info = (message) => console.log(`${colors.blue}ℹ ${message}${colors.reset}`);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

// Check current AWS configuration
function checkAwsConfiguration() {
  log('\n=== Checking Current AWS Configuration ===');

  // Check environment variables
  info('Checking environment variables...');
  const envVars = {
    AWS_PROFILE: process.env.AWS_PROFILE,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? '***' : undefined,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? '***' : undefined,
    AWS_SESSION_TOKEN: process.env.AWS_SESSION_TOKEN ? '***' : undefined,
    AWS_REGION: process.env.AWS_REGION,
    AWS_DEFAULT_REGION: process.env.AWS_DEFAULT_REGION
  };

  log('Current environment variables:');
  Object.entries(envVars).forEach(([key, value]) => {
    if (value) {
      log(`  ${key}: ${value}`);
    } else {
      log(`  ${key}: not set`);
    }
  });

  // Check for conflicts
  const conflicts = [];

  if (process.env.AWS_PROFILE && (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_SECRET_ACCESS_KEY)) {
    conflicts.push('Both AWS_PROFILE and AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY are set');
  }

  if (process.env.AWS_REGION && process.env.AWS_DEFAULT_REGION) {
    conflicts.push('Both AWS_REGION and AWS_DEFAULT_REGION are set');
  }

  if (conflicts.length > 0) {
    warning('Credential conflicts detected:');
    conflicts.forEach(conflict => warning(`- ${conflict}`));
    return false;
  }

  success('No credential conflicts detected in environment variables');
  return true;
}

// Check AWS credentials file
function checkAwsCredentialsFile() {
  log('\n=== Checking AWS Credentials File ===');

  const credentialsPath = path.join(os.homedir(), '.aws', 'credentials');

  if (!fs.existsSync(credentialsPath)) {
    warning('AWS credentials file not found');
    return false;
  }

  info(`AWS credentials file found at: ${credentialsPath}`);

  try {
    const credentials = fs.readFileSync(credentialsPath, 'utf8');
    const profiles = credentials.match(/\[([^\]]+)\]/g) || [];

    log(`Found ${profiles.length} profiles in credentials file:`);
    profiles.forEach(profile => {
      log(`  ${profile}`);
    });

    if (profiles.includes('[AmplifyUser]')) {
      success('AmplifyUser profile found in credentials file');
      return true;
    } else {
      warning('AmplifyUser profile not found in credentials file');
      return false;
    }
  } catch (err) {
    error(`Failed to read credentials file: ${err.message}`);
    return false;
  }
}

// Test AWS authentication
async function testAwsAuthentication() {
  log('\n=== Testing AWS Authentication ===');

  try {
    info('Testing with clean environment...');
    // Add --output json to ensure JSON output
    const identity = execSync('bash scripts/clean-aws-env.sh aws sts get-caller-identity --output json', { encoding: 'utf8' });

    try {
      const identityJson = JSON.parse(identity);
      success(`Successfully authenticated as: ${identityJson.Arn}`);
      return true;
    } catch (jsonErr) {
      // If JSON parsing fails, still show the raw output
      success(`Successfully authenticated. Raw output: ${identity.trim()}`);
      return true;
    }
  } catch (err) {
    error(`Failed to authenticate with AWS: ${err.message}`);
    return false;
  }
}

// Fix AWS credentials
async function fixAwsCredentials() {
  log('\n=== Fixing AWS Credentials ===');

  // Create .aws directory if it doesn't exist
  const awsDir = path.join(os.homedir(), '.aws');
  if (!fs.existsSync(awsDir)) {
    fs.mkdirSync(awsDir, { recursive: true });
    info('Created .aws directory');
  }

  // Create or update credentials file
  const credentialsPath = path.join(awsDir, 'credentials');
  let credentials = '';

  if (fs.existsSync(credentialsPath)) {
    credentials = fs.readFileSync(credentialsPath, 'utf8');
    info('Found existing credentials file');
  }

  // Get AWS credentials
  info('Please enter your AWS credentials for the AmplifyUser profile:');
  const accessKey = await question('AWS Access Key ID: ');
  const secretKey = await question('AWS Secret Access Key: ');
  const region = await question('AWS Region (default: us-east-2): ') || 'us-east-2';

  // Update or add AmplifyUser profile
  const profileRegex = /\[AmplifyUser\]([\s\S]*?)(?=\[\w+\]|$)/;
  const newProfile = `[AmplifyUser]\naws_access_key_id = ${accessKey}\naws_secret_access_key = ${secretKey}\nregion = ${region}\n\n`;

  if (profileRegex.test(credentials)) {
    credentials = credentials.replace(profileRegex, newProfile);
    info('Updated existing AmplifyUser profile');
  } else {
    credentials += `\n${newProfile}`;
    info('Added new AmplifyUser profile');
  }

  fs.writeFileSync(credentialsPath, credentials);
  success('Updated AWS credentials file');

  // Create or update config file
  const configPath = path.join(awsDir, 'config');
  let config = '';

  if (fs.existsSync(configPath)) {
    config = fs.readFileSync(configPath, 'utf8');
    info('Found existing config file');
  }

  // Update or add AmplifyUser profile in config
  const configProfileRegex = /\[profile AmplifyUser\]([\s\S]*?)(?=\[profile \w+\]|$)/;
  const newConfigProfile = `[profile AmplifyUser]\nregion = ${region}\noutput = json\n\n`;

  if (configProfileRegex.test(config)) {
    config = config.replace(configProfileRegex, newConfigProfile);
    info('Updated existing AmplifyUser profile in config');
  } else {
    config += `\n${newConfigProfile}`;
    info('Added new AmplifyUser profile to config');
  }

  fs.writeFileSync(configPath, config);
  success('Updated AWS config file');

  return true;
}

// Main function
async function main() {
  log('\n=== AWS Credentials Fix Tool ===');

  // Check current configuration
  const configOk = checkAwsConfiguration();
  if (!configOk) {
    info('Environment variables have conflicts. Using clean environment is recommended.');
  }

  // Check credentials file
  const credentialsOk = checkAwsCredentialsFile();

  // Test authentication
  const authOk = await testAwsAuthentication();

  // If everything is OK, we're done
  if (credentialsOk && authOk) {
    success('\nAWS credentials are properly configured!');
    log('\nYou can now use the following commands:');
    log('  npm run sandbox:clean     - Start Amplify sandbox with clean environment');
    log('  npm run amplify:deploy:clean - Deploy Amplify with clean environment');
    log('  npm run amplify:seed:clean   - Seed data with clean environment');
    rl.close();
    return;
  }

  // Ask if user wants to fix credentials
  const fixCredentials = await question('\nWould you like to fix your AWS credentials? (y/n): ');

  if (fixCredentials.toLowerCase() === 'y') {
    await fixAwsCredentials();

    // Test authentication again
    const fixedAuthOk = await testAwsAuthentication();

    if (fixedAuthOk) {
      success('\nAWS credentials have been fixed successfully!');
      log('\nYou can now use the following commands:');
      log('  npm run sandbox:clean     - Start Amplify sandbox with clean environment');
      log('  npm run amplify:deploy:clean - Deploy Amplify with clean environment');
      log('  npm run amplify:seed:clean   - Seed data with clean environment');
    } else {
      error('\nFailed to fix AWS credentials. Please check your AWS account and try again.');
    }
  } else {
    log('\nNo changes made to AWS credentials.');
  }

  rl.close();
}

// Run the main function
main().catch(err => {
  error(`Error: ${err.message}`);
  rl.close();
});
