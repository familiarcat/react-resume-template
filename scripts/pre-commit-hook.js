#!/usr/bin/env node

/**
 * Pre-commit hook to check for AWS credential issues
 * 
 * This script checks for common AWS credential issues before committing code.
 * It can be installed as a pre-commit hook using Husky.
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
};

const log = (message) => console.log(message);
const success = (message) => console.log(`${colors.green}✓ ${message}${colors.reset}`);
const warning = (message) => console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
const error = (message) => console.log(`${colors.red}✗ ${message}${colors.reset}`);
const info = (message) => console.log(`${colors.blue}ℹ ${message}${colors.reset}`);

// Check for AWS credentials in files
function checkForCredentials() {
  log('\n=== Checking for AWS Credentials in Files ===');
  
  // Get staged files
  const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
  
  // Patterns to check for
  const patterns = [
    /AWS_ACCESS_KEY_ID\s*=\s*['"][A-Z0-9]{20}['"]/,
    /AWS_SECRET_ACCESS_KEY\s*=\s*['"][A-Za-z0-9\/+]{40}['"]/,
    /aws_access_key_id\s*=\s*[A-Z0-9]{20}/,
    /aws_secret_access_key\s*=\s*[A-Za-z0-9\/+]{40}/,
    /accessKeyId\s*:\s*['"][A-Z0-9]{20}['"]/,
    /secretAccessKey\s*:\s*['"][A-Za-z0-9\/+]{40}['"]/
  ];
  
  let foundCredentials = false;
  
  for (const file of stagedFiles) {
    // Skip binary files and certain directories
    if (
      file.endsWith('.png') || 
      file.endsWith('.jpg') || 
      file.endsWith('.jpeg') || 
      file.endsWith('.gif') || 
      file.endsWith('.pdf') || 
      file.includes('node_modules/') || 
      file.includes('.git/')
    ) {
      continue;
    }
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          error(`Found AWS credentials in ${file}`);
          foundCredentials = true;
          break;
        }
      }
    } catch (err) {
      // Skip files that can't be read
      continue;
    }
  }
  
  if (!foundCredentials) {
    success('No AWS credentials found in staged files');
  }
  
  return !foundCredentials;
}

// Check for environment variables
function checkEnvironmentVariables() {
  log('\n=== Checking AWS Environment Variables ===');
  
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

// Main function
function main() {
  log('\n=== AWS Credential Pre-Commit Check ===');
  
  const credentialsCheck = checkForCredentials();
  const envVarsCheck = checkEnvironmentVariables();
  
  if (!credentialsCheck || !envVarsCheck) {
    error('\nAWS credential issues detected. Please fix them before committing.');
    log('\nTo fix these issues:');
    log('1. Remove any AWS credentials from your code');
    log('2. Run "npm run aws:helper:fix" to set up your AWS credentials properly');
    log('3. Use the AWS wrapper for all AWS commands: "npm run aws:wrapper <command>"');
    process.exit(1);
  }
  
  success('\nNo AWS credential issues detected. Proceeding with commit.');
  process.exit(0);
}

// Run the main function
main();
