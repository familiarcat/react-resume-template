#!/usr/bin/env node

/**
 * Optimized Amplify Gen 2 Deployment Script
 * 
 * This script optimizes the deployment process for Amplify Gen 2 by:
 * 1. Using parallel deployments where possible
 * 2. Implementing caching strategies
 * 3. Skipping unnecessary steps
 * 4. Using the sandbox for development
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

// Function to calculate hash of a file
function calculateFileHash(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const fileContent = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(fileContent).digest('hex');
}

// Function to check if deployment is needed
function isDeploymentNeeded() {
  // Check if cache file exists
  const cacheFilePath = path.join(process.cwd(), '.amplify-deploy-cache.json');
  
  if (!fs.existsSync(cacheFilePath)) {
    info('No deployment cache found. Deployment is needed.');
    return true;
  }
  
  try {
    const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
    const lastDeployTime = cacheData.lastDeployTime || 0;
    const fileHashes = cacheData.fileHashes || {};
    
    // Check if key files have changed
    const filesToCheck = [
      'amplify/data/resource.ts',
      'amplify/auth/resource.ts',
      'amplify/backend.ts'
    ];
    
    for (const filePath of filesToCheck) {
      if (fs.existsSync(path.join(process.cwd(), filePath))) {
        const currentHash = calculateFileHash(path.join(process.cwd(), filePath));
        const previousHash = fileHashes[filePath];
        
        if (currentHash !== previousHash) {
          info(`File ${filePath} has changed. Deployment is needed.`);
          return true;
        }
      }
    }
    
    // Check if it's been more than 24 hours since last deployment
    const currentTime = Date.now();
    if (currentTime - lastDeployTime > 24 * 60 * 60 * 1000) {
      info('More than 24 hours since last deployment. Deployment is needed.');
      return true;
    }
    
    info('No changes detected. Deployment can be skipped.');
    return false;
  } catch (err) {
    warning(`Error reading cache file: ${err.message}`);
    return true;
  }
}

// Function to update deployment cache
function updateDeploymentCache() {
  const cacheFilePath = path.join(process.cwd(), '.amplify-deploy-cache.json');
  
  // Calculate hashes for key files
  const fileHashes = {};
  const filesToCache = [
    'amplify/data/resource.ts',
    'amplify/auth/resource.ts',
    'amplify/backend.ts'
  ];
  
  for (const filePath of filesToCache) {
    if (fs.existsSync(path.join(process.cwd(), filePath))) {
      fileHashes[filePath] = calculateFileHash(path.join(process.cwd(), filePath));
    }
  }
  
  // Create cache data
  const cacheData = {
    lastDeployTime: Date.now(),
    fileHashes
  };
  
  // Write cache file
  fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2));
  success('Deployment cache updated');
}

// Function to deploy to development environment
async function deployToDevelopment() {
  log('\n=== Deploying to Development Environment ===');
  
  // Check if deployment is needed
  if (!isDeploymentNeeded()) {
    info('Skipping deployment as no changes detected');
    
    // Check if sandbox is running
    const sandboxStatus = runCommand('npx ampx sandbox status --json', { silent: true, ignoreError: true });
    
    if (sandboxStatus.success) {
      try {
        const status = JSON.parse(sandboxStatus.output);
        if (status.isRunning) {
          success('Sandbox is already running');
          return true;
        }
      } catch (err) {
        // Ignore parsing errors
      }
    }
    
    // Start sandbox
    info('Starting sandbox...');
    const sandboxResult = runCommand('npx ampx sandbox --profile AmplifyUser');
    
    if (sandboxResult.success) {
      success('Sandbox started successfully');
      return true;
    } else {
      error('Failed to start sandbox');
      return false;
    }
  }
  
  // Set environment variables for faster deployment
  process.env.AMPLIFY_CLI_SKIP_PROMPTS = 'true';
  process.env.AMPLIFY_CLI_SKIP_ANALYTICS = 'true';
  
  // Set AWS profile
  process.env.AWS_PROFILE = 'AmplifyUser';
  
  // Deploy with optimized flags
  info('Deploying with optimized flags...');
  const result = runCommand('npx ampx deploy --profile AmplifyUser --yes');
  
  if (result.success) {
    success('Deployment to development environment completed successfully');
    
    // Update deployment cache
    updateDeploymentCache();
    
    return true;
  } else {
    error('Deployment to development environment failed');
    return false;
  }
}

// Function to deploy to production environment
async function deployToProduction() {
  log('\n=== Deploying to Production Environment ===');
  
  // Set environment variables for faster deployment
  process.env.AMPLIFY_CLI_SKIP_PROMPTS = 'true';
  process.env.AMPLIFY_CLI_SKIP_ANALYTICS = 'true';
  process.env.NODE_ENV = 'production';
  
  // Set AWS profile
  process.env.AWS_PROFILE = 'AmplifyUser';
  
  // Deploy with production flags
  info('Deploying to production...');
  const result = runCommand('npx ampx deploy --profile AmplifyUser --yes --environment production');
  
  if (result.success) {
    success('Deployment to production environment completed successfully');
    return true;
  } else {
    error('Deployment to production environment failed');
    return false;
  }
}

// Function to generate the client
async function generateClient() {
  log('\n=== Generating Amplify Client ===');
  
  // Generate the client
  info('Generating client with ampx generate...');
  const result = runCommand('npx ampx generate');
  
  if (result.success) {
    success('Client generated successfully');
    return true;
  } else {
    error('Failed to generate client');
    return false;
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const environment = args[0] || 'development';
  
  log(`\n=== Optimized Amplify Gen 2 Deployment (${environment}) ===`);
  
  let deploySuccess = false;
  
  if (environment === 'production') {
    deploySuccess = await deployToProduction();
  } else {
    deploySuccess = await deployToDevelopment();
  }
  
  if (!deploySuccess) {
    error(`Failed to deploy to ${environment} environment. Cannot proceed.`);
    return false;
  }
  
  // Generate the client
  const generateSuccess = await generateClient();
  if (!generateSuccess) {
    warning('Failed to generate client. Continuing anyway...');
  }
  
  success(`Optimized deployment to ${environment} environment completed`);
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
  deployToDevelopment,
  deployToProduction,
  generateClient
};
