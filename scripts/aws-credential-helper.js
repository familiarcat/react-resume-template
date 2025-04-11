#!/usr/bin/env node

/**
 * AWS Credential Helper
 * 
 * A comprehensive tool to check, fix, and manage AWS credentials for Amplify projects.
 * This script helps diagnose and resolve common AWS credential issues.
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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

const log = (message) => console.log(message);
const success = (message) => console.log(`${colors.green}✓ ${message}${colors.reset}`);
const warning = (message) => console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
const error = (message) => console.log(`${colors.red}✗ ${message}${colors.reset}`);
const info = (message) => console.log(`${colors.blue}ℹ ${message}${colors.reset}`);
const highlight = (message) => console.log(`${colors.cyan}${message}${colors.reset}`);
const important = (message) => console.log(`${colors.magenta}! ${message}${colors.reset}`);

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

// Execute a command safely
function safeExec(command, options = {}) {
  try {
    return { 
      success: true, 
      output: execSync(command, { encoding: 'utf8', ...options }) 
    };
  } catch (err) {
    return { 
      success: false, 
      error: err,
      message: err.message,
      output: err.stdout || ''
    };
  }
}

// Check if AWS CLI is installed
function checkAwsCli() {
  log('\n=== Checking AWS CLI Installation ===');
  
  const result = safeExec('aws --version', { stdio: 'pipe' });
  
  if (result.success) {
    success(`AWS CLI is installed: ${result.output.trim()}`);
    return true;
  } else {
    error('AWS CLI is not installed');
    log('Please install the AWS CLI: https://aws.amazon.com/cli/');
    return false;
  }
}

// Check environment variables
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

// Check AWS credentials file
function checkCredentialsFile() {
  log('\n=== Checking AWS Credentials File ===');
  
  const credentialsPath = path.join(os.homedir(), '.aws', 'credentials');
  
  if (!fs.existsSync(credentialsPath)) {
    warning(`AWS credentials file not found at ${credentialsPath}`);
    return { exists: false, path: credentialsPath };
  }
  
  info(`AWS credentials file found at: ${credentialsPath}`);
  
  try {
    const credentials = fs.readFileSync(credentialsPath, 'utf8');
    const profiles = credentials.match(/\[([^\]]+)\]/g) || [];
    
    log(`Found ${profiles.length} profiles in credentials file:`);
    profiles.forEach(profile => {
      log(`  ${profile}`);
    });
    
    const hasAmplifyUser = profiles.some(profile => profile === '[AmplifyUser]');
    
    if (hasAmplifyUser) {
      success('AmplifyUser profile found in credentials file');
      
      // Extract AmplifyUser credentials
      const profileRegex = /\[AmplifyUser\]([\s\S]*?)(?=\[\w+\]|$)/;
      const match = credentials.match(profileRegex);
      
      if (match && match[1]) {
        const profileContent = match[1].trim();
        log('AmplifyUser profile content:');
        
        // Mask the actual values
        const maskedContent = profileContent
          .replace(/(aws_access_key_id\s*=\s*)([^\s]+)/, '$1***')
          .replace(/(aws_secret_access_key\s*=\s*)([^\s]+)/, '$1***');
        
        log(maskedContent);
        
        // Check if the profile has the required fields
        const hasAccessKey = /aws_access_key_id\s*=/.test(profileContent);
        const hasSecretKey = /aws_secret_access_key\s*=/.test(profileContent);
        const hasRegion = /region\s*=/.test(profileContent);
        
        if (!hasAccessKey || !hasSecretKey) {
          warning('AmplifyUser profile is missing required credentials');
        }
        
        if (!hasRegion) {
          warning('AmplifyUser profile does not specify a region');
        }
      }
      
      return { exists: true, hasAmplifyUser: true, path: credentialsPath };
    } else {
      warning('AmplifyUser profile not found in credentials file');
      return { exists: true, hasAmplifyUser: false, path: credentialsPath };
    }
  } catch (err) {
    error(`Failed to read credentials file: ${err.message}`);
    return { exists: true, error: err, path: credentialsPath };
  }
}

// Check AWS config file
function checkConfigFile() {
  log('\n=== Checking AWS Config File ===');
  
  const configPath = path.join(os.homedir(), '.aws', 'config');
  
  if (!fs.existsSync(configPath)) {
    warning(`AWS config file not found at ${configPath}`);
    return { exists: false, path: configPath };
  }
  
  info(`AWS config file found at: ${configPath}`);
  
  try {
    const config = fs.readFileSync(configPath, 'utf8');
    const profiles = config.match(/\[profile ([^\]]+)\]/g) || [];
    
    log(`Found ${profiles.length} profiles in config file:`);
    profiles.forEach(profile => {
      log(`  ${profile}`);
    });
    
    const hasAmplifyUser = profiles.some(profile => profile === '[profile AmplifyUser]');
    
    if (hasAmplifyUser) {
      success('AmplifyUser profile found in config file');
      
      // Extract AmplifyUser config
      const profileRegex = /\[profile AmplifyUser\]([\s\S]*?)(?=\[profile \w+\]|$)/;
      const match = config.match(profileRegex);
      
      if (match && match[1]) {
        const profileContent = match[1].trim();
        log('AmplifyUser profile content:');
        log(profileContent);
        
        // Check if the profile has the required fields
        const hasRegion = /region\s*=/.test(profileContent);
        
        if (!hasRegion) {
          warning('AmplifyUser profile in config does not specify a region');
        }
      }
      
      return { exists: true, hasAmplifyUser: true, path: configPath };
    } else {
      warning('AmplifyUser profile not found in config file');
      return { exists: true, hasAmplifyUser: false, path: configPath };
    }
  } catch (err) {
    error(`Failed to read config file: ${err.message}`);
    return { exists: true, error: err, path: configPath };
  }
}

// Test AWS authentication
async function testAuthentication() {
  log('\n=== Testing AWS Authentication ===');
  
  // First try with current environment
  info('Testing with current environment...');
  let result = safeExec('aws sts get-caller-identity --output json');
  
  if (result.success) {
    try {
      const identity = JSON.parse(result.output);
      success(`Successfully authenticated as: ${identity.Arn}`);
      return { success: true, identity };
    } catch (err) {
      warning('Authentication succeeded but could not parse response');
      log(result.output);
      return { success: true, raw: result.output };
    }
  }
  
  // If that fails, try with clean environment
  info('Testing with clean environment script...');
  
  if (fs.existsSync(path.join(process.cwd(), 'scripts', 'clean-aws-env.sh'))) {
    result = safeExec('bash scripts/clean-aws-env.sh aws sts get-caller-identity --output json');
    
    if (result.success) {
      try {
        const identity = JSON.parse(result.output);
        success(`Successfully authenticated with clean environment as: ${identity.Arn}`);
        return { success: true, identity, cleanEnv: true };
      } catch (err) {
        warning('Authentication with clean environment succeeded but could not parse response');
        log(result.output);
        return { success: true, raw: result.output, cleanEnv: true };
      }
    } else {
      error('Failed to authenticate with clean environment');
      error(result.message);
    }
  }
  
  // If both fail, show detailed error
  error('Failed to authenticate with AWS');
  if (result.message) {
    const errorMatch = result.message.match(/\(([^)]+)\)/);
    if (errorMatch && errorMatch[1]) {
      important(`Error code: ${errorMatch[1]}`);
      
      // Provide guidance based on error code
      if (errorMatch[1] === 'InvalidClientTokenId') {
        log('\nThis error indicates that your AWS access key is invalid or expired.');
        log('Possible solutions:');
        log('1. Generate new access keys in the AWS Console');
        log('2. Verify that the access key in your credentials file is correct');
        log('3. Check if your AWS account is still active');
      } else if (errorMatch[1] === 'ExpiredToken') {
        log('\nThis error indicates that your AWS session token has expired.');
        log('Possible solutions:');
        log('1. If using AWS SSO, run "aws sso login --profile AmplifyUser"');
        log('2. If using temporary credentials, generate new ones');
      } else if (errorMatch[1] === 'AccessDenied') {
        log('\nThis error indicates that your AWS credentials do not have sufficient permissions.');
        log('Possible solutions:');
        log('1. Verify that your IAM user has the necessary permissions');
        log('2. Check if your account has any restrictions or policies preventing access');
      }
    }
  }
  
  return { success: false, error: result.message };
}

// List DynamoDB tables
async function listDynamoDBTables() {
  log('\n=== Listing DynamoDB Tables ===');
  
  // Try with clean environment first
  if (fs.existsSync(path.join(process.cwd(), 'scripts', 'clean-aws-env.sh'))) {
    info('Using clean environment...');
    const result = safeExec('bash scripts/clean-aws-env.sh aws dynamodb list-tables --output json');
    
    if (result.success) {
      try {
        const tables = JSON.parse(result.output);
        success(`Found ${tables.TableNames.length} DynamoDB tables:`);
        tables.TableNames.forEach(table => {
          log(`  - ${table}`);
        });
        return { success: true, tables: tables.TableNames };
      } catch (err) {
        warning('Could not parse DynamoDB tables response');
        log(result.output);
        return { success: true, raw: result.output };
      }
    } else {
      error('Failed to list DynamoDB tables');
      error(result.message);
    }
  } else {
    // Try with current environment
    info('Using current environment...');
    const result = safeExec('aws dynamodb list-tables --output json');
    
    if (result.success) {
      try {
        const tables = JSON.parse(result.output);
        success(`Found ${tables.TableNames.length} DynamoDB tables:`);
        tables.TableNames.forEach(table => {
          log(`  - ${table}`);
        });
        return { success: true, tables: tables.TableNames };
      } catch (err) {
        warning('Could not parse DynamoDB tables response');
        log(result.output);
        return { success: true, raw: result.output };
      }
    } else {
      error('Failed to list DynamoDB tables');
      error(result.message);
    }
  }
  
  return { success: false };
}

// Create or update AWS credentials
async function createOrUpdateCredentials() {
  log('\n=== Creating/Updating AWS Credentials ===');
  
  // Create .aws directory if it doesn't exist
  const awsDir = path.join(os.homedir(), '.aws');
  if (!fs.existsSync(awsDir)) {
    fs.mkdirSync(awsDir, { recursive: true });
    info('Created .aws directory');
  }
  
  // Get credentials file info
  const credentialsInfo = checkCredentialsFile();
  let credentials = '';
  
  if (credentialsInfo.exists) {
    try {
      credentials = fs.readFileSync(credentialsInfo.path, 'utf8');
    } catch (err) {
      warning(`Could not read existing credentials file: ${err.message}`);
      credentials = '';
    }
  }
  
  // Get config file info
  const configInfo = checkConfigFile();
  let config = '';
  
  if (configInfo.exists) {
    try {
      config = fs.readFileSync(configInfo.path, 'utf8');
    } catch (err) {
      warning(`Could not read existing config file: ${err.message}`);
      config = '';
    }
  }
  
  // Get AWS credentials from user
  highlight('\nPlease enter your AWS credentials for the AmplifyUser profile:');
  const accessKey = await question('AWS Access Key ID: ');
  const secretKey = await question('AWS Secret Access Key: ');
  const region = await question('AWS Region (default: us-east-2): ') || 'us-east-2';
  
  // Update credentials file
  const newCredentialsProfile = `[AmplifyUser]\naws_access_key_id = ${accessKey}\naws_secret_access_key = ${secretKey}\nregion = ${region}\n\n`;
  
  if (credentials.includes('[AmplifyUser]')) {
    // Replace existing profile
    const profileRegex = /\[AmplifyUser\]([\s\S]*?)(?=\[\w+\]|$)/;
    credentials = credentials.replace(profileRegex, newCredentialsProfile);
  } else {
    // Add new profile
    credentials += newCredentialsProfile;
  }
  
  fs.writeFileSync(credentialsInfo.path, credentials);
  success(`Updated AWS credentials file at ${credentialsInfo.path}`);
  
  // Update config file
  const newConfigProfile = `[profile AmplifyUser]\nregion = ${region}\noutput = json\n\n`;
  
  if (config.includes('[profile AmplifyUser]')) {
    // Replace existing profile
    const profileRegex = /\[profile AmplifyUser\]([\s\S]*?)(?=\[profile \w+\]|$)/;
    config = config.replace(profileRegex, newConfigProfile);
  } else {
    // Add new profile
    config += newConfigProfile;
  }
  
  fs.writeFileSync(configInfo.path, config);
  success(`Updated AWS config file at ${configInfo.path}`);
  
  return { success: true };
}

// Create a clean environment script
function createCleanEnvScript() {
  log('\n=== Creating Clean Environment Script ===');
  
  const scriptPath = path.join(process.cwd(), 'scripts', 'clean-aws-env.sh');
  const scriptContent = `#!/bin/bash

# Clear all AWS environment variables
unset AWS_ACCESS_KEY_ID
unset AWS_SECRET_ACCESS_KEY
unset AWS_SESSION_TOKEN
unset AWS_DEFAULT_REGION
unset AWS_REGION

# Set only the profile
export AWS_PROFILE=AmplifyUser

# Print current configuration
echo "Current AWS configuration:"
echo "AWS_PROFILE=$AWS_PROFILE"
echo "AWS_REGION is unset (will use profile default)"

# Verify AWS credentials file exists
AWS_CREDENTIALS_FILE="$HOME/.aws/credentials"
if [ ! -f "$AWS_CREDENTIALS_FILE" ]; then
  echo "Error: AWS credentials file not found at $AWS_CREDENTIALS_FILE"
  exit 1
fi

# Verify AmplifyUser profile exists
if ! grep -q "\\[AmplifyUser\\]" "$AWS_CREDENTIALS_FILE"; then
  echo "Error: AmplifyUser profile not found in AWS credentials file"
  echo "Please run 'npm run aws:fix' to set up your credentials"
  exit 1
fi

# Run the command passed as arguments
if [ $# -gt 0 ]; then
  "$@"
else
  echo "No command specified. Environment is clean."
fi
`;
  
  fs.writeFileSync(scriptPath, scriptContent);
  fs.chmodSync(scriptPath, '755');
  success(`Created clean environment script at ${scriptPath}`);
  
  return { success: true, path: scriptPath };
}

// Provide recommendations
function provideRecommendations(results) {
  log('\n=== Recommendations ===');
  
  if (!results.authSuccess) {
    important('Your AWS credentials are not working properly. You should:');
    log('1. Run "npm run aws:fix" to set up your AWS credentials');
    log('2. Verify that your AWS account is active and has the necessary permissions');
    log('3. Always use the clean environment scripts to run AWS commands:');
    log('   npm run aws:clean <command>');
    log('   npm run sandbox:clean');
    log('   npm run amplify:deploy:clean');
  } else {
    success('Your AWS credentials are working properly!');
    log('Best practices for AWS credentials management:');
    log('1. Always use the clean environment scripts to avoid credential conflicts:');
    log('   npm run aws:clean <command>');
    log('   npm run sandbox:clean');
    log('   npm run amplify:deploy:clean');
    log('2. Rotate your AWS access keys regularly (every 90 days)');
    log('3. Use the minimum required permissions for your IAM user');
    log('4. Never commit AWS credentials to version control');
  }
  
  if (!results.tablesSuccess) {
    important('No DynamoDB tables were found. You should:');
    log('1. Run "npm run amplify:deploy:clean" to deploy your backend');
    log('2. Check the CloudFormation console for any stack creation errors');
    log('3. Verify that your data model is correctly defined in amplify/data/resource.ts');
  }
  
  log('\nFor more information, see the AWS Amplify documentation:');
  log('https://docs.amplify.aws/gen2/');
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  // Results object to track findings
  const results = {
    cliInstalled: false,
    envVarsOk: false,
    credentialsOk: false,
    configOk: false,
    authSuccess: false,
    tablesSuccess: false
  };
  
  // Header
  log('\n=================================================================');
  log('                AWS CREDENTIAL HELPER FOR AMPLIFY                 ');
  log('=================================================================\n');
  
  // Check if AWS CLI is installed
  results.cliInstalled = checkAwsCli();
  
  if (!results.cliInstalled) {
    error('AWS CLI is required. Please install it and try again.');
    rl.close();
    return;
  }
  
  // Check environment variables
  results.envVarsOk = checkEnvironmentVariables();
  
  // Check credentials file
  const credentialsInfo = checkCredentialsFile();
  results.credentialsOk = credentialsInfo.exists && credentialsInfo.hasAmplifyUser;
  
  // Check config file
  const configInfo = checkConfigFile();
  results.configOk = configInfo.exists && configInfo.hasAmplifyUser;
  
  // Test authentication
  const authResult = await testAuthentication();
  results.authSuccess = authResult.success;
  
  // List DynamoDB tables
  const tablesResult = await listDynamoDBTables();
  results.tablesSuccess = tablesResult.success && tablesResult.tables && tablesResult.tables.length > 0;
  
  // If command is 'fix', fix credentials
  if (command === 'fix') {
    // Create or update credentials
    await createOrUpdateCredentials();
    
    // Create clean environment script
    createCleanEnvScript();
    
    // Test authentication again
    const newAuthResult = await testAuthentication();
    
    if (newAuthResult.success) {
      success('\nAWS credentials have been fixed successfully!');
    } else {
      error('\nFailed to fix AWS credentials. Please check your AWS account and try again.');
    }
  } else {
    // Provide recommendations
    provideRecommendations(results);
    
    // If there are issues, ask if user wants to fix them
    if (!results.authSuccess || !results.credentialsOk || !results.configOk) {
      const fixCredentials = await question('\nWould you like to fix your AWS credentials now? (y/n): ');
      
      if (fixCredentials.toLowerCase() === 'y') {
        // Create or update credentials
        await createOrUpdateCredentials();
        
        // Create clean environment script
        createCleanEnvScript();
        
        // Test authentication again
        const newAuthResult = await testAuthentication();
        
        if (newAuthResult.success) {
          success('\nAWS credentials have been fixed successfully!');
        } else {
          error('\nFailed to fix AWS credentials. Please check your AWS account and try again.');
        }
      }
    }
  }
  
  rl.close();
}

// Run the main function
main().catch(err => {
  error(`Error: ${err.message}`);
  rl.close();
});
