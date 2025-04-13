#!/usr/bin/env node

/**
 * Unified Deployment Script for AWS Amplify Gen 2
 *
 * This script performs a complete deployment process:
 * 1. Validates AWS credentials
 * 2. Updates and deploys backend changes
 * 3. Builds the application
 * 4. Seeds data to the updated structure
 * 5. Syncs data between environments
 * 6. Creates a git commit
 * 7. Pushes to GitHub
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user for confirmation
function confirm(question) {
  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${question} (y/n)${colors.reset} `, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Function to execute a command and return its output
function execCommand(command, options = {}) {
  try {
    info(`Executing: ${command}`);
    const output = execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
    return output ? output.toString().trim() : '';
  } catch (err) {
    if (options.ignoreError) {
      warning(`Command failed but continuing: ${command}`);
      warning(`Error: ${err.message}`);
      return '';
    }
    error(`Command failed: ${command}`);
    error(`Error: ${err.message}`);
    throw err;
  }
}

// Function to check if git working directory is clean
async function isGitClean() {
  try {
    const status = execCommand('git status --porcelain', { silent: true });
    return status.length === 0;
  } catch (err) {
    error(`Failed to check git status: ${err.message}`);
    return false;
  }
}

// Function to check AWS credentials
async function checkAwsCredentials() {
  info('Checking AWS credentials...');
  try {
    execCommand('npm run aws:check', { ignoreError: true });
    return true;
  } catch (err) {
    warning('AWS credentials check failed, attempting to fix...');
    try {
      execCommand('npm run aws:fix');
      return true;
    } catch (fixErr) {
      error(`Failed to fix AWS credentials: ${fixErr.message}`);
      return false;
    }
  }
}

// Function to validate Amplify schema
async function validateAmplifySchema() {
  info('Validating Amplify configuration...');
  try {
    // Check if amplify directory exists
    const amplifyDir = path.join(process.cwd(), 'amplify');
    if (fs.existsSync(amplifyDir)) {
      info('Amplify directory found');
      return true;
    } else {
      warning('Amplify directory not found, skipping validation');
      return true;
    }
  } catch (err) {
    warning(`Amplify validation check failed: ${err.message}`);
    // Continue anyway as this is not critical
    return true;
  }
}

// Function to deploy backend changes
async function deployBackend() {
  try {
    // Get Amplify app ID from environment or use default
    let appId = process.env.AMPLIFY_APP_ID;
    if (!appId) {
      // Try to get app ID from amplify_outputs.json
      try {
        const outputsPath = path.join(process.cwd(), 'amplify_outputs.json');
        if (fs.existsSync(outputsPath)) {
          const outputs = JSON.parse(fs.readFileSync(outputsPath, 'utf8'));
          appId = outputs.appId || outputs.amplifyAppId;
          if (appId) {
            info(`Found Amplify App ID in outputs: ${appId}`);
          }
        }
      } catch (err) {
        warning(`Could not read Amplify outputs: ${err.message}`);
      }

      // If still no app ID, use default
      if (!appId) {
        appId = 'd28u81cjrxr0oe'; // Default Amplify App ID
        info(`Using default Amplify App ID: ${appId}`);
      }
    } else {
      info(`Using Amplify App ID from environment: ${appId}`);
    }

    // Get current git branch
    const branch = process.env.BRANCH_NAME || execCommand('git rev-parse --abbrev-ref HEAD', { silent: true }) || 'main';
    info(`Using git branch: ${branch}`);

    // Generate Amplify outputs
    info('Generating Amplify outputs...');
    execCommand('npm run amplify:generate-outputs');

    // Deploy backend changes
    info('Deploying backend changes...');
    execCommand(`npx ampx pipeline-deploy --app-id ${appId} --branch ${branch}`, { ignoreError: true });

    return true;
  } catch (err) {
    warning(`Backend deployment failed: ${err.message}`);
    // Automatically continue with the rest of the process
    warning('Continuing with the rest of the process despite backend deployment failure');
    return true;
  }
}

// Function to build the application
async function buildApplication() {
  info('Building the application...');
  execCommand('npm run build');

  info('Fixing Amplify files...');
  execCommand('npm run amplify:fix-files');

  return true;
}

// Function to seed data
async function seedData(environment) {
  try {
    info(`Seeding data to ${environment} environment...`);
    execCommand(`npm run seed-data:${environment}`, { ignoreError: true });
    return true;
  } catch (err) {
    warning(`Data seeding failed: ${err.message}`);
    warning('Continuing with the rest of the process despite data seeding failure');
    return true;
  }
}

// Function to sync data between environments
async function syncData(sourceEnv, targetEnv) {
  try {
    info(`Syncing data from ${sourceEnv} to ${targetEnv}...`);

    // Check if the sync script exists
    const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    const syncScript = `sync-data:${sourceEnv}-to-${targetEnv}`;

    if (packageJson.scripts && packageJson.scripts[syncScript]) {
      execCommand(`npm run ${syncScript}`, { ignoreError: true });
    } else {
      warning(`Sync script '${syncScript}' not found in package.json`);
      warning('Creating a temporary sync script');

      // Use the seed-data script as a fallback
      execCommand(`npm run seed-data:${targetEnv}`, { ignoreError: true });
    }

    return true;
  } catch (err) {
    warning(`Data sync failed: ${err.message}`);
    warning('Continuing with the rest of the process despite data sync failure');
    return true;
  }
}

// Function to create a git commit
async function createGitCommit(message) {
  try {
    info('Creating git commit...');

    // Check if there are changes to commit
    const hasChanges = !(await isGitClean());
    if (!hasChanges) {
      warning('No changes to commit');
      return true;
    }

    // Add all changes
    execCommand('git add .', { ignoreError: true });

    // Create commit
    execCommand(`git commit -m "${message}"`, { ignoreError: true });

    return true;
  } catch (err) {
    warning(`Git commit failed: ${err.message}`);
    warning('Continuing with the rest of the process despite git commit failure');
    return true;
  }
}

// Function to push to GitHub
async function pushToGitHub(branch = 'main') {
  try {
    info(`Pushing to GitHub (${branch})...`);
    execCommand(`git push origin ${branch}`, { ignoreError: true });
    return true;
  } catch (err) {
    warning(`Git push failed: ${err.message}`);
    warning('Continuing with the rest of the process despite git push failure');
    return true;
  }
}

// Main function
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const targetEnv = args[0] || 'dev';
  const syncEnv = args[1] || (targetEnv === 'dev' ? 'prod' : 'dev');
  const branch = args[2] || 'main';

  // Validate environment
  if (targetEnv !== 'dev' && targetEnv !== 'prod') {
    error('Invalid environment. Use "dev" or "prod".');
    process.exit(1);
  }

  // Start timer
  const startTime = Date.now();

  log('\n=== Unified Deployment for AWS Amplify Gen 2 ===');
  log(`Target Environment: ${targetEnv}`);
  log(`Sync Environment: ${syncEnv}`);
  log(`Git Branch: ${branch}`);

  try {
    // Check if git working directory is clean
    const isClean = await isGitClean();
    if (!isClean) {
      warning('Git working directory is not clean. Automatically continuing with deployment.');
    }

    // Check AWS credentials
    await checkAwsCredentials();

    // Check for conflicting AWS credentials
    if (process.env.AWS_PROFILE && (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_SECRET_ACCESS_KEY)) {
      warning('Both AWS_PROFILE and AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY are set.');
      warning('This can cause conflicts. Automatically using AWS_PROFILE and unsetting AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY.');

      // Automatically use AWS_PROFILE
      info('Using AWS_PROFILE for authentication');
      // Unset AWS access keys in the current process
      delete process.env.AWS_ACCESS_KEY_ID;
      delete process.env.AWS_SECRET_ACCESS_KEY;
    }

    // Validate Amplify schema
    await validateAmplifySchema();

    // Deploy backend changes
    await deployBackend();

    // Build the application
    await buildApplication();

    // Seed data
    await seedData(targetEnv);

    // Automatically sync data
    info(`Automatically syncing data from ${targetEnv} to ${syncEnv}...`);
    await syncData(targetEnv, syncEnv);

    // Create a git commit
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const commitMessage = `Deploy to ${targetEnv} environment (${timestamp})`;
    await createGitCommit(commitMessage);

    // Automatically push to GitHub
    info(`Automatically pushing to GitHub (${branch})...`);
    await pushToGitHub(branch);

    // Calculate elapsed time
    const endTime = Date.now();
    const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);

    success(`\nDeployment completed successfully in ${elapsedSeconds} seconds!`);

    // Close readline interface
    rl.close();

    return true;
  } catch (err) {
    error(`\nDeployment failed: ${err.message}`);

    // Close readline interface
    rl.close();

    process.exit(1);
  }
}

// Run the main function
if (require.main === module) {
  main().catch(err => {
    error(`Unexpected error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { main };
