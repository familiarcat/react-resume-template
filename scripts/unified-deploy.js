#!/usr/bin/env node

/**
 * Unified Deployment Script for AWS Amplify Gen 2
 * 
 * This script performs a complete deployment process:
 * 1. Validates AWS credentials
 * 2. Updates and deploys backend changes
 * 3. Builds the application
 * 4. Seeds data to the updated structure
 * 5. Syncs data between environments
 * 6. Creates a git commit
 * 7. Pushes to GitHub
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

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
const info = (message) => console.log(`${colors.blue}[INFO]${colors.reset} ${message}`);
const success = (message) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);
const warning = (message) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);
const error = (message) => console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user for confirmation
function confirm(question) {
  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${question} (y/n)${colors.reset} `, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Function to execute a command and return its output
function execCommand(command, options = {}) {
  try {
    info(`Executing: ${command}`);
    const output = execSync(command, { 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
    return output ? output.toString().trim() : '';
  } catch (err) {
    if (options.ignoreError) {
      warning(`Command failed but continuing: ${command}`);
      warning(`Error: ${err.message}`);
      return '';
    }
    error(`Command failed: ${command}`);
    error(`Error: ${err.message}`);
    throw err;
  }
}

// Function to check if git working directory is clean
async function isGitClean() {
  try {
    const status = execCommand('git status --porcelain', { silent: true });
    return status.length === 0;
  } catch (err) {
    error(`Failed to check git status: ${err.message}`);
    return false;
  }
}

// Function to check AWS credentials
async function checkAwsCredentials() {
  info('Checking AWS credentials...');
  try {
    execCommand('npm run aws:check', { ignoreError: true });
    return true;
  } catch (err) {
    warning('AWS credentials check failed, attempting to fix...');
    try {
      execCommand('npm run aws:fix');
      return true;
    } catch (fixErr) {
      error(`Failed to fix AWS credentials: ${fixErr.message}`);
      return false;
    }
  }
}

// Function to validate Amplify schema
async function validateAmplifySchema() {
  info('Validating Amplify schema...');
  try {
    execCommand('npx ampx validate');
    return true;
  } catch (err) {
    error(`Amplify schema validation failed: ${err.message}`);
    return false;
  }
}

// Function to deploy backend changes
async function deployBackend() {
  info('Generating Amplify outputs...');
  execCommand('npm run amplify:generate-outputs');
  
  info('Deploying backend changes...');
  execCommand('npm run amplify:pipeline-deploy');
  
  return true;
}

// Function to build the application
async function buildApplication() {
  info('Building the application...');
  execCommand('npm run build');
  
  info('Fixing Amplify files...');
  execCommand('npm run amplify:fix-files');
  
  return true;
}

// Function to seed data
async function seedData(environment) {
  info(`Seeding data to ${environment} environment...`);
  execCommand(`npm run seed-data:${environment}`);
  
  return true;
}

// Function to sync data between environments
async function syncData(sourceEnv, targetEnv) {
  info(`Syncing data from ${sourceEnv} to ${targetEnv}...`);
  execCommand(`npm run sync-data:${sourceEnv}-to-${targetEnv}`);
  
  return true;
}

// Function to create a git commit
async function createGitCommit(message) {
  info('Creating git commit...');
  
  // Check if there are changes to commit
  const hasChanges = !(await isGitClean());
  if (!hasChanges) {
    warning('No changes to commit');
    return true;
  }
  
  // Add all changes
  execCommand('git add .');
  
  // Create commit
  execCommand(`git commit -m "${message}"`);
  
  return true;
}

// Function to push to GitHub
async function pushToGitHub(branch = 'main') {
  info(`Pushing to GitHub (${branch})...`);
  execCommand(`git push origin ${branch}`);
  
  return true;
}

// Main function
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const targetEnv = args[0] || 'dev';
  const syncEnv = args[1] || (targetEnv === 'dev' ? 'prod' : 'dev');
  const branch = args[2] || 'main';
  
  // Validate environment
  if (targetEnv !== 'dev' && targetEnv !== 'prod') {
    error('Invalid environment. Use "dev" or "prod".');
    process.exit(1);
  }
  
  // Start timer
  const startTime = Date.now();
  
  log('\n=== Unified Deployment for AWS Amplify Gen 2 ===');
  log(`Target Environment: ${targetEnv}`);
  log(`Sync Environment: ${syncEnv}`);
  log(`Git Branch: ${branch}`);
  
  try {
    // Check if git working directory is clean
    const isClean = await isGitClean();
    if (!isClean) {
      const shouldContinue = await confirm('Git working directory is not clean. Continue anyway?');
      if (!shouldContinue) {
        log('Deployment aborted by user.');
        process.exit(0);
      }
    }
    
    // Check AWS credentials
    await checkAwsCredentials();
    
    // Validate Amplify schema
    await validateAmplifySchema();
    
    // Deploy backend changes
    await deployBackend();
    
    // Build the application
    await buildApplication();
    
    // Seed data
    await seedData(targetEnv);
    
    // Ask if user wants to sync data
    const shouldSync = await confirm(`Do you want to sync data from ${targetEnv} to ${syncEnv}?`);
    if (shouldSync) {
      await syncData(targetEnv, syncEnv);
    }
    
    // Create a git commit
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const commitMessage = `Deploy to ${targetEnv} environment (${timestamp})`;
    await createGitCommit(commitMessage);
    
    // Ask if user wants to push to GitHub
    const shouldPush = await confirm(`Do you want to push to GitHub (${branch})?`);
    if (shouldPush) {
      await pushToGitHub(branch);
    }
    
    // Calculate elapsed time
    const endTime = Date.now();
    const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);
    
    success(`\nDeployment completed successfully in ${elapsedSeconds} seconds!`);
    
    // Close readline interface
    rl.close();
    
    return true;
  } catch (err) {
    error(`\nDeployment failed: ${err.message}`);
    
    // Close readline interface
    rl.close();
    
    process.exit(1);
  }
}

// Run the main function
if (require.main === module) {
  main().catch(err => {
    error(`Unexpected error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { main };
