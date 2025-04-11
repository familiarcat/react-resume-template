#!/usr/bin/env node

/**
 * Fix DynamoDB Tables Script
 * 
 * This script fixes issues with DynamoDB tables not being created:
 * 1. Verifies the data model syntax
 * 2. Forces a clean deployment
 * 3. Verifies table creation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

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

// Function to verify data model syntax
function verifyDataModel() {
  log('\n=== Verifying Data Model Syntax ===');
  
  const resourcePath = path.join(process.cwd(), 'amplify', 'data', 'resource.ts');
  
  if (!fs.existsSync(resourcePath)) {
    error('Data model file not found: amplify/data/resource.ts');
    return false;
  }
  
  try {
    const resourceContent = fs.readFileSync(resourcePath, 'utf8');
    
    // Check for common syntax issues
    const issues = [];
    
    // Check for missing authorization mode
    if (!resourceContent.includes('defaultAuthorizationMode')) {
      issues.push('Missing defaultAuthorizationMode in data model');
    }
    
    // Check for IAM authorization mode
    if (resourceContent.includes("defaultAuthorizationMode: 'iam'")) {
      issues.push("Authorization mode is set to 'iam'. Consider changing to 'apiKey'");
    }
    
    // Check for model syntax issues
    const modelCount = (resourceContent.match(/\.model\(/g) || []).length;
    const authorizationCount = (resourceContent.match(/\.authorization\(/g) || []).length;
    
    if (modelCount !== authorizationCount) {
      issues.push(`Mismatch between model (${modelCount}) and authorization (${authorizationCount}) declarations`);
    }
    
    // Report issues
    if (issues.length > 0) {
      warning('Found issues in data model:');
      issues.forEach(issue => warning(`- ${issue}`));
      
      // Fix authorization mode if needed
      if (resourceContent.includes("defaultAuthorizationMode: 'iam'")) {
        info('Fixing authorization mode...');
        
        const fixedContent = resourceContent.replace(
          "defaultAuthorizationMode: 'iam'",
          "defaultAuthorizationMode: 'apiKey',\n    apiKeyAuthorizationMode: {\n      expiresInDays: 30,\n    }"
        );
        
        fs.writeFileSync(resourcePath, fixedContent);
        success('Fixed authorization mode in data model');
      }
      
      return false;
    }
    
    success('Data model syntax looks good');
    return true;
  } catch (err) {
    error(`Failed to verify data model: ${err.message}`);
    return false;
  }
}

// Function to force deploy the backend
async function forceDeployBackend() {
  log('\n=== Force Deploying Amplify Gen 2 Backend ===');
  
  // Set AWS profile
  process.env.AWS_PROFILE = 'AmplifyUser';
  
  // Unset AWS credentials if they exist
  delete process.env.AWS_ACCESS_KEY_ID;
  delete process.env.AWS_SECRET_ACCESS_KEY;
  delete process.env.AWS_SESSION_TOKEN;
  
  // Clean up any existing deployment
  info('Cleaning up any existing deployment...');
  runCommand('rm -f amplify_outputs.json', { silent: true, ignoreError: true });
  
  // Deploy the backend with force flag
  info('Deploying backend with force flag...');
  const result = runCommand('npx ampx deploy --force --profile AmplifyUser');
  
  if (result.success) {
    success('Backend deployed successfully');
    
    // Wait for deployment to complete
    info('Waiting for deployment to complete...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    return true;
  } else {
    error('Failed to deploy backend');
    return false;
  }
}

// Function to verify table creation
async function verifyTableCreation() {
  log('\n=== Verifying DynamoDB Table Creation ===');
  
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

// Function to check CloudFormation stacks
async function checkCloudFormationStacks() {
  log('\n=== Checking CloudFormation Stacks ===');
  
  // Check if AWS CLI is installed
  const awsCliCheck = runCommand('aws --version', { silent: true, ignoreError: true });
  if (!awsCliCheck.success) {
    warning('AWS CLI not found. Cannot check CloudFormation stacks.');
    return false;
  }
  
  // Set AWS profile
  process.env.AWS_PROFILE = 'AmplifyUser';
  
  // List CloudFormation stacks
  info('Listing CloudFormation stacks...');
  const listStacksResult = runCommand('aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE --profile AmplifyUser', { silent: true });
  
  if (!listStacksResult.success) {
    error('Failed to list CloudFormation stacks');
    return false;
  }
  
  try {
    const stackData = JSON.parse(listStacksResult.output);
    const stacks = stackData.StackSummaries || [];
    
    // Filter stacks for this project
    const projectStacks = stacks.filter(stack => 
      stack.StackName.includes('amplify') || 
      stack.StackName.includes('Amplify')
    );
    
    if (projectStacks.length === 0) {
      warning('No Amplify-related CloudFormation stacks found');
      return false;
    }
    
    success(`Found ${projectStacks.length} Amplify-related CloudFormation stacks:`);
    projectStacks.forEach(stack => {
      info(`- ${stack.StackName} (${stack.StackStatus})`);
    });
    
    return true;
  } catch (err) {
    error(`Failed to parse CloudFormation stacks: ${err.message}`);
    return false;
  }
}

// Main function
async function main() {
  log('\n=== Fixing DynamoDB Tables ===');
  
  // Step 1: Verify data model syntax
  info('Step 1: Verifying data model syntax...');
  const modelVerified = verifyDataModel();
  if (!modelVerified) {
    warning('Data model has issues. Continuing with deployment anyway...');
  }
  
  // Step 2: Force deploy the backend
  info('Step 2: Force deploying the backend...');
  const deploySuccess = await forceDeployBackend();
  if (!deploySuccess) {
    error('Failed to deploy backend. Cannot proceed.');
    return false;
  }
  
  // Step 3: Check CloudFormation stacks
  info('Step 3: Checking CloudFormation stacks...');
  const stacksChecked = await checkCloudFormationStacks();
  if (!stacksChecked) {
    warning('Failed to check CloudFormation stacks. Continuing anyway...');
  }
  
  // Step 4: Verify table creation
  info('Step 4: Verifying table creation...');
  const tablesVerified = await verifyTableCreation();
  if (!tablesVerified) {
    warning('Failed to verify table creation. The deployment may still be in progress.');
    warning('Wait a few minutes and try running the verification again.');
  }
  
  success('Fix DynamoDB tables process completed');
  info('If tables were not created, try the following:');
  info('1. Check your AWS credentials and permissions');
  info('2. Make sure your data model is correctly defined');
  info('3. Try running the verification again after a few minutes');
  info('4. Check the CloudFormation console for stack creation errors');
  
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
  verifyDataModel,
  forceDeployBackend,
  verifyTableCreation,
  checkCloudFormationStacks
};
