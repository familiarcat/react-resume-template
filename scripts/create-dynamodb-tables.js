#!/usr/bin/env node

/**
 * Create DynamoDB Tables for Amplify Gen 2
 * 
 * This script creates DynamoDB tables based on the data models defined in your Amplify project.
 * It's useful when tables aren't automatically created during deployment.
 */

const { DynamoDBClient, CreateTableCommand, ListTablesCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
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

// Initialize DynamoDB client
function initializeDynamoDBClient() {
  // Get AWS profile from environment or use default
  const awsProfile = process.env.AWS_PROFILE || 'AmplifyUser';
  
  // Get AWS region from environment or use default
  const awsRegion = process.env.AWS_REGION || 'us-east-2';
  
  // Set AWS profile
  process.env.AWS_PROFILE = awsProfile;
  
  // Create DynamoDB client
  const client = new DynamoDBClient({ region: awsRegion });
  
  return client;
}

// Get stack name from amplify_outputs.json
async function getStackName() {
  try {
    const amplifyOutputsPath = path.join(process.cwd(), 'amplify_outputs.json');
    
    if (!fs.existsSync(amplifyOutputsPath)) {
      error('amplify_outputs.json file not found. Run "npm run amplify:gen2:sandbox-once" first.');
      return null;
    }
    
    const amplifyOutputs = JSON.parse(fs.readFileSync(amplifyOutputsPath, 'utf8'));
    
    // Extract stack name from API endpoint or other properties
    const apiEndpoint = amplifyOutputs.awsAppsyncApiEndpoint || '';
    const match = apiEndpoint.match(/https:\/\/([^.]+)\.appsync-api/);
    
    if (match && match[1]) {
      const apiId = match[1];
      info(`Found API ID: ${apiId}`);
      
      // Get stack name from AWS CLI
      const result = runCommand(`aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE --profile ${process.env.AWS_PROFILE} --region ${process.env.AWS_REGION || 'us-east-2'} --query "StackSummaries[?contains(StackName, 'amplify')].StackName" --output text`, { silent: true });
      
      if (result.success) {
        const stacks = result.output.trim().split('\t');
        const stack = stacks.find(s => s.includes('sandbox'));
        
        if (stack) {
          success(`Found stack: ${stack}`);
          return stack;
        }
      }
    }
    
    warning('Could not determine stack name from amplify_outputs.json');
    return null;
  } catch (err) {
    error(`Failed to get stack name: ${err.message}`);
    return null;
  }
}

// Get table names from data model
function getTableNames() {
  try {
    const resourcePath = path.join(process.cwd(), 'amplify', 'data', 'resource.ts');
    
    if (!fs.existsSync(resourcePath)) {
      error('Data model file not found: amplify/data/resource.ts');
      return [];
    }
    
    const content = fs.readFileSync(resourcePath, 'utf8');
    
    // Extract model names using regex
    const modelRegex = /(\w+):\s*a\s*\.model\(/g;
    const models = [];
    let match;
    
    while ((match = modelRegex.exec(content)) !== null) {
      models.push(match[1]);
    }
    
    if (models.length === 0) {
      warning('No models found in data model file');
    } else {
      success(`Found ${models.length} models: ${models.join(', ')}`);
    }
    
    return models;
  } catch (err) {
    error(`Failed to get table names: ${err.message}`);
    return [];
  }
}

// Check if table exists
async function tableExists(client, tableName) {
  try {
    const command = new DescribeTableCommand({ TableName: tableName });
    await client.send(command);
    return true;
  } catch (err) {
    if (err.name === 'ResourceNotFoundException') {
      return false;
    }
    throw err;
  }
}

// Create DynamoDB table
async function createTable(client, tableName, stackName) {
  try {
    // Check if table already exists
    const exists = await tableExists(client, tableName);
    
    if (exists) {
      info(`Table ${tableName} already exists`);
      return true;
    }
    
    // Create table name with stack prefix
    const fullTableName = stackName ? `${stackName}-${tableName}` : tableName;
    
    // Create table
    const command = new CreateTableCommand({
      TableName: fullTableName,
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' }
      ],
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    });
    
    await client.send(command);
    success(`Created table: ${fullTableName}`);
    return true;
  } catch (err) {
    error(`Failed to create table ${tableName}: ${err.message}`);
    return false;
  }
}

// Create all tables
async function createAllTables() {
  log('\n=== Creating DynamoDB Tables ===');
  
  // Initialize DynamoDB client
  const client = initializeDynamoDBClient();
  
  // Get stack name
  const stackName = await getStackName();
  
  if (!stackName) {
    warning('Proceeding without stack name');
  }
  
  // Get table names
  const tableNames = getTableNames();
  
  if (tableNames.length === 0) {
    error('No tables to create');
    return false;
  }
  
  // Create tables
  let success = true;
  
  for (const tableName of tableNames) {
    const result = await createTable(client, tableName, stackName);
    success = success && result;
  }
  
  return success;
}

// Main function
async function main() {
  log('\n=== DynamoDB Tables Creation ===');
  
  // Create tables
  const tablesCreated = await createAllTables();
  
  if (tablesCreated) {
    success('\nDynamoDB tables created successfully');
  } else {
    error('\nFailed to create some DynamoDB tables');
    return false;
  }
  
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
  createAllTables
};
