#!/usr/bin/env node

/**
 * Use Minimal Package Script
 * 
 * This script replaces the package.json with a minimal version for faster builds.
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

// Function to use minimal package.json
function useMinimalPackage() {
  log('\n=== Using Minimal Package.json ===');
  
  const minimalPackageJsonPath = path.join(process.cwd(), 'package.json.minimal');
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  // Check if minimal package.json exists
  if (!fs.existsSync(minimalPackageJsonPath)) {
    error('Minimal package.json not found');
    return false;
  }
  
  // Backup original package.json
  if (fs.existsSync(packageJsonPath)) {
    fs.copyFileSync(packageJsonPath, `${packageJsonPath}.backup`);
    info('Original package.json backed up to package.json.backup');
  }
  
  // Copy minimal package.json to package.json
  fs.copyFileSync(minimalPackageJsonPath, packageJsonPath);
  success('Minimal package.json copied to package.json');
  
  return true;
}

// Function to restore original package.json
function restoreOriginalPackage() {
  log('\n=== Restoring Original Package.json ===');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const backupPath = `${packageJsonPath}.backup`;
  
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, packageJsonPath);
    fs.unlinkSync(backupPath);
    success('Original package.json restored');
    return true;
  } else {
    warning('No backup of package.json found, cannot restore');
    return false;
  }
}

// Main function
function main() {
  const command = process.argv[2];
  
  if (command === 'use') {
    return useMinimalPackage();
  } else if (command === 'restore') {
    return restoreOriginalPackage();
  } else {
    error('Invalid command. Use "use" or "restore"');
    return false;
  }
}

// Run the main function if this script is executed directly
if (require.main === module) {
  const result = main();
  process.exit(result ? 0 : 1);
}

module.exports = { useMinimalPackage, restoreOriginalPackage };
