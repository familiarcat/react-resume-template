#!/usr/bin/env node

/**
 * Bidirectional Data Sync Script for AWS Amplify Gen 2
 *
 * This script provides bidirectional synchronization between development and production environments.
 * It ensures that data is properly synced between environments and creates missing tables/data as needed.
 */

const { DynamoDBClient, ListTablesCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getAwsCredentials, isRunningInCI, isUsingLocalDynamoDB, getLocalDynamoDBEndpoint } = require('./aws-credential-provider');
require('dotenv').config();

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

// Define the models to sync in order of dependencies
const MODELS = [
  'Resume', 'Summary', 'ContactInfo', 'Education', 'School',
  'Degree', 'Experience', 'Position', 'Skill'
];

// Function to get DynamoDB client
function getClient(environment = 'development') {
  // Get AWS credentials from the centralized provider
  const config = getAwsCredentials(environment);

  // If using local DynamoDB and not in CI/CD, use local endpoint
  if (isUsingLocalDynamoDB() && !isRunningInCI()) {
    config.endpoint = getLocalDynamoDBEndpoint();
    info(`Using local DynamoDB endpoint: ${config.endpoint}`);
  } else {
    // For remote environments, always use AWS credentials
    info(`Using AWS DynamoDB for ${environment} environment`);
  }

  // Create the DynamoDB client
  const client = new DynamoDBClient(config);
  return DynamoDBDocumentClient.from(client);
}

// Function to list tables
async function listTables(environment = 'development') {
  const client = getClient(environment);

  try {
    const command = new ListTablesCommand({});
    const response = await client.send(command);
    return response.TableNames || [];
  } catch (err) {
    error(`Error listing tables: ${err.message}`);
    return [];
  }
}

// Function to describe table
async function describeTable(tableName, environment = 'development') {
  const client = getClient(environment);

  try {
    const command = new DescribeTableCommand({ TableName: tableName });
    const response = await client.send(command);
    return response.Table;
  } catch (err) {
    error(`Error describing table ${tableName}: ${err.message}`);
    return null;
  }
}

// Function to scan table
async function scanTable(tableName, environment = 'development') {
  const client = getClient(environment);

  try {
    const command = new ScanCommand({ TableName: tableName });
    const response = await client.send(command);
    return response.Items || [];
  } catch (err) {
    error(`Error scanning table ${tableName}: ${err.message}`);
    return [];
  }
}

// Function to put item
async function putItem(tableName, item, environment = 'development') {
  const client = getClient(environment);

  try {
    const command = new PutCommand({
      TableName: tableName,
      Item: item,
    });
    await client.send(command);
    return true;
  } catch (err) {
    error(`Error putting item in ${tableName}: ${err.message}`);
    return false;
  }
}

// Function to create sample tables
async function createSampleTables(environment = 'development') {
  info(`Creating sample tables in ${environment} environment...`);

  // Use dynamodb-util.js to create tables
  const dynamodbUtilPath = path.join(process.cwd(), 'scripts', 'dynamodb-util.js');

  if (fs.existsSync(dynamodbUtilPath)) {
    const { createSampleTables } = require('./dynamodb-util');
    await createSampleTables(environment);
    return true;
  } else {
    error('dynamodb-util.js not found');
    return false;
  }
}

// Function to seed sample data
async function seedSampleData(environment = 'development') {
  info(`Seeding sample data in ${environment} environment...`);

  // Use dynamodb-util.js to seed data
  const dynamodbUtilPath = path.join(process.cwd(), 'scripts', 'dynamodb-util.js');

  if (fs.existsSync(dynamodbUtilPath)) {
    const { seedSampleData } = require('./dynamodb-util');
    await seedSampleData(environment);
    return true;
  } else {
    error('dynamodb-util.js not found');
    return false;
  }
}

// Function to sync table
async function syncTable(tableName, sourceEnv, targetEnv) {
  info(`Syncing table ${tableName} from ${sourceEnv} to ${targetEnv}...`);

  // Get items from source
  const sourceItems = await scanTable(tableName, sourceEnv);
  info(`Found ${sourceItems.length} items in source table`);

  // Get items from target
  const targetItems = await scanTable(tableName, targetEnv);
  info(`Found ${targetItems.length} items in target table`);

  // Create a map of target items by ID for quick lookup
  const targetItemsMap = {};
  targetItems.forEach(item => {
    if (item.id) {
      targetItemsMap[item.id] = item;
    }
  });

  // Sync items from source to target
  let syncCount = 0;
  for (const sourceItem of sourceItems) {
    if (!sourceItem.id) {
      warning(`Item in ${tableName} has no ID, skipping`);
      continue;
    }

    // Check if item exists in target
    const targetItem = targetItemsMap[sourceItem.id];

    // If item doesn't exist in target or is different, put it in target
    if (!targetItem || JSON.stringify(sourceItem) !== JSON.stringify(targetItem)) {
      const success = await putItem(tableName, sourceItem, targetEnv);
      if (success) {
        syncCount++;
      }
    }
  }

  info(`Synced ${syncCount} items from ${sourceEnv} to ${targetEnv}`);
  return syncCount;
}

