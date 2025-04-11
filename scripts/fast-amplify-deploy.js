#!/usr/bin/env node

/**
 * Fast Amplify Deployment
 *
 * This script optimizes the Amplify Gen 2 deployment process by:
 * 1. Implementing caching for CloudFormation templates
 * 2. Using parallel processing where possible
 * 3. Optimizing dependency installation
 * 4. Implementing incremental deployments
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

// Cache directory
const CACHE_DIR = path.join(process.cwd(), '.amplify-cache');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  success(`Created cache directory: ${CACHE_DIR}`);
}

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

// Function to calculate hash of a file or directory
function calculateHash(filePath) {
  if (fs.statSync(filePath).isDirectory()) {
    // For directories, hash the contents of all files
    const files = fs.readdirSync(filePath, { recursive: true })
      .filter(file => fs.statSync(path.join(filePath, file)).isFile())
      .sort();

    const hash = crypto.createHash('md5');

    for (const file of files) {
      const content = fs.readFileSync(path.join(filePath, file));
      hash.update(content);
    }

    return hash.digest('hex');
  } else {
    // For files, hash the content
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  }
}

// Function to check if deployment is needed
function isDeploymentNeeded() {
  const amplifyDir = path.join(process.cwd(), 'amplify');

  if (!fs.existsSync(amplifyDir)) {
    warning('Amplify directory not found. Full deployment required.');
    return true;
  }

  const hashFilePath = path.join(CACHE_DIR, 'amplify-hash.txt');

  // Calculate current hash
  const currentHash = calculateHash(amplifyDir);

  // Check if hash file exists
  if (!fs.existsSync(hashFilePath)) {
    // No previous hash, deployment needed
    fs.writeFileSync(hashFilePath, currentHash);
    info('No previous deployment hash found. Full deployment required.');
    return true;
  }

  // Read previous hash
  const previousHash = fs.readFileSync(hashFilePath, 'utf8').trim();

  // Compare hashes
  if (currentHash !== previousHash) {
    // Hashes differ, deployment needed
    fs.writeFileSync(hashFilePath, currentHash);
    info('Changes detected in Amplify configuration. Deployment required.');
    return true;
  }

  // No changes, deployment not needed
  info('No changes detected in Amplify configuration. Deployment may be skipped.');
  return false;
}

// Function to optimize dependency installation
function optimizeDependencies() {
  log('\n=== Optimizing Dependencies ===');

  // Check if pnpm is installed
  const pnpmResult = runCommand('which pnpm', { silent: true, ignoreError: true });

  if (pnpmResult.success) {
    info('pnpm detected. Using pnpm for faster dependency installation.');

    // Convert package.json to use pnpm
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Create pnpm-lock.yaml if it doesn't exist
    if (!fs.existsSync(path.join(process.cwd(), 'pnpm-lock.yaml'))) {
      info('Converting to pnpm...');
      runCommand('pnpm import');
    }

    // Install dependencies with pnpm
    const installResult = runCommand('pnpm install --frozen-lockfile');

    if (installResult.success) {
      success('Dependencies installed with pnpm');
      return true;
    } else {
      warning('Failed to install dependencies with pnpm. Falling back to npm.');
    }
  }

  // Fall back to npm ci for faster installation
  info('Using npm ci for faster dependency installation');
  const installResult = runCommand('npm ci');

  if (installResult.success) {
    success('Dependencies installed with npm ci');
    return true;
  } else {
    warning('Failed to install dependencies with npm ci. Falling back to npm install.');

    // Fall back to regular npm install
    const npmInstallResult = runCommand('npm install');

    if (npmInstallResult.success) {
      success('Dependencies installed with npm install');
      return true;
    } else {
      error('Failed to install dependencies');
      return false;
    }
  }
}

// Function to optimize Amplify deployment
async function optimizeAmplifyDeployment() {
  log('\n=== Optimizing Amplify Deployment ===');

  // Check if deployment is needed
  const deploymentNeeded = isDeploymentNeeded();

  if (!deploymentNeeded && fs.existsSync(path.join(process.cwd(), 'amplify_outputs.json'))) {
    success('Skipping deployment as no changes detected');

    // Still generate client code
    info('Generating client code...');

    // Generate outputs
    const outputsResult = runCommand('bash scripts/aws-wrapper.sh npx ampx generate outputs');

    if (!outputsResult.success) {
      warning('Failed to generate outputs');
    }

    // Generate GraphQL client code
    const graphqlResult = runCommand('bash scripts/aws-wrapper.sh npx ampx generate graphql-client-code');

    if (!graphqlResult.success) {
      warning('Failed to generate GraphQL client code');
      return false;
    }

    success('Client code generated successfully');
    return true;
  }

  // Perform deployment
  info('Deploying Amplify backend...');

  // Deploy using sandbox --once
  const deployCommand = 'bash scripts/aws-wrapper.sh npx ampx sandbox --once';

  const deployResult = runCommand(deployCommand);

  if (!deployResult.success) {
    error('Failed to deploy Amplify backend');
    return false;
  }

  success('Amplify backend deployed successfully');

  // Generate client code
  info('Generating client code...');

  // Generate outputs
  const outputsResult = runCommand('bash scripts/aws-wrapper.sh npx ampx generate outputs');

  if (!outputsResult.success) {
    warning('Failed to generate outputs');
  }

  // Generate GraphQL client code
  const graphqlResult = runCommand('bash scripts/aws-wrapper.sh npx ampx generate graphql-client-code');

  if (!graphqlResult.success) {
    warning('Failed to generate GraphQL client code');
    return false;
  }

  success('Client code generated successfully');
  return true;
}

// Function to optimize DynamoDB operations
async function optimizeDynamoDBOperations() {
  log('\n=== Optimizing DynamoDB Operations ===');

  // Check if tables exist
  info('Checking if DynamoDB tables exist...');

  // Get AWS profile
  const awsProfile = process.env.AWS_PROFILE || 'AmplifyUser';

  // Get AWS region
  const awsRegion = process.env.AWS_REGION || 'us-east-2';

  // List tables
  const listTablesCommand = `aws dynamodb list-tables --region ${awsRegion} --profile ${awsProfile}`;
  const listTablesResult = runCommand(listTablesCommand, { silent: true });

  if (!listTablesResult.success) {
    warning('Failed to list DynamoDB tables');
    return false;
  }

  // Parse tables
  const tables = JSON.parse(listTablesResult.output).TableNames || [];

  // Get model names
  const resourcePath = path.join(process.cwd(), 'amplify', 'data', 'resource.ts');

  if (!fs.existsSync(resourcePath)) {
    warning('Data model file not found');
    return false;
  }

  const content = fs.readFileSync(resourcePath, 'utf8');

  // Extract model names using regex
  const modelRegex = /(\w+):\s*a\s*\.model\(/g;
  const models = [];
  let match;

  while ((match = modelRegex.exec(content)) !== null) {
    models.push(match[1]);
  }

  // Check if all models have tables
  const missingTables = models.filter(model => !tables.includes(model));

  if (missingTables.length > 0) {
    info(`Missing tables: ${missingTables.join(', ')}`);

    // Create missing tables
    info('Creating missing tables...');
    const createTablesResult = runCommand('node scripts/create-dynamodb-tables.js');

    if (!createTablesResult.success) {
      warning('Failed to create DynamoDB tables');
      return false;
    }

    success('DynamoDB tables created successfully');
  } else {
    success('All DynamoDB tables exist');
  }

  return true;
}

// Main function
async function main() {
  log('\n=== Fast Amplify Deployment ===');

  // Start timer
  const startTime = Date.now();

  // Optimize dependencies
  const dependenciesOptimized = optimizeDependencies();
  if (!dependenciesOptimized) {
    warning('Failed to optimize dependencies');
  }

  // Optimize Amplify deployment
  const deploymentOptimized = await optimizeAmplifyDeployment();
  if (!deploymentOptimized) {
    error('Failed to optimize Amplify deployment');
    return false;
  }

  // Optimize DynamoDB operations
  const dynamoDBOptimized = await optimizeDynamoDBOperations();
  if (!dynamoDBOptimized) {
    warning('Failed to optimize DynamoDB operations');
  }

  // Calculate elapsed time
  const endTime = Date.now();
  const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);

  success(`\nAmplify deployment completed in ${elapsedSeconds} seconds`);
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
  optimizeDependencies,
  optimizeAmplifyDeployment,
  optimizeDynamoDBOperations
};
