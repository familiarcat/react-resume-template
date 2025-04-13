#!/usr/bin/env node

/**
 * Dependency Cleanup Script
 * 
 * This script cleans up unused dependencies and ensures consistent versions
 * across the project.
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

// Function to read package.json
function readPackageJson() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  try {
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    return JSON.parse(packageJsonContent);
  } catch (err) {
    error(`Error reading package.json: ${err.message}`);
    process.exit(1);
  }
}

// Function to write package.json
function writePackageJson(packageJson) {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  try {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    success('package.json updated successfully');
  } catch (err) {
    error(`Error writing package.json: ${err.message}`);
    process.exit(1);
  }
}

// Function to clean up dependencies
function cleanupDependencies() {
  log('\n=== Cleaning Up Dependencies ===');
  
  // Read package.json
  const packageJson = readPackageJson();
  
  // Ensure AWS Amplify dependencies have consistent versions
  info('Ensuring AWS Amplify dependencies have consistent versions...');
  
  // Define the correct versions
  const correctVersions = {
    '@aws-amplify/backend-graphql': '0.3.2',
    '@aws-amplify/graphql-model-transformer': '3.2.2',
    '@aws-sdk/client-dynamodb': '3.788.0',
    '@aws-sdk/lib-dynamodb': '3.788.0',
    '@aws-sdk/types': '3.775.0',
    '@aws-amplify/backend': '1.3.0',
    '@aws-amplify/backend-cli': '1.3.0',
    '@aws-amplify/cli': '12.10.0',
    '@aws-sdk/client-iam': '3.787.0',
    '@aws-sdk/credential-provider-ini': '3.787.0',
    'aws-amplify': '6.0.17',
    'aws-cdk-lib': '2.188.0',
    'constructs': '10.3.0',
    'ampx': '0.2.2',
  };
  
  // Update dependencies
  if (packageJson.dependencies) {
    Object.keys(packageJson.dependencies).forEach(dep => {
      if (correctVersions[dep]) {
        if (packageJson.dependencies[dep] !== correctVersions[dep]) {
          info(`Updating ${dep} from ${packageJson.dependencies[dep]} to ${correctVersions[dep]}`);
          packageJson.dependencies[dep] = correctVersions[dep];
        }
      }
    });
  }
  
  // Update devDependencies
  if (packageJson.devDependencies) {
    Object.keys(packageJson.devDependencies).forEach(dep => {
      if (correctVersions[dep]) {
        if (packageJson.devDependencies[dep] !== correctVersions[dep]) {
          info(`Updating ${dep} from ${packageJson.devDependencies[dep]} to ${correctVersions[dep]}`);
          packageJson.devDependencies[dep] = correctVersions[dep];
        }
      }
    });
  }
  
  // Update resolutions
  if (packageJson.resolutions) {
    Object.keys(correctVersions).forEach(dep => {
      if (dep.startsWith('@aws-')) {
        packageJson.resolutions[dep] = correctVersions[dep];
      }
    });
  }
  
  // Write updated package.json
  writePackageJson(packageJson);
  
  // Run npm install to update node_modules
  info('Running npm install to update node_modules...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    success('Dependencies updated successfully');
  } catch (err) {
    error(`Error running npm install: ${err.message}`);
    process.exit(1);
  }
  
  success('Dependency cleanup completed successfully');
}

// Main function
function main() {
  cleanupDependencies();
}

// Run the main function if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { cleanupDependencies };
