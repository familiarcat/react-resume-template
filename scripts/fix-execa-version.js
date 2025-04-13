#!/usr/bin/env node

/**
 * Fix Execa Version Script
 * 
 * This script fixes issues with the execa package version
 * that can cause build failures in AWS Amplify Gen 2 due to
 * Node.js version compatibility issues.
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

// Function to fix execa version in package-lock.json
function fixExecaVersion() {
  log('\n=== Fixing Execa Version in package-lock.json ===');
  
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
    fs.writeFileSync(`${packageLockPath}.execa-backup`, packageLockContent);
    info('Created backup of package-lock.json');
    
    // Fix execa version
    let modified = false;
    
    // Find all instances of execa in packages
    Object.keys(packageLock.packages).forEach(pkgPath => {
      if (pkgPath.includes('execa') || 
          (packageLock.packages[pkgPath].dependencies && 
           packageLock.packages[pkgPath].dependencies.execa)) {
        
        // If it's the execa package itself
        if (pkgPath.endsWith('execa') || pkgPath.includes('/execa/')) {
          info(`Found execa package at ${pkgPath}`);
          
          // Check if version is incompatible
          const version = packageLock.packages[pkgPath].version;
          if (version && version.startsWith('9.')) {
            info(`Downgrading execa from version ${version} to 8.0.1 at ${pkgPath}`);
            packageLock.packages[pkgPath].version = '8.0.1';
            
            // Update resolved URL if it exists
            if (packageLock.packages[pkgPath].resolved) {
              packageLock.packages[pkgPath].resolved = 'https://registry.npmjs.org/execa/-/execa-8.0.1.tgz';
            }
            
            modified = true;
          }
        }
        
        // If it has execa as a dependency
        if (packageLock.packages[pkgPath].dependencies && 
            packageLock.packages[pkgPath].dependencies.execa) {
          info(`Found execa dependency in ${pkgPath}`);
          
          // Check if version is incompatible
          const version = packageLock.packages[pkgPath].dependencies.execa;
          if (version && version.startsWith('9.')) {
            info(`Downgrading execa dependency from version ${version} to 8.0.1 in ${pkgPath}`);
            packageLock.packages[pkgPath].dependencies.execa = '8.0.1';
            modified = true;
          }
        }
      }
    });
    
    // Write updated package-lock.json
    if (modified) {
      fs.writeFileSync(packageLockPath, JSON.stringify(packageLock, null, 2));
      success('Updated package-lock.json with fixed execa version');
    } else {
      info('No changes needed to package-lock.json for execa');
    }
    
    // Now check if execa is installed in node_modules
    const execaPath = path.join(process.cwd(), 'node_modules', 'execa');
    if (fs.existsSync(execaPath)) {
      // Check the package.json of execa
      const execaPackagePath = path.join(execaPath, 'package.json');
      if (fs.existsSync(execaPackagePath)) {
        const execaPackage = JSON.parse(fs.readFileSync(execaPackagePath, 'utf8'));
        
        // Check if version is incompatible
        if (execaPackage.version && execaPackage.version.startsWith('9.')) {
          info(`Found incompatible execa version ${execaPackage.version} in node_modules, reinstalling compatible version`);
          
          try {
            // Remove the existing execa
            fs.rmSync(execaPath, { recursive: true, force: true });
            
            // Install compatible version
            execSync('npm install execa@8.0.1 --save-exact', { stdio: 'inherit' });
            success('Reinstalled compatible execa version');
          } catch (installErr) {
            error(`Failed to reinstall execa: ${installErr.message}`);
          }
        } else {
          info(`Execa version ${execaPackage.version} in node_modules is compatible`);
        }
      }
    }
    
    return true;
  } catch (err) {
    error(`Failed to fix execa version: ${err.message}`);
    return false;
  }
}

// Function to add execa to resolutions in package.json
function addExecaToResolutions() {
  log('\n=== Adding Execa to Resolutions in package.json ===');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    error('package.json not found');
    return false;
  }
  
  try {
    // Read package.json
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    
    // Backup package.json
    fs.writeFileSync(`${packageJsonPath}.execa-backup`, packageJsonContent);
    info('Created backup of package.json');
    
    // Add or update resolutions
    if (!packageJson.resolutions) {
      packageJson.resolutions = {};
    }
    
    // Add execa to resolutions
    if (packageJson.resolutions.execa !== '8.0.1') {
      packageJson.resolutions.execa = '8.0.1';
      
      // Write updated package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      success('Updated package.json with execa resolution');
    } else {
      info('Execa resolution already set in package.json');
    }
    
    return true;
  } catch (err) {
    error(`Failed to add execa to resolutions: ${err.message}`);
    return false;
  }
}

// Run the functions if this script is executed directly
if (require.main === module) {
  const result1 = fixExecaVersion();
  const result2 = addExecaToResolutions();
  process.exit(result1 && result2 ? 0 : 1);
}

module.exports = { fixExecaVersion, addExecaToResolutions };
