#!/usr/bin/env node

/**
 * Fix Package Lock Script
 * 
 * This script fixes issues with the package-lock.json file by ensuring
 * that all required dependencies are properly included.
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
const success = (message) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);
const warning = (message) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);
const error = (message) => console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);
const info = (message) => console.log(`${colors.blue}[INFO]${colors.reset} ${message}`);

// List of required Smithy packages
const requiredSmithyPackages = {
  '@smithy/is-array-buffer': '2.2.0',
  '@smithy/credential-provider-imds': '2.3.0',
  '@smithy/util-hex-encoding': '2.2.0',
  '@smithy/util-uri-escape': '2.2.0',
  '@smithy/util-utf8': '2.3.0',
  '@smithy/util-buffer-from': '2.2.0'
};

// Function to fix package-lock.json
function fixPackageLock() {
  const packageLockPath = path.join(process.cwd(), 'package-lock.json');
  
  // Check if package-lock.json exists
  if (!fs.existsSync(packageLockPath)) {
    error('package-lock.json not found');
    return false;
  }
  
  // Read package-lock.json
  let packageLock;
  try {
    packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
  } catch (err) {
    error(`Failed to parse package-lock.json: ${err.message}`);
    return false;
  }
  
  // Check if packages property exists
  if (!packageLock.packages) {
    warning('package-lock.json does not have a packages property');
    return false;
  }
  
  // Check for missing Smithy packages
  let modified = false;
  Object.entries(requiredSmithyPackages).forEach(([packageName, version]) => {
    const packagePath = `node_modules/${packageName}`;
    
    // Check if package is missing
    if (!packageLock.packages[packagePath]) {
      info(`Adding missing package: ${packageName}@${version}`);
      
      // Add package to packages
      packageLock.packages[packagePath] = {
        name: packageName,
        version: version,
        resolved: `https://registry.npmjs.org/${packageName}/-/${packageName.split('/')[1]}-${version}.tgz`,
        integrity: 'sha512-placeholder', // This will be updated when npm install is run
        dependencies: {}
      };
      
      modified = true;
    } else {
      info(`Package already exists: ${packageName}@${packageLock.packages[packagePath].version}`);
    }
  });
  
  // Save modified package-lock.json
  if (modified) {
    try {
      fs.writeFileSync(packageLockPath, JSON.stringify(packageLock, null, 2));
      success('package-lock.json updated successfully');
    } catch (err) {
      error(`Failed to write package-lock.json: ${err.message}`);
      return false;
    }
  } else {
    info('No changes needed to package-lock.json');
  }
  
  return true;
}

// Main function
function main() {
  log('\n=== Fix Package Lock ===');
  
  // Start timer
  const startTime = Date.now();
  
  // Fix package-lock.json
  const result = fixPackageLock();
  
  // Calculate elapsed time
  const endTime = Date.now();
  const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);
  
  if (result) {
    success(`\nPackage lock fixed in ${elapsedSeconds} seconds`);
  } else {
    warning(`\nPackage lock fix completed with issues in ${elapsedSeconds} seconds`);
  }
  
  return result;
}

// Run the main function if this script is executed directly
if (require.main === module) {
  const result = main();
  process.exit(result ? 0 : 1);
}

module.exports = { fixPackageLock, main };
