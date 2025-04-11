#!/usr/bin/env node

/**
 * Amplify Gen 2 Pipeline Deployment Script
 *
 * This script deploys the Amplify Gen 2 backend using the pipeline-deploy command.
 * It is intended for use in CI/CD pipelines.
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

// Function to get the current git branch
function getCurrentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch (err) {
    warning('Failed to get current git branch. Using "main" as default.');
    return 'main';
  }
}

// Function to get the Amplify app ID
function getAmplifyAppId() {
  // Try to get the app ID from environment variables
  if (process.env.AMPLIFY_APP_ID) {
    return process.env.AMPLIFY_APP_ID;
  }

  // Try to get the app ID from amplify_outputs.json
  const amplifyOutputsPath = path.join(process.cwd(), 'amplify_outputs.json');
  if (fs.existsSync(amplifyOutputsPath)) {
    try {
      const amplifyOutputs = JSON.parse(fs.readFileSync(amplifyOutputsPath, 'utf8'));
      if (amplifyOutputs.appId) {
        return amplifyOutputs.appId;
      }
    } catch (err) {
      warning(`Failed to parse amplify_outputs.json: ${err.message}`);
    }
  }

  // Prompt the user for the app ID
  warning('Could not determine Amplify app ID automatically.');
  warning('Please provide the app ID using the --app-id flag or set the AMPLIFY_APP_ID environment variable.');

  return null;
}

// Function to deploy using pipeline-deploy
async function pipelineDeploy(appId, branch) {
  log('\n=== Deploying Amplify Gen 2 Backend using pipeline-deploy ===');

  if (!appId) {
    error('Amplify app ID is required for pipeline deployment');
    return false;
  }

  if (!branch) {
    branch = getCurrentBranch();
  }

  info(`Deploying to app ID: ${appId}`);
  info(`Branch: ${branch}`);

  // Set AWS profile
  process.env.AWS_PROFILE = 'AmplifyUser';

  // Unset AWS credentials if they exist
  delete process.env.AWS_ACCESS_KEY_ID;
  delete process.env.AWS_SECRET_ACCESS_KEY;
  delete process.env.AWS_SESSION_TOKEN;

  // Deploy the backend
  info('Deploying backend with pipeline-deploy...');
  const result = runCommand(`bash scripts/aws-wrapper.sh npx ampx pipeline-deploy --app-id ${appId} --branch ${branch}`);

  if (result.success) {
    success('Backend deployed successfully');
    return true;
  } else {
    error('Failed to deploy backend');
    return false;
  }
}

// Function to generate the client
async function generateClient() {
  log('\n=== Generating Amplify Client ===');

  // Generate the client outputs
  info('Generating client outputs...');
  let result = runCommand('bash scripts/aws-wrapper.sh npx ampx generate outputs');

  if (!result.success) {
    warning('Failed to generate client outputs');
  } else {
    success('Client outputs generated successfully');
  }

  // Generate GraphQL client code
  info('Generating GraphQL client code...');
  result = runCommand('bash scripts/aws-wrapper.sh npx ampx generate graphql-client-code');

  if (!result.success) {
    warning('Failed to generate GraphQL client code');
    return false;
  }

  success('GraphQL client code generated successfully');
  return true;
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const appIdFlag = args.find(arg => arg.startsWith('--app-id='));
  const branchFlag = args.find(arg => arg.startsWith('--branch='));

  let appId = appIdFlag ? appIdFlag.split('=')[1] : null;
  let branch = branchFlag ? branchFlag.split('=')[1] : null;

  if (!appId) {
    appId = getAmplifyAppId();
  }

  if (!appId) {
    error('Amplify app ID is required for pipeline deployment');
    log('Usage: npm run amplify:pipeline-deploy -- --app-id=<app-id> [--branch=<branch>]');
    return false;
  }

  log(`\n=== Amplify Gen 2 Pipeline Deployment ===`);

  // Deploy the backend
  const deploySuccess = await pipelineDeploy(appId, branch);
  if (!deploySuccess) {
    error('Failed to deploy backend. Cannot proceed.');
    return false;
  }

  // Generate the client
  const generateSuccess = await generateClient();
  if (!generateSuccess) {
    warning('Failed to generate client. Continuing anyway...');
  }

  success('Pipeline deployment completed successfully');
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
  pipelineDeploy,
  generateClient
};
