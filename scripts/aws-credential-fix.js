#!/usr/bin/env node

/**
 * AWS Credential Fix Script
 * 
 * This script fixes common AWS credential issues:
 * 1. Detects if both AWS_PROFILE and AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY are set
 * 2. Provides guidance on how to fix credential issues
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
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
const info = (message) => console.log(`${colors.blue}[INFO]${colors.reset} ${message}`);
const success = (message) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);
const warning = (message) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);
const error = (message) => console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);

// Function to check if AWS CLI is installed
const checkAwsCli = () => {
  try {
    execSync('aws --version', { stdio: 'ignore' });
    return true;
  } catch (err) {
    return false;
  }
};

// Function to check AWS credentials
const checkAwsCredentials = () => {
  const hasProfile = !!process.env.AWS_PROFILE;
  const hasKeys = !!process.env.AWS_ACCESS_KEY_ID && !!process.env.AWS_SECRET_ACCESS_KEY;
  
  if (hasProfile && hasKeys) {
    warning('Both AWS_PROFILE and AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY are set');
    warning('This can cause credential conflicts. Choose one method:');
    warning('1. Use AWS_PROFILE only');
    warning('2. Use AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY only');
    return false;
  }
  
  if (!hasProfile && !hasKeys) {
    warning('No AWS credentials found in environment variables');
    warning('You should set either:');
    warning('1. AWS_PROFILE');
    warning('2. AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    return false;
  }
  
  if (hasProfile) {
    info(`Using AWS profile: ${process.env.AWS_PROFILE}`);
  }
  
  if (hasKeys) {
    info('Using AWS access keys from environment variables');
  }
  
  return true;
};

// Function to check AWS config files
const checkAwsConfigFiles = () => {
  const homeDir = os.homedir();
  const credentialsPath = path.join(homeDir, '.aws', 'credentials');
  const configPath = path.join(homeDir, '.aws', 'config');
  
  const hasCredentials = fs.existsSync(credentialsPath);
  const hasConfig = fs.existsSync(configPath);
  
  if (!hasCredentials && !hasConfig) {
    warning('AWS config files not found');
    warning('Run "aws configure" to set up your AWS credentials');
    return false;
  }
  
  if (hasCredentials) {
    info('AWS credentials file found');
  }
  
  if (hasConfig) {
    info('AWS config file found');
  }
  
  return true;
};

// Function to check AWS region
const checkAwsRegion = () => {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
  
  if (!region) {
    warning('AWS region not set in environment variables');
    warning('Set AWS_REGION or AWS_DEFAULT_REGION');
    return false;
  }
  
  info(`Using AWS region: ${region}`);
  return true;
};

// Function to provide guidance on fixing AWS credentials
const provideGuidance = () => {
  log('\n=== AWS Credential Guidance ===');
  
  log('\nOption 1: Use AWS Profile');
  log('1. Run "aws configure" to set up your credentials');
  log('2. Set the AWS_PROFILE environment variable:');
  log('   export AWS_PROFILE=your-profile-name');
  log('3. Unset any AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY variables:');
  log('   unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY');
  
  log('\nOption 2: Use AWS Access Keys');
  log('1. Set the following environment variables:');
  log('   export AWS_ACCESS_KEY_ID=your-access-key');
  log('   export AWS_SECRET_ACCESS_KEY=your-secret-key');
  log('   export AWS_REGION=your-region');
  log('2. Unset any AWS_PROFILE variable:');
  log('   unset AWS_PROFILE');
  
  log('\nFor Amplify Gen 2:');
  log('1. Make sure you have the Amplify CLI installed:');
  log('   npm install -g @aws-amplify/cli');
  log('2. Run "npx ampx init" to initialize your Amplify project');
};

// Main function
async function main() {
  log('\n=== AWS Credential Fix ===');
  
  // Start timer
  const startTime = Date.now();
  
  try {
    // Check if AWS CLI is installed
    const awsCliResult = checkAwsCli();
    if (!awsCliResult) {
      error('AWS CLI not installed');
      error('Install AWS CLI: https://aws.amazon.com/cli/');
      return false;
    }
    
    // Check AWS credentials
    const credentialsResult = checkAwsCredentials();
    
    // Check AWS config files
    const configFilesResult = checkAwsConfigFiles();
    
    // Check AWS region
    const regionResult = checkAwsRegion();
    
    // Calculate elapsed time
    const endTime = Date.now();
    const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);
    
    if (credentialsResult && configFilesResult && regionResult) {
      success(`AWS credentials check completed in ${elapsedSeconds} seconds`);
      return true;
    } else {
      warning(`AWS credentials check completed with issues (${elapsedSeconds} seconds)`);
      provideGuidance();
      return false;
    }
  } catch (err) {
    error(`AWS credentials check failed: ${err.message}`);
    provideGuidance();
    return false;
  }
}

// Run the main function
if (require.main === module) {
  main().then(success => {
    if (success) {
      log('\n=== AWS Credential Fix Successful ===');
      process.exit(0);
    } else {
      log('\n=== AWS Credential Fix Completed with Issues ===');
      process.exit(1);
    }
  }).catch(err => {
    error(`Unexpected error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { main };
