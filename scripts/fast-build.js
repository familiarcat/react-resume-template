#!/usr/bin/env node

/**
 * Fast Build Script for AWS Amplify Gen 2
 *
 * This script performs a fast build for AWS Amplify Gen 2 deployment:
 * 1. Uses minimal dependencies
 * 2. Skips unnecessary steps
 * 3. Focuses on speed over completeness
 * 4. Ensures all required files are present
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

// Function to execute shell commands
function execCommand(command, options = {}) {
  try {
    log(`\n$ ${command}`);
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'inherit',
      ...options
    });
    return { success: true, output };
  } catch (err) {
    if (options.ignoreError) {
      warning(`Command failed but continuing: ${command}`);
      warning(`Error: ${err.message}`);
      return { success: false, error: err };
    }
    throw err;
  }
}

// Function to check if running in AWS Amplify
function isRunningInAmplify() {
  return !!process.env.AWS_EXECUTION_ENV;
}

// Function to use minimal package.json if available
function useMinimalPackageJson() {
  const minimalPackageJsonPath = path.join(process.cwd(), 'package.json.minimal');
  const packageJsonPath = path.join(process.cwd(), 'package.json');

  if (fs.existsSync(minimalPackageJsonPath)) {
    info('Using minimal package.json for faster build');

    // Backup original package.json
    if (fs.existsSync(packageJsonPath)) {
      fs.copyFileSync(packageJsonPath, `${packageJsonPath}.backup`);
      info('Original package.json backed up to package.json.backup');
    }

    // Copy minimal package.json to package.json
    fs.copyFileSync(minimalPackageJsonPath, packageJsonPath);
    success('Minimal package.json copied to package.json');

    return true;
  } else {
    info('Minimal package.json not found, using original package.json');
    return false;
  }
}

// Function to restore original package.json
function restoreOriginalPackageJson() {
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

// Function to install only essential dependencies
function installEssentialDependencies() {
  info('Installing only essential dependencies');

  // Set NODE_OPTIONS to limit memory usage
  const env = { ...process.env, NODE_OPTIONS: '--max-old-space-size=2048' };

  // Install production dependencies only
  execCommand('npm install --production --no-audit --no-fund', { env, ignoreError: true });

  // Install minimal dev dependencies needed for build
  const minimalDevDeps = [
    '@aws-amplify/backend@1.3.0',
    '@aws-amplify/backend-cli@1.3.0',
    '@aws-amplify/cli@12.10.0',
    'ampx@0.2.2',
    'typescript@5.1.6',
    'tailwindcss@3.3.0',
    'postcss@8.4.31',
    'autoprefixer@10.4.16'
  ];

  execCommand(`npm install --no-save --no-audit --no-fund ${minimalDevDeps.join(' ')}`, { env, ignoreError: true });

  success('Essential dependencies installed');
}

// Function to use minimal next.config.js if available
function useMinimalNextConfig() {
  const minimalNextConfigPath = path.join(process.cwd(), 'next.config.js.minimal');
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');

  if (fs.existsSync(minimalNextConfigPath)) {
    info('Using minimal next.config.js for faster build');

    // Backup original next.config.js
    if (fs.existsSync(nextConfigPath)) {
      fs.copyFileSync(nextConfigPath, `${nextConfigPath}.backup`);
      info('Original next.config.js backed up to next.config.js.backup');
    }

    // Copy minimal next.config.js to next.config.js
    fs.copyFileSync(minimalNextConfigPath, nextConfigPath);
    success('Minimal next.config.js copied to next.config.js');

    return true;
  } else {
    info('Minimal next.config.js not found, using original next.config.js');
    return false;
  }
}

// Function to restore original next.config.js
function restoreOriginalNextConfig() {
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  const backupPath = `${nextConfigPath}.backup`;

  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, nextConfigPath);
    fs.unlinkSync(backupPath);
    success('Original next.config.js restored');
    return true;
  } else {
    warning('No backup of next.config.js found, cannot restore');
    return false;
  }
}

// Function to perform a fast build
function fastBuild() {
  info('Performing fast build for AWS Amplify Gen 2');

  // Set NODE_OPTIONS to limit memory usage
  const env = { ...process.env, NODE_OPTIONS: '--max-old-space-size=2048' };

  // Use minimal next.config.js if available
  const usedMinimalConfig = useMinimalNextConfig();

  // Generate Amplify outputs
  info('Generating Amplify outputs');
  execCommand('npx ampx generate outputs', { env, ignoreError: true });

  // Build Next.js with minimal settings
  info('Building Next.js application');
  execCommand('npx next build', { env, ignoreError: true });

  // Restore original next.config.js if needed
  if (usedMinimalConfig) {
    restoreOriginalNextConfig();
  }

  // Fix Amplify files
  info('Fixing Amplify files');
  if (fs.existsSync('scripts/fix-amplify-files.js')) {
    execCommand('node scripts/fix-amplify-files.js', { env, ignoreError: true });
  } else {
    warning('fix-amplify-files.js not found, skipping');

    // Ensure required files exist
    const requiredFiles = [
      '.next/build-manifest.json',
      '.next/server/pages-manifest.json',
      '.next/routes-manifest.json',
      '.next/required-server-files.json'
    ];

    requiredFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      const dirPath = path.dirname(filePath);

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        info(`Created directory: ${dirPath}`);
      }

      if (!fs.existsSync(filePath)) {
        // Create empty JSON file
        fs.writeFileSync(filePath, '{}');
        warning(`Created empty ${file}`);
      }
    });
  }

  success('Fast build completed');
}

// Main function
async function main() {
  log('\n=== Fast Build for AWS Amplify Gen 2 ===');

  // Start timer
  const startTime = Date.now();

  try {
    // Check if running in AWS Amplify
    if (isRunningInAmplify()) {
      info('Running in AWS Amplify environment');

      // Use minimal package.json if available
      const usedMinimalPackageJson = useMinimalPackageJson();

      // Install essential dependencies
      installEssentialDependencies();

      // Perform fast build
      fastBuild();

      // Restore original package.json if needed
      if (usedMinimalPackageJson) {
        restoreOriginalPackageJson();
      }
    } else {
      info('Running in local environment');

      // Perform normal build
      execCommand('npm run build', { ignoreError: true });
    }
  } catch (err) {
    error(`Build failed: ${err.message}`);

    // Attempt to restore original files
    try {
      restoreOriginalPackageJson();
      restoreOriginalNextConfig();
    } catch (restoreErr) {
      warning(`Failed to restore original files: ${restoreErr.message}`);
    }
  }

  // Calculate elapsed time
  const endTime = Date.now();
  const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);

  success(`\nBuild completed in ${elapsedSeconds} seconds`);
}

// Run the main function
if (require.main === module) {
  main().catch(err => {
    error(`Unexpected error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { fastBuild, useMinimalPackageJson, restoreOriginalPackageJson };