// Function to perform bidirectional sync
async function bidirectionalSync(env1, env2) {
  log(`\n=== Bidirectional Sync between ${env1} and ${env2} ===`);

  // Get tables from both environments
  const env1Tables = await listTables(env1);
  const env2Tables = await listTables(env2);

  info(`Found ${env1Tables.length} tables in ${env1} environment`);
  info(`Found ${env2Tables.length} tables in ${env2} environment`);

  // Create a set of tables for each environment
  const env1TablesSet = new Set(env1Tables);
  const env2TablesSet = new Set(env2Tables);

  // Find tables that exist in env1 but not in env2
  const tablesOnlyInEnv1 = env1Tables.filter(table => !env2TablesSet.has(table));

  // Find tables that exist in env2 but not in env1
  const tablesOnlyInEnv2 = env2Tables.filter(table => !env1TablesSet.has(table));

  // Create missing tables in env2
  if (tablesOnlyInEnv1.length > 0) {
    info(`Creating ${tablesOnlyInEnv1.length} missing tables in ${env2} environment...`);
    await createSampleTables(env2);
  }

  // Create missing tables in env1
  if (tablesOnlyInEnv2.length > 0) {
    info(`Creating ${tablesOnlyInEnv2.length} missing tables in ${env1} environment...`);
    await createSampleTables(env1);
  }

  // If no tables in either environment, create sample tables in both
  if (env1Tables.length === 0 && env2Tables.length === 0) {
    info(`No tables found in either environment. Creating sample tables in both...`);
    await createSampleTables(env1);
    await createSampleTables(env2);

    // Seed data in env1
    info(`Seeding sample data in ${env1} environment...`);
    await seedSampleData(env1);

    // Get updated list of tables
    const updatedEnv1Tables = await listTables(env1);

    // Sync each table from env1 to env2
    for (const tableName of updatedEnv1Tables) {
      await syncTable(tableName, env1, env2);
    }

    success(`Bidirectional sync completed successfully`);
    return true;
  }

  // Get updated list of tables after creating missing tables
  const updatedEnv1Tables = await listTables(env1);
  const updatedEnv2Tables = await listTables(env2);

  // Sync from env1 to env2
  info(`\nSyncing from ${env1} to ${env2}...`);
  for (const tableName of updatedEnv1Tables) {
    await syncTable(tableName, env1, env2);
  }

  // Sync from env2 to env1
  info(`\nSyncing from ${env2} to ${env1}...`);
  for (const tableName of updatedEnv2Tables) {
    await syncTable(tableName, env2, env1);
  }

  success(`Bidirectional sync completed successfully`);
  return true;
}

// Function to normalize environment name
function normalizeEnvName(env) {
  if (!env) return 'development';

  // Convert common environment name variations
  if (env === 'dev' || env === 'development' || env === 'local') {
    return 'development';
  }

  if (env === 'prod' || env === 'production') {
    return 'production';
  }

  return env;
}

// Main function
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const rawEnv1 = args[0] || 'development';
  const rawEnv2 = args[1] || 'production';

  // Normalize environment names
  const env1 = normalizeEnvName(rawEnv1);
  const env2 = normalizeEnvName(rawEnv2);

  // Validate environments
  if (env1 !== 'development' && env1 !== 'production') {
    error(`Invalid environment: ${env1}. Use "development" or "production".`);
    process.exit(1);
  }

  if (env2 !== 'development' && env2 !== 'production') {
    error(`Invalid environment: ${env2}. Use "development" or "production".`);
    process.exit(1);
  }

  if (env1 === env2) {
    error(`Environments must be different. Got ${env1} and ${env2}.`);
    process.exit(1);
  }

  // Start timer
  const startTime = Date.now();

  try {
    // Perform bidirectional sync
    await bidirectionalSync(env1, env2);

    // Calculate elapsed time
    const endTime = Date.now();
    const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);

    success(`\nBidirectional sync completed in ${elapsedSeconds} seconds!`);
    return true;
  } catch (err) {
    error(`\nBidirectional sync failed: ${err.message}`);
    process.exit(1);
  }
}

// Run the main function if this script is executed directly
if (require.main === module) {
  main().catch(err => {
    error(`Unexpected error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { bidirectionalSync, normalizeEnvName };
