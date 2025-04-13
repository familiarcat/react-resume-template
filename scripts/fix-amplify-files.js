#!/usr/bin/env node

/**
 * Fix Amplify Files Script
 * 
 * This script generates the required files for Amplify Gen 2 deployment.
 * It creates the required-server-files.json file if it doesn't exist.
 */

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
const info = (message) => console.log(`${colors.blue}[INFO]${colors.reset} ${message}`);
const success = (message) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);
const warning = (message) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);
const error = (message) => console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);

// Function to check if a file exists
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
};

// Function to create required-server-files.json
const createRequiredServerFiles = () => {
  const filePath = path.join(process.cwd(), 'required-server-files.json');
  
  if (fileExists(filePath)) {
    info('required-server-files.json already exists');
    return true;
  }
  
  try {
    // Create a minimal required-server-files.json
    const content = {
      version: 1,
      config: {
        configFileName: "next.config.js",
        configDirectory: ".",
        distDir: ".next",
        runtimeConfig: {},
        images: {
          unoptimized: true
        }
      }
    };
    
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    success('Created required-server-files.json');
    return true;
  } catch (err) {
    error(`Failed to create required-server-files.json: ${err.message}`);
    return false;
  }
};

// Function to check and create routes-manifest.json
const checkRoutesManifest = () => {
  const filePath = path.join(process.cwd(), '.next', 'routes-manifest.json');
  
  if (fileExists(filePath)) {
    info('routes-manifest.json exists');
    return true;
  } else {
    warning('routes-manifest.json not found. Run "npm run build" first.');
    return false;
  }
};

// Function to check and create build-manifest.json
const checkBuildManifest = () => {
  const filePath = path.join(process.cwd(), '.next', 'build-manifest.json');
  
  if (fileExists(filePath)) {
    info('build-manifest.json exists');
    return true;
  } else {
    warning('build-manifest.json not found. Run "npm run build" first.');
    return false;
  }
};

// Main function
async function main() {
  log('\n=== Fixing Amplify Files ===');
  
  // Start timer
  const startTime = Date.now();
  
  try {
    // Create required-server-files.json
    const requiredServerFilesResult = createRequiredServerFiles();
    
    // Check routes-manifest.json
    const routesManifestResult = checkRoutesManifest();
    
    // Check build-manifest.json
    const buildManifestResult = checkBuildManifest();
    
    // Calculate elapsed time
    const endTime = Date.now();
    const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);
    
    if (requiredServerFilesResult && routesManifestResult && buildManifestResult) {
      success(`All files fixed in ${elapsedSeconds} seconds`);
      return true;
    } else {
      warning(`Some files could not be fixed (${elapsedSeconds} seconds)`);
      return false;
    }
  } catch (err) {
    error(`Failed to fix files: ${err.message}`);
    return false;
  }
}

// Run the main function
if (require.main === module) {
  main().then(success => {
    if (success) {
      log('\n=== Fixing Amplify Files Successful ===');
      process.exit(0);
    } else {
      log('\n=== Fixing Amplify Files Failed ===');
      process.exit(1);
    }
  }).catch(err => {
    error(`Unexpected error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { main };
