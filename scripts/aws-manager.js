#!/usr/bin/env node

/**
 * AWS Credential Manager
 * 
 * A global tool for managing AWS credentials across the entire project.
 * This script provides commands for checking, fixing, and managing AWS credentials.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const awsConfig = require('../.aws-config');

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
    
    const hasAmplifyUser = profiles.some(profile => profile === `[${awsConfig.profile}]`);
    
    if (hasAmplifyUser) {
      success(`${awsConfig.profile} profile found in credentials file`);
      
      // Extract AmplifyUser credentials
      const profileRegex = new RegExp(`\\[${awsConfig.profile}\\]([\\s\\S]*?)(?=\\[\\w+\\]|$)`);
      const match = credentials.match(profileRegex);
      
      if (match && match[1]) {
        const profileContent = match[1].trim();
        log(`${awsConfig.profile} profile content:`);
        
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
          warning(`${awsConfig.profile} profile is missing required credentials`);
        }
        
        if (!hasRegion) {
          warning(`${awsConfig.profile} profile does not specify a region`);
        }
      }
      
      return { exists: true, hasAmplifyUser: true, path: credentialsPath };
    } else {
      warning(`${awsConfig.profile} profile not found in credentials file`);
      return { exists: true, hasAmplifyUser: false, path: credentialsPath };
    }
  } catch (err) {
    error(`Failed to read credentials file: ${err.message}`);
    return { exists: true, error: err, path: credentialsPath };
  }
}

// Test AWS authentication
async function testAuthentication() {
  log('\n=== Testing AWS Authentication ===');
  
  // Try with AWS wrapper
  info('Testing with AWS wrapper...');
  const result = safeExec(`bash scripts/aws-wrapper.sh aws sts get-caller-identity --output json`);
  
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
  } else {
    error('Failed to authenticate with AWS');
    error(result.message);
    
    // Provide guidance based on error message
    if (result.message.includes('InvalidClientTokenId')) {
      log('\nThis error indicates that your AWS access key is invalid or expired.');
      log('Possible solutions:');
      log('1. Generate new access keys in the AWS Console');
      log('2. Verify that the access key in your credentials file is correct');
      log('3. Check if your AWS account is still active');
    } else if (result.message.includes('ExpiredToken')) {
      log('\nThis error indicates that your AWS session token has expired.');
      log('Possible solutions:');
      log('1. If using AWS SSO, run "aws sso login --profile AmplifyUser"');
      log('2. If using temporary credentials, generate new ones');
    } else if (result.message.includes('AccessDenied')) {
      log('\nThis error indicates that your AWS credentials do not have sufficient permissions.');
      log('Possible solutions:');
      log('1. Verify that your IAM user has the necessary permissions');
      log('2. Check if your account has any restrictions or policies preventing access');
    }
    
    return { success: false, error: result.message };
  }
}

// List DynamoDB tables
async function listDynamoDBTables() {
  log('\n=== Listing DynamoDB Tables ===');
  
  // Try with AWS wrapper
  info('Using AWS wrapper...');
  const result = safeExec(`bash scripts/aws-wrapper.sh aws dynamodb list-tables --output json`);
  
  if (result.success) {
    try {
      const tables = JSON.parse(result.output);
      success(`Found ${tables.TableNames.length} DynamoDB tables:`);
      
      // Filter tables for this project
      const projectTables = tables.TableNames.filter(tableName => 
        awsConfig.dynamoDBTablePrefixes.some(prefix => tableName.includes(prefix))
      );
      
      if (projectTables.length > 0) {
        highlight(`Found ${projectTables.length} project-related tables:`);
        projectTables.forEach(table => {
          log(`  - ${table}`);
        });
      } else {
        warning('No project-related DynamoDB tables found');
      }
      
      return { success: true, tables: tables.TableNames, projectTables };
    } catch (err) {
      warning('Could not parse DynamoDB tables response');
      log(result.output);
      return { success: true, raw: result.output };
    }
  } else {
    error('Failed to list DynamoDB tables');
    error(result.message);
    return { success: false };
  }
}

// Update all scripts to use AWS wrapper
function updateScripts() {
  log('\n=== Updating Scripts to Use AWS Wrapper ===');
  
  // Get all JS files in scripts directory
  const scriptsDir = path.join(process.cwd(), 'scripts');
  const jsFiles = fs.readdirSync(scriptsDir).filter(file => file.endsWith('.js'));
  
  let updatedCount = 0;
  
  for (const file of jsFiles) {
    const filePath = path.join(scriptsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace direct AWS CLI calls with wrapper
    let updated = false;
    
    // Replace 'aws ' with 'bash scripts/aws-wrapper.sh aws '
    if (content.includes('aws ')) {
      content = content.replace(/execSync\(['"]aws /g, 'execSync(\'bash scripts/aws-wrapper.sh aws ');
      updated = true;
    }
    
    // Replace 'npx ampx' with 'bash scripts/aws-wrapper.sh npx ampx'
    if (content.includes('npx ampx')) {
      content = content.replace(/execSync\(['"]npx ampx/g, 'execSync(\'bash scripts/aws-wrapper.sh npx ampx');
      updated = true;
    }
    
    if (updated) {
      fs.writeFileSync(filePath, content);
      updatedCount++;
      success(`Updated ${file} to use AWS wrapper`);
    }
  }
  
  if (updatedCount > 0) {
    success(`Updated ${updatedCount} scripts to use AWS wrapper`);
  } else {
    info('No scripts needed updating');
  }
  
  return { success: true, updatedCount };
}

// Create a global .env file with AWS configuration
function createEnvFile() {
  log('\n=== Creating Global .env File ===');
  
  const envPath = path.join(process.cwd(), '.env');
  const envContent = `# AWS Configuration
# This file is automatically generated by aws-manager.js
# Do not edit manually

# Use AWS profile instead of access keys
AWS_PROFILE=${awsConfig.profile}

# Unset these variables to avoid conflicts
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_SESSION_TOKEN=

# Region is set in the AWS profile
# AWS_REGION=
# AWS_DEFAULT_REGION=
`;
  
  fs.writeFileSync(envPath, envContent);
  success(`Created global .env file at ${envPath}`);
  
  // Create .env.local as well
  const envLocalPath = path.join(process.cwd(), '.env.local');
  fs.writeFileSync(envLocalPath, envContent);
  success(`Created global .env.local file at ${envLocalPath}`);
  
  return { success: true };
}

// Create a .gitignore entry for .env files
function updateGitignore() {
  log('\n=== Updating .gitignore ===');
  
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  let gitignoreContent = '';
  
  if (fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  }
  
  // Check if .env files are already ignored
  if (!gitignoreContent.includes('.env')) {
    gitignoreContent += '\n\n# Environment variables\n.env\n.env.local\n.env.development.local\n.env.test.local\n.env.production.local\n';
    fs.writeFileSync(gitignorePath, gitignoreContent);
    success('Updated .gitignore to ignore .env files');
  } else {
    info('.env files are already ignored in .gitignore');
  }
  
  return { success: true };
}

// Create a README for AWS credential management
function createAwsReadme() {
  log('\n=== Creating AWS Credential Management README ===');
  
  const readmePath = path.join(process.cwd(), 'AWS-CREDENTIALS.md');
  const readmeContent = `# AWS Credential Management

This project uses AWS credentials for deploying and managing resources in AWS. This document provides guidance on how to properly manage AWS credentials for this project.

## Best Practices

### 1. Use a Single Authentication Method

Always use a single authentication method:

\`\`\`bash
# RECOMMENDED: Use AWS profiles
export AWS_PROFILE=${awsConfig.profile}
unset AWS_ACCESS_KEY_ID
unset AWS_SECRET_ACCESS_KEY

# NOT RECOMMENDED: Use direct credentials
unset AWS_PROFILE
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
\`\`\`

### 2. Use the AWS Wrapper

All AWS commands should be run through the AWS wrapper:

\`\`\`bash
# Run any AWS command
bash scripts/aws-wrapper.sh aws s3 ls

# Run Amplify commands
bash scripts/aws-wrapper.sh npx ampx deploy
\`\`\`

### 3. Use the npm Scripts

The project includes npm scripts for common AWS operations:

\`\`\`bash
# Check AWS credentials
npm run aws:check

# Run commands with clean environment
npm run aws:clean aws s3 ls

# Fix AWS credentials
npm run aws:helper:fix

# Deploy with clean environment
npm run amplify:deploy:clean

# Start sandbox with clean environment
npm run sandbox:clean
\`\`\`

### 4. Set Up Proper IAM Roles and Policies

Create a dedicated IAM user with the minimum required permissions:

1. Log in to the AWS Console
2. Go to IAM → Users → Create user
3. Name it "${awsConfig.profile}"
4. Attach the "AdministratorAccess-Amplify" policy
5. Create access keys and use them with the \`npm run aws:helper:fix\` script

### 5. Rotate Credentials Regularly

Set up a process to rotate your AWS credentials every 90 days:

1. Log in to the AWS Console
2. Go to IAM → Users → ${awsConfig.profile} → Security credentials
3. Delete old access keys
4. Create new access keys
5. Update your credentials using \`npm run aws:helper:fix\`

## Troubleshooting

### Common Issues

#### InvalidClientTokenId Error

If you see this error:

\`\`\`
An error occurred (InvalidClientTokenId) when calling the GetCallerIdentity operation: The security token included in the request is invalid.
\`\`\`

This indicates that your AWS access key is invalid or expired. Solutions:

1. Generate new access keys in the AWS Console
2. Run \`npm run aws:helper:fix\` to update your credentials
3. Verify that your AWS account is active

#### ExpiredToken Error

If you see this error:

\`\`\`
An error occurred (ExpiredToken) when calling the GetCallerIdentity operation: The security token included in the request is expired
\`\`\`

This indicates that your AWS session token has expired. Solutions:

1. If using AWS SSO, run \`aws sso login --profile ${awsConfig.profile}\`
2. If using temporary credentials, generate new ones

#### AccessDenied Error

If you see this error:

\`\`\`
An error occurred (AccessDenied) when calling the GetCallerIdentity operation: Access denied
\`\`\`

This indicates that your AWS credentials do not have sufficient permissions. Solutions:

1. Verify that your IAM user has the necessary permissions
2. Check if your account has any restrictions or policies preventing access

## Additional Resources

- [AWS CLI Configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
`;
  
  fs.writeFileSync(readmePath, readmeContent);
  success(`Created AWS credential management README at ${readmePath}`);
  
  return { success: true };
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  // Header
  log('\n=================================================================');
  log('                  AWS MANAGER FOR AMPLIFY PROJECT                  ');
  log('=================================================================\n');
  
  // Check if AWS CLI is installed
  const cliInstalled = checkAwsCli();
  
  if (!cliInstalled) {
    error('AWS CLI is required. Please install it and try again.');
    return;
  }
  
  // Process commands
  if (command === 'check') {
    // Check environment variables
    checkEnvironmentVariables();
    
    // Check credentials file
    checkCredentialsFile();
    
    // Test authentication
    await testAuthentication();
    
    // List DynamoDB tables
    await listDynamoDBTables();
  } else if (command === 'update-scripts') {
    // Update scripts to use AWS wrapper
    updateScripts();
  } else if (command === 'create-env') {
    // Create global .env file
    createEnvFile();
    
    // Update .gitignore
    updateGitignore();
  } else if (command === 'create-readme') {
    // Create AWS credential management README
    createAwsReadme();
  } else if (command === 'apply-all') {
    // Apply all changes
    checkEnvironmentVariables();
    checkCredentialsFile();
    await testAuthentication();
    await listDynamoDBTables();
    updateScripts();
    createEnvFile();
    updateGitignore();
    createAwsReadme();
    
    success('\nApplied AWS credential management best practices to the entire project');
    highlight('\nNext steps:');
    log('1. Run "npm run aws:helper:fix" to set up your AWS credentials');
    log('2. Run "npm run aws:check" to verify your AWS credentials');
    log('3. Run "npm run amplify:deploy:clean" to deploy your backend');
  } else {
    // Show usage
    log('Usage:');
    log('  npm run aws:manager check         - Check AWS credentials');
    log('  npm run aws:manager update-scripts - Update scripts to use AWS wrapper');
    log('  npm run aws:manager create-env     - Create global .env file');
    log('  npm run aws:manager create-readme  - Create AWS credential management README');
    log('  npm run aws:manager apply-all      - Apply all changes');
  }
}

// Run the main function
main().catch(err => {
  error(`Error: ${err.message}`);
});
