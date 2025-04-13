#!/usr/bin/env node

/**
 * Create Amplify Outputs Script
 * 
 * This script creates a minimal amplify_outputs.json file for AWS Amplify Gen 2.
 * It's used as a fallback when ampx generate outputs fails.
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

// Function to create amplify outputs
function createAmplifyOutputs() {
  log('\n=== Creating Amplify Outputs ===');
  
  const outputsPath = path.join(process.cwd(), 'amplify_outputs.json');
  
  // Try to use ampx first
  try {
    info('Trying to generate outputs with ampx...');
    
    // Install required dependencies
    execSync('npm install --no-save @parcel/watcher @aws-amplify/backend-graphql', { stdio: 'inherit' });
    
    // Generate outputs
    execSync('npx ampx generate outputs', { stdio: 'inherit' });
    
    // Check if file was created
    if (fs.existsSync(outputsPath)) {
      success('Successfully generated amplify_outputs.json with ampx');
      return true;
    } else {
      warning('ampx did not create amplify_outputs.json');
    }
  } catch (err) {
    warning(`Failed to generate outputs with ampx: ${err.message}`);
  }
  
  // Create minimal outputs file as fallback
  info('Creating minimal amplify_outputs.json as fallback...');
  
  const minimalOutputs = {
    version: '1.3',
    appId: process.env.AMPLIFY_APP_ID || 'd28u81cjrxr0oe',
    region: process.env.AWS_REGION || 'us-east-2',
    backend: {
      data: {
        tables: []
      },
      auth: {
        loginWithEmail: true
      }
    }
  };
  
  try {
    fs.writeFileSync(outputsPath, JSON.stringify(minimalOutputs, null, 2));
    success('Created minimal amplify_outputs.json');
    return true;
  } catch (err) {
    error(`Failed to create amplify_outputs.json: ${err.message}`);
    return false;
  }
}

// Main function
function main() {
  return createAmplifyOutputs();
}

// Run the main function if this script is executed directly
if (require.main === module) {
  const result = main();
  process.exit(result ? 0 : 1);
}

module.exports = { createAmplifyOutputs };
