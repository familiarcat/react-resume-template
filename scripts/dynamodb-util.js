#!/usr/bin/env node

/**
 * DynamoDB Utility Script
 * 
 * This script provides utility functions for working with DynamoDB.
 * It helps with creating tables, seeding data, and syncing between environments.
 */

const { DynamoDBClient, ListTablesCommand, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const fs = require('fs');
const path = require('path');
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

// Function to get DynamoDB client
function getClient(environment = 'development') {
  const config = {
    region: process.env.AWS_REGION || 'us-east-2',
  };

  // Use local endpoint for development
  if (environment === 'development') {
    config.endpoint = process.env.DYNAMODB_LOCAL_ENDPOINT || 'http://localhost:20002';
  }

  // Add credentials if provided
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    config.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };

    // Add session token if provided
    if (process.env.AWS_SESSION_TOKEN) {
      config.credentials.sessionToken = process.env.AWS_SESSION_TOKEN;
    }
  }

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

// Function to check if table exists
async function tableExists(tableName, environment = 'development') {
  const tables = await listTables(environment);
  return tables.includes(tableName);
}

// Function to create table
async function createTable(tableDefinition, environment = 'development') {
  const client = getClient(environment);
  
  try {
    // Check if table already exists
    if (await tableExists(tableDefinition.TableName, environment)) {
      info(`Table ${tableDefinition.TableName} already exists`);
      return true;
    }
    
    // Create table
    const command = new CreateTableCommand(tableDefinition);
    await client.send(command);
    
    // Wait for table to be active
    let tableActive = false;
    let attempts = 0;
    
    while (!tableActive && attempts < 10) {
      attempts++;
      
      try {
        const describeCommand = new DescribeTableCommand({
          TableName: tableDefinition.TableName
        });
        
        const response = await client.send(describeCommand);
        
        if (response.Table.TableStatus === 'ACTIVE') {
          tableActive = true;
        } else {
          info(`Waiting for table ${tableDefinition.TableName} to be active (${response.Table.TableStatus})...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (err) {
        warning(`Error checking table status: ${err.message}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    success(`Table ${tableDefinition.TableName} created successfully`);
    return true;
  } catch (err) {
    error(`Error creating table ${tableDefinition.TableName}: ${err.message}`);
    return false;
  }
}

// Function to put item
async function putItem(tableName, item, environment = 'development') {
  const client = getClient(environment);
  
  try {
    const command = new PutCommand({
      TableName: tableName,
      Item: item
    });
    
    await client.send(command);
    return true;
  } catch (err) {
    error(`Error putting item in ${tableName}: ${err.message}`);
    return false;
  }
}

// Function to get item
async function getItem(tableName, key, environment = 'development') {
  const client = getClient(environment);
  
  try {
    const command = new GetCommand({
      TableName: tableName,
      Key: key
    });
    
    const response = await client.send(command);
    return response.Item;
  } catch (err) {
    error(`Error getting item from ${tableName}: ${err.message}`);
    return null;
  }
}

// Function to scan table
async function scanTable(tableName, environment = 'development') {
  const client = getClient(environment);
  
  try {
    const items = [];
    let lastEvaluatedKey = null;
    
    do {
      const params = {
        TableName: tableName,
        Limit: 100
      };
      
      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }
      
      const command = new ScanCommand(params);
      const response = await client.send(command);
      
      items.push(...(response.Items || []));
      lastEvaluatedKey = response.LastEvaluatedKey;
    } while (lastEvaluatedKey);
    
    return items;
  } catch (err) {
    error(`Error scanning table ${tableName}: ${err.message}`);
    return [];
  }
}

// Function to sync table between environments
async function syncTable(tableName, sourceEnv, targetEnv) {
  info(`Syncing table: ${tableName}`);
  
  try {
    // Get all items from source
    const sourceItems = await scanTable(tableName, sourceEnv);
    info(`Found ${sourceItems.length} items in source table`);
    
    if (sourceItems.length === 0) {
      warning(`No items found in source table ${tableName}`);
      return true;
    }
    
    // Put all items in target
    let successCount = 0;
    
    for (const item of sourceItems) {
      const result = await putItem(tableName, item, targetEnv);
      
      if (result) {
        successCount++;
      }
    }
    
    info(`Successfully synced ${successCount} of ${sourceItems.length} items in ${tableName}`);
    return successCount === sourceItems.length;
  } catch (err) {
    error(`Error syncing table ${tableName}: ${err.message}`);
    return false;
  }
}

// Function to create sample tables
async function createSampleTables(environment = 'development') {
  const tables = [
    {
      TableName: 'Resume',
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    },
    {
      TableName: 'ContactInfo',
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    },
    {
      TableName: 'Summary',
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    },
    {
      TableName: 'Education',
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    },
    {
      TableName: 'School',
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    },
    {
      TableName: 'Degree',
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    },
    {
      TableName: 'Experience',
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    },
    {
      TableName: 'Position',
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    },
    {
      TableName: 'Skill',
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    }
  ];
  
  let success = true;
  
  for (const table of tables) {
    const result = await createTable(table, environment);
    
    if (!result) {
      success = false;
    }
  }
  
  return success;
}

// Function to seed sample data
async function seedSampleData(environment = 'development') {
  // Sample resume data
  const resumeData = {
    id: '1',
    title: 'Software Engineer',
    name: 'John Doe',
    contactInfoId: '1',
    summaryId: '1',
    educationId: '1',
    experienceId: '1',
    skillIds: ['1', '2', '3']
  };
  
  // Sample contact info
  const contactInfo = {
    id: '1',
    email: 'john.doe@example.com',
    phone: '(123) 456-7890',
    website: 'https://johndoe.com',
    location: 'San Francisco, CA'
  };
  
  // Sample summary
  const summary = {
    id: '1',
    text: 'Experienced software engineer with a passion for building scalable web applications.'
  };
  
  // Sample education
  const education = {
    id: '1',
    schoolIds: ['1']
  };
  
  // Sample school
  const school = {
    id: '1',
    name: 'University of California, Berkeley',
    location: 'Berkeley, CA',
    degreeIds: ['1']
  };
  
  // Sample degree
  const degree = {
    id: '1',
    name: 'Bachelor of Science',
    field: 'Computer Science',
    graduationDate: '2018-05-15'
  };
  
  // Sample experience
  const experience = {
    id: '1',
    positionIds: ['1', '2']
  };
  
  // Sample positions
  const positions = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      startDate: '2020-01-01',
      endDate: null,
      current: true,
      description: 'Leading development of cloud-based applications.'
    },
    {
      id: '2',
      title: 'Software Engineer',
      company: 'Startup Inc',
      location: 'San Francisco, CA',
      startDate: '2018-06-01',
      endDate: '2019-12-31',
      current: false,
      description: 'Developed web applications using React and Node.js.'
    }
  ];
  
  // Sample skills
  const skills = [
    {
      id: '1',
      name: 'JavaScript',
      level: 'Expert'
    },
    {
      id: '2',
      name: 'React',
      level: 'Expert'
    },
    {
      id: '3',
      name: 'Node.js',
      level: 'Advanced'
    }
  ];
  
  try {
    // Put resume
    await putItem('Resume', resumeData, environment);
    
    // Put contact info
    await putItem('ContactInfo', contactInfo, environment);
    
    // Put summary
    await putItem('Summary', summary, environment);
    
    // Put education
    await putItem('Education', education, environment);
    
    // Put school
    await putItem('School', school, environment);
    
    // Put degree
    await putItem('Degree', degree, environment);
    
    // Put experience
    await putItem('Experience', experience, environment);
    
    // Put positions
    for (const position of positions) {
      await putItem('Position', position, environment);
    }
    
    // Put skills
    for (const skill of skills) {
      await putItem('Skill', skill, environment);
    }
    
    success('Sample data seeded successfully');
    return true;
  } catch (err) {
    error(`Error seeding sample data: ${err.message}`);
    return false;
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const environment = args[1] || 'development';
  const targetEnv = args[2];
  
  log('\n=== DynamoDB Utility ===');
  
  switch (command) {
    case 'list-tables':
      info(`Listing tables in ${environment} environment...`);
      const tables = await listTables(environment);
      log('\nTables:');
      tables.forEach(table => log(`- ${table}`));
      break;
      
    case 'create-tables':
      info(`Creating tables in ${environment} environment...`);
      await createSampleTables(environment);
      break;
      
    case 'seed-data':
      info(`Seeding data in ${environment} environment...`);
      await createSampleTables(environment);
      await seedSampleData(environment);
      break;
      
    case 'sync':
      if (!targetEnv) {
        error('Target environment is required for sync command');
        process.exit(1);
      }
      
      info(`Syncing data from ${environment} to ${targetEnv}...`);
      
      // Get tables
      const tablesToSync = await listTables(environment);
      
      if (tablesToSync.length === 0) {
        error(`No tables found in ${environment} environment`);
        process.exit(1);
      }
      
      // Sync each table
      for (const table of tablesToSync) {
        await syncTable(table, environment, targetEnv);
      }
      
      success(`Data sync from ${environment} to ${targetEnv} completed`);
      break;
      
    case 'help':
    default:
      log('\nUsage:');
      log('  node dynamodb-util.js <command> [environment] [targetEnv]');
      log('\nCommands:');
      log('  list-tables [environment]           List tables in the specified environment');
      log('  create-tables [environment]         Create sample tables in the specified environment');
      log('  seed-data [environment]             Seed sample data in the specified environment');
      log('  sync [sourceEnv] [targetEnv]        Sync data from source to target environment');
      log('  help                                Show this help message');
      log('\nEnvironments:');
      log('  development (default)               Local development environment');
      log('  production                          Production environment');
      break;
  }
}

// Run the main function if this script is executed directly
if (require.main === module) {
  main().catch(err => {
    error(`Unexpected error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = {
  getClient,
  listTables,
  tableExists,
  createTable,
  putItem,
  getItem,
  scanTable,
  syncTable,
  createSampleTables,
  seedSampleData
};
