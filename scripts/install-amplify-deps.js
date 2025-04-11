#!/usr/bin/env node

/**
 * Install Amplify Gen 2 Dependencies
 *
 * This script installs the required dependencies for Amplify Gen 2.
 */

const { execSync } = require('child_process');
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

// Function to check if a package is installed
function isPackageInstalled(packageName) {
  try {
    require.resolve(packageName);
    return true;
  } catch (err) {
    return false;
  }
}

// Function to install dependencies
async function installDependencies() {
  log('\n=== Installing Amplify Gen 2 Dependencies ===');

  // List of required dependencies
  const dependencies = [
    '@aws-amplify/api',
    '@aws-amplify/cli',
    'aws-amplify',
    'aws-sdk'
  ];

  // Check which dependencies are missing
  const missingDependencies = dependencies.filter(dep => !isPackageInstalled(dep));

  if (missingDependencies.length === 0) {
    success('All required dependencies are already installed');
    return true;
  }

  // Install missing dependencies
  info(`Installing missing dependencies: ${missingDependencies.join(', ')}`);

  const installCommand = `npm install ${missingDependencies.join(' ')} --save`;
  const result = runCommand(installCommand);

  if (result.success) {
    success('Dependencies installed successfully');
    return true;
  } else {
    error('Failed to install dependencies');
    return false;
  }
}

// Function to check Amplify CLI version
async function checkAmplifyCliVersion() {
  log('\n=== Checking Amplify CLI Version ===');

  const result = runCommand('npx ampx --version', { silent: true });

  if (result.success) {
    const version = result.output.trim();
    success(`Amplify CLI version: ${version}`);
    return true;
  } else {
    warning('Failed to check Amplify CLI version');
    return false;
  }
}

// Main function
async function main() {
  log('\n=== Amplify Gen 2 Dependencies Setup ===');

  // Install dependencies
  const dependenciesInstalled = await installDependencies();
  if (!dependenciesInstalled) {
    error('Failed to install dependencies. Cannot proceed.');
    return false;
  }

  // Check Amplify CLI version
  await checkAmplifyCliVersion();

  success('\nAmplify Gen 2 dependencies setup completed successfully');
  info('You can now use the Amplify Gen 2 commands:');
  info('  npm run amplify:gen2:sandbox        - Start the sandbox in watch mode');
  info('  npm run amplify:gen2:sandbox-once   - Deploy once to the sandbox');
  info('  npm run amplify:gen2:full           - Deploy and seed data');

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
  installDependencies,
  checkAmplifyCliVersion
};
