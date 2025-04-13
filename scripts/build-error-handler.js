#!/usr/bin/env node

/**
 * Build Error Handler Script
 * 
 * This script checks for common build errors and provides guidance on how to fix them.
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

// Function to check build directory
const checkBuildDirectory = () => {
  const buildDir = path.join(process.cwd(), '.next');
  
  if (!fileExists(buildDir)) {
    error('Build directory (.next) does not exist');
    return false;
  }
  
  info('Build directory (.next) exists');
  return true;
};

// Function to check required build files
const checkRequiredBuildFiles = () => {
  const buildDir = path.join(process.cwd(), '.next');
  
  if (!fileExists(buildDir)) {
    return false;
  }
  
  const requiredFiles = [
    'build-manifest.json',
    'server/pages-manifest.json',
    'routes-manifest.json'
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(file => {
    const filePath = path.join(buildDir, file);
    if (!fileExists(filePath)) {
      error(`Required build file missing: ${file}`);
      allFilesExist = false;
    } else {
      info(`Required build file exists: ${file}`);
    }
  });
  
  return allFilesExist;
};

// Function to check required-server-files.json
const checkRequiredServerFiles = () => {
  const filePath = path.join(process.cwd(), 'required-server-files.json');
  
  if (!fileExists(filePath)) {
    error('required-server-files.json does not exist');
    return false;
  }
  
  info('required-server-files.json exists');
  return true;
};

// Function to check package.json
const checkPackageJson = () => {
  const filePath = path.join(process.cwd(), 'package.json');
  
  if (!fileExists(filePath)) {
    error('package.json does not exist');
    return false;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Check for required fields
    const requiredFields = ['name', 'version', 'scripts', 'dependencies'];
    let allFieldsExist = true;
    
    requiredFields.forEach(field => {
      if (!packageJson[field]) {
        error(`Required field missing in package.json: ${field}`);
        allFieldsExist = false;
      }
    });
    
    // Check for required scripts
    const requiredScripts = ['build', 'start', 'dev'];
    let allScriptsExist = true;
    
    requiredScripts.forEach(script => {
      if (!packageJson.scripts[script]) {
        error(`Required script missing in package.json: ${script}`);
        allScriptsExist = false;
      }
    });
    
    return allFieldsExist && allScriptsExist;
  } catch (err) {
    error(`Error parsing package.json: ${err.message}`);
    return false;
  }
};

// Function to check next.config.js
const checkNextConfig = () => {
  const filePath = path.join(process.cwd(), 'next.config.js');
  
  if (!fileExists(filePath)) {
    error('next.config.js does not exist');
    return false;
  }
  
  info('next.config.js exists');
  return true;
};

// Main function
async function main() {
  log('\n=== Build Error Handler ===');
  
  // Start timer
  const startTime = Date.now();
  
  try {
    // Check build directory
    const buildDirResult = checkBuildDirectory();
    
    // Check required build files
    const requiredFilesResult = checkRequiredBuildFiles();
    
    // Check required-server-files.json
    const requiredServerFilesResult = checkRequiredServerFiles();
    
    // Check package.json
    const packageJsonResult = checkPackageJson();
    
    // Check next.config.js
    const nextConfigResult = checkNextConfig();
    
    // Calculate elapsed time
    const endTime = Date.now();
    const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);
    
    if (buildDirResult && requiredFilesResult && requiredServerFilesResult && packageJsonResult && nextConfigResult) {
      success(`All checks passed in ${elapsedSeconds} seconds`);
      return true;
    } else {
      warning(`Some checks failed (${elapsedSeconds} seconds)`);
      return false;
    }
  } catch (err) {
    error(`Unexpected error: ${err.message}`);
    return false;
  }
}

// Run the main function
if (require.main === module) {
  main().then(success => {
    if (success) {
      log('\n=== Build Error Handler Completed Successfully ===');
      process.exit(0);
    } else {
      log('\n=== Build Error Handler Completed with Errors ===');
      process.exit(1);
    }
  }).catch(err => {
    error(`Unexpected error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { main };
