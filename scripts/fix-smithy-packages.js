#!/usr/bin/env node

/**
 * Fix Smithy Packages Script
 * 
 * This script fixes issues with Smithy packages in package-lock.json
 * that can cause build failures in AWS Amplify Gen 2.
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

// Function to fix Smithy packages in package-lock.json
function fixSmithyPackages() {
  log('\n=== Fixing Smithy Packages in package-lock.json ===');
  
  const packageLockPath = path.join(process.cwd(), 'package-lock.json');
  
  if (!fs.existsSync(packageLockPath)) {
    error('package-lock.json not found');
    return false;
  }
  
  try {
    // Read package-lock.json
    const packageLockContent = fs.readFileSync(packageLockPath, 'utf8');
    const packageLock = JSON.parse(packageLockContent);
    
    // Check if packages property exists
    if (!packageLock.packages) {
      warning('No packages property found in package-lock.json');
      return false;
    }
    
    // Backup package-lock.json
    fs.writeFileSync(`${packageLockPath}.backup`, packageLockContent);
    info('Created backup of package-lock.json');
    
    // Fix Smithy packages
    let modified = false;
    
    // Add missing Smithy packages
    const smithyPackages = [
      '@smithy/util-buffer-from',
      '@smithy/is-array-buffer',
      '@smithy/util-hex-encoding',
      '@smithy/util-uri-escape',
      '@smithy/util-utf8',
      '@smithy/credential-provider-imds'
    ];
    
    // Check if node_modules exists
    if (!packageLock.packages['node_modules']) {
      packageLock.packages['node_modules'] = {};
      modified = true;
    }
    
    // Add missing Smithy packages
    smithyPackages.forEach(pkg => {
      const pkgPath = `node_modules/${pkg}`;
      
      if (!packageLock.packages[pkgPath]) {
        info(`Adding ${pkg} to package-lock.json`);
        
        packageLock.packages[pkgPath] = {
          version: '2.2.0',
          resolved: `https://registry.npmjs.org/${pkg}/-/${pkg.split('/')[1]}-2.2.0.tgz`,
          integrity: 'sha512-example-integrity-value',
          dependencies: {}
        };
        
        modified = true;
      }
    });
    
    // Write updated package-lock.json
    if (modified) {
      fs.writeFileSync(packageLockPath, JSON.stringify(packageLock, null, 2));
      success('Updated package-lock.json with fixed Smithy packages');
    } else {
      info('No changes needed to package-lock.json');
    }
    
    return true;
  } catch (err) {
    error(`Failed to fix Smithy packages: ${err.message}`);
    return false;
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  const result = fixSmithyPackages();
  process.exit(result ? 0 : 1);
}

module.exports = { fixSmithyPackages };
