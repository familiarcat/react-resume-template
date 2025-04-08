#!/usr/bin/env node

/**
 * This script checks for common issues that might cause AWS Amplify deployments to hang
 * Run it before deploying to AWS Amplify to catch potential issues
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
const success = (message) => console.log(`${colors.green}✓ ${message}${colors.reset}`);
const warning = (message) => console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
const error = (message) => console.log(`${colors.red}✗ ${message}${colors.reset}`);
const info = (message) => console.log(`${colors.blue}ℹ ${message}${colors.reset}`);

// Check if a file exists
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
};

// Check Node.js version
function checkNodeVersion() {
  log('\n=== Checking Node.js Version ===');
  
  const nodeVersion = process.version;
  const requiredVersion = 'v18.19.0';
  
  info(`Current Node.js version: ${nodeVersion}`);
  
  if (nodeVersion.localeCompare(requiredVersion, undefined, { numeric: true, sensitivity: 'base' }) < 0) {
    error(`Node.js version ${nodeVersion} is lower than the required version ${requiredVersion}`);
    warning(`Consider upgrading Node.js to at least ${requiredVersion}`);
    return false;
  } else {
    success(`Node.js version ${nodeVersion} meets the requirements`);
    return true;
  }
}

// Check for required files
function checkRequiredFiles() {
  log('\n=== Checking Required Files ===');
  
  const requiredFiles = [
    { path: 'next.config.js', description: 'Next.js configuration' },
    { path: 'amplify.yml', description: 'AWS Amplify configuration' },
    { path: '.npmrc', description: 'NPM configuration' },
    { path: '.nvmrc', description: 'Node Version Manager configuration' },
    { path: 'scripts/amplify-build.sh', description: 'Amplify build script' },
    { path: 'scripts/fix-dependencies.js', description: 'Dependency fix script' },
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    if (fileExists(file.path)) {
      success(`Found ${file.path} (${file.description})`);
    } else {
      error(`Missing ${file.path} (${file.description})`);
      allFilesExist = false;
    }
  }
  
  return allFilesExist;
}

// Check package.json configuration
function checkPackageJson() {
  log('\n=== Checking package.json Configuration ===');
  
  try {
    const packageJson = require(path.join(process.cwd(), 'package.json'));
    
    // Check engines field
    if (packageJson.engines && packageJson.engines.node) {
      success(`Node.js engine specified: ${packageJson.engines.node}`);
    } else {
      warning('No Node.js engine specified in package.json');
    }
    
    // Check scripts
    const requiredScripts = ['build', 'amplify-build', 'fix-dependencies'];
    const missingScripts = requiredScripts.filter(script => !packageJson.scripts || !packageJson.scripts[script]);
    
    if (missingScripts.length === 0) {
      success('All required scripts are defined in package.json');
    } else {
      error(`Missing required scripts in package.json: ${missingScripts.join(', ')}`);
    }
    
    // Check dependencies
    const criticalDependencies = ['react', 'react-dom', 'next'];
    const missingDependencies = criticalDependencies.filter(
      dep => !packageJson.dependencies || !packageJson.dependencies[dep]
    );
    
    if (missingDependencies.length === 0) {
      success('All critical dependencies are installed');
    } else {
      error(`Missing critical dependencies: ${missingDependencies.join(', ')}`);
    }
    
    // Check resolutions
    if (packageJson.resolutions && packageJson.resolutions.execa) {
      success(`Execa version pinned to ${packageJson.resolutions.execa}`);
    } else {
      warning('No execa version pinned in resolutions field');
    }
    
    return true;
  } catch (err) {
    error(`Error reading package.json: ${err.message}`);
    return false;
  }
}

// Check for potential build issues
function checkBuildIssues() {
  log('\n=== Checking for Potential Build Issues ===');
  
  // Check for .next directory
  if (fileExists('.next')) {
    info('Found .next directory - this is normal for local development');
    
    // Check for fallback-build-manifest.json
    if (!fileExists(path.join('.next', 'fallback-build-manifest.json'))) {
      warning('Missing .next/fallback-build-manifest.json - this might cause issues');
    } else {
      success('Found .next/fallback-build-manifest.json');
    }
  } else {
    info('No .next directory found - this is normal for a fresh repository');
  }
  
  // Check for node_modules
  if (fileExists('node_modules')) {
    success('Found node_modules directory');
    
    // Check for problematic dependencies
    try {
      const execaPath = path.join('node_modules', 'execa', 'package.json');
      if (fileExists(execaPath)) {
        const execaPackage = require(path.join(process.cwd(), execaPath));
        info(`Found execa version ${execaPackage.version}`);
        
        if (execaPackage.version.startsWith('9.')) {
          warning(`Execa version ${execaPackage.version} requires Node.js >= 18.19.0`);
        } else {
          success(`Execa version ${execaPackage.version} is compatible`);
        }
      }
    } catch (err) {
      warning(`Error checking execa version: ${err.message}`);
    }
  } else {
    warning('No node_modules directory found - run npm install first');
  }
  
  return true;
}

// Check for AWS Amplify configuration issues
function checkAmplifyConfig() {
  log('\n=== Checking AWS Amplify Configuration ===');
  
  if (fileExists('amplify.yml')) {
    try {
      const amplifyYml = fs.readFileSync('amplify.yml', 'utf8');
      
      // Check for common issues in amplify.yml
      if (!amplifyYml.includes('npm ci --legacy-peer-deps')) {
        warning('amplify.yml might not be using --legacy-peer-deps flag with npm ci');
      } else {
        success('amplify.yml includes --legacy-peer-deps flag');
      }
      
      if (!amplifyYml.includes('timeout')) {
        warning('amplify.yml might not include timeout protection for builds');
      } else {
        success('amplify.yml includes timeout protection');
      }
      
      if (!amplifyYml.includes('nvm use')) {
        warning('amplify.yml might not be explicitly setting Node.js version');
      } else {
        success('amplify.yml explicitly sets Node.js version');
      }
    } catch (err) {
      error(`Error reading amplify.yml: ${err.message}`);
    }
  }
  
  return true;
}

// Run a test build
function runTestBuild() {
  log('\n=== Running Test Build ===');
  
  try {
    info('Running next build with --no-lint flag to test compilation...');
    execSync('npx next build --no-lint', { stdio: 'inherit' });
    success('Test build completed successfully');
    return true;
  } catch (err) {
    error(`Test build failed: ${err.message}`);
    return false;
  }
}

// Main function
function main() {
  log(`${colors.cyan}=== AWS Amplify Deployment Check ====${colors.reset}`);
  log(`Running checks at: ${new Date().toISOString()}`);
  
  const checks = [
    { name: 'Node.js Version', fn: checkNodeVersion },
    { name: 'Required Files', fn: checkRequiredFiles },
    { name: 'package.json Configuration', fn: checkPackageJson },
    { name: 'Build Issues', fn: checkBuildIssues },
    { name: 'AWS Amplify Configuration', fn: checkAmplifyConfig },
    { name: 'Test Build', fn: runTestBuild },
  ];
  
  const results = checks.map(check => {
    try {
      return { name: check.name, success: check.fn() };
    } catch (err) {
      error(`Error during ${check.name} check: ${err.message}`);
      return { name: check.name, success: false };
    }
  });
  
  log('\n=== Summary ===');
  results.forEach(result => {
    if (result.success) {
      success(`${result.name}: Passed`);
    } else {
      error(`${result.name}: Failed`);
    }
  });
  
  const allPassed = results.every(result => result.success);
  
  if (allPassed) {
    log(`\n${colors.green}All checks passed! Your project should deploy successfully to AWS Amplify.${colors.reset}`);
  } else {
    log(`\n${colors.yellow}Some checks failed. Please fix the issues before deploying to AWS Amplify.${colors.reset}`);
  }
}

// Run the main function
main();
