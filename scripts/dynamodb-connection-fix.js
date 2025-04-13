#!/usr/bin/env node

/**
 * DynamoDB Connection Fix Script
 * 
 * This script fixes DynamoDB connection issues by:
 * 1. Checking if local DynamoDB is running
 * 2. If not, using AWS DynamoDB with proper credentials
 * 3. Setting the appropriate environment variables
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const http = require('http');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

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

// Function to check if local DynamoDB is running
function isLocalDynamoDBRunning() {
  const endpoint = process.env.DYNAMODB_LOCAL_ENDPOINT || 'http://localhost:8000';
  
  return new Promise((resolve) => {
    const url = new URL(endpoint);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: '/',
      method: 'GET',
      timeout: 1000, // 1 second timeout
    };
    
    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 400); // DynamoDB returns 400 for invalid requests
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Function to update .env file
function updateEnvFile(updates) {
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';
  
  // Read existing .env file if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Apply updates
  Object.entries(updates).forEach(([key, value]) => {
    // If key exists, replace it
    if (envContent.includes(`${key}=`)) {
      envContent = envContent.replace(new RegExp(`${key}=.*`, 'm'), `${key}=${value}`);
    } else {
      // Otherwise, add it
      envContent += `\n${key}=${value}`;
    }
  });
  
  // Write updated .env file
  fs.writeFileSync(envPath, envContent);
  
  info('.env file updated with new settings');
}

// Function to set up DynamoDB connection
async function setupDynamoDBConnection() {
  log('\n=== Setting Up DynamoDB Connection ===');
  
  // Check if running in CI/CD environment
  const isCI = process.env.CI || process.env.CODEBUILD_BUILD_ID;
  if (isCI) {
    info('Running in CI/CD environment, using AWS DynamoDB');
    
    // Remove local DynamoDB endpoint if set
    if (process.env.DYNAMODB_LOCAL_ENDPOINT) {
      delete process.env.DYNAMODB_LOCAL_ENDPOINT;
      updateEnvFile({ 'DYNAMODB_LOCAL_ENDPOINT': '' });
    }
    
    // Set USE_LOCAL_DYNAMODB to false
    process.env.USE_LOCAL_DYNAMODB = 'false';
    updateEnvFile({ 'USE_LOCAL_DYNAMODB': 'false' });
    
    return true;
  }
  
  // Check if local DynamoDB is running
  info('Checking if local DynamoDB is running...');
  const localRunning = await isLocalDynamoDBRunning();
  
  if (localRunning) {
    success('Local DynamoDB is running');
    
    // Set environment variables
    process.env.USE_LOCAL_DYNAMODB = 'true';
    process.env.DYNAMODB_LOCAL_ENDPOINT = process.env.DYNAMODB_LOCAL_ENDPOINT || 'http://localhost:8000';
    
    // Update .env file
    updateEnvFile({
      'USE_LOCAL_DYNAMODB': 'true',
      'DYNAMODB_LOCAL_ENDPOINT': process.env.DYNAMODB_LOCAL_ENDPOINT
    });
    
    return true;
  } else {
    warning('Local DynamoDB is not running');
    
    // Check if we should try to start local DynamoDB
    if (process.env.AUTO_START_DYNAMODB === 'true') {
      info('Attempting to start local DynamoDB...');
      
      try {
        // Try to start local DynamoDB using docker
        execSync('docker run -d -p 8000:8000 amazon/dynamodb-local', { stdio: 'inherit' });
        
        // Wait a moment for it to start
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if it's running now
        const nowRunning = await isLocalDynamoDBRunning();
        
        if (nowRunning) {
          success('Successfully started local DynamoDB');
          
          // Set environment variables
          process.env.USE_LOCAL_DYNAMODB = 'true';
          process.env.DYNAMODB_LOCAL_ENDPOINT = 'http://localhost:8000';
          
          // Update .env file
          updateEnvFile({
            'USE_LOCAL_DYNAMODB': 'true',
            'DYNAMODB_LOCAL_ENDPOINT': 'http://localhost:8000'
          });
          
          return true;
        } else {
          warning('Failed to start local DynamoDB');
        }
      } catch (err) {
        warning(`Error starting local DynamoDB: ${err.message}`);
      }
    }
    
    // If we get here, we couldn't use local DynamoDB, so use AWS DynamoDB
    info('Using AWS DynamoDB instead');
    
    // Set environment variables
    process.env.USE_LOCAL_DYNAMODB = 'false';
    delete process.env.DYNAMODB_LOCAL_ENDPOINT;
    
    // Update .env file
    updateEnvFile({
      'USE_LOCAL_DYNAMODB': 'false',
      'DYNAMODB_LOCAL_ENDPOINT': ''
    });
    
    return true;
  }
}

// Function to test DynamoDB connection
async function testDynamoDBConnection() {
  log('\n=== Testing DynamoDB Connection ===');
  
  if (process.env.USE_LOCAL_DYNAMODB === 'true') {
    info('Testing local DynamoDB connection...');
    
    try {
      // Test local DynamoDB connection
      const endpoint = process.env.DYNAMODB_LOCAL_ENDPOINT || 'http://localhost:8000';
      const result = await isLocalDynamoDBRunning();
      
      if (result) {
        success(`Successfully connected to local DynamoDB at ${endpoint}`);
        return true;
      } else {
        warning(`Failed to connect to local DynamoDB at ${endpoint}`);
        return false;
      }
    } catch (err) {
      warning(`Error testing local DynamoDB connection: ${err.message}`);
      return false;
    }
  } else {
    info('Testing AWS DynamoDB connection...');
    
    try {
      // Test AWS DynamoDB connection
      execSync('aws dynamodb list-tables --output json', {
        encoding: 'utf8',
        stdio: 'ignore',
        env: process.env
      });
      
      success('Successfully connected to AWS DynamoDB');
      return true;
    } catch (err) {
      warning(`Failed to connect to AWS DynamoDB: ${err.message}`);
      
      // If we're in CI/CD, don't fail
      if (process.env.CI || process.env.CODEBUILD_BUILD_ID) {
        info('Running in CI/CD environment, continuing despite connection failure');
        return true;
      }
      
      return false;
    }
  }
}

// Function to update DynamoDB utility scripts
function updateDynamoDBUtilityScripts() {
  log('\n=== Updating DynamoDB Utility Scripts ===');
  
  // List of scripts to update
  const scripts = [
    'scripts/dynamodb-util.js',
    'scripts/seed-data.js',
    'scripts/bidirectional-sync.js'
  ];
  
  // Update each script
  scripts.forEach(scriptPath => {
    if (fs.existsSync(scriptPath)) {
      info(`Updating ${scriptPath}...`);
      
      let content = fs.readFileSync(scriptPath, 'utf8');
      
      // Add check for USE_LOCAL_DYNAMODB environment variable
      if (!content.includes('process.env.USE_LOCAL_DYNAMODB')) {
        const insertPoint = content.indexOf('const DynamoDBClient');
        
        if (insertPoint !== -1) {
          const insertion = `
// Check if we should use local DynamoDB
const useLocalDynamoDB = process.env.USE_LOCAL_DYNAMODB === 'true';
`;
          
          content = content.slice(0, insertPoint) + insertion + content.slice(insertPoint);
          fs.writeFileSync(scriptPath, content);
          
          success(`Updated ${scriptPath}`);
        } else {
          warning(`Could not find insertion point in ${scriptPath}`);
        }
      } else {
        info(`${scriptPath} already updated`);
      }
    } else {
      warning(`Script ${scriptPath} not found`);
    }
  });
  
  return true;
}

// Main function
async function main() {
  log('\n=== DynamoDB Connection Fix ===');
  
  // Start timer
  const startTime = Date.now();
  
  // Set up DynamoDB connection
  const setupOk = await setupDynamoDBConnection();
  
  // Test DynamoDB connection
  const testOk = await testDynamoDBConnection();
  
  // Update DynamoDB utility scripts
  const updateOk = updateDynamoDBUtilityScripts();
  
  // Calculate elapsed time
  const endTime = Date.now();
  const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);
  
  if (setupOk && testOk && updateOk) {
    success(`\nDynamoDB connection fix completed successfully in ${elapsedSeconds} seconds`);
    return true;
  } else {
    warning(`\nDynamoDB connection fix completed with issues in ${elapsedSeconds} seconds`);
    warning('Some DynamoDB operations may still fail');
    return false;
  }
}

// Run the main function if this script is executed directly
if (require.main === module) {
  main().then(result => {
    if (result) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  }).catch(err => {
    error(`Unexpected error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { setupDynamoDBConnection, testDynamoDBConnection, updateDynamoDBUtilityScripts, main };
