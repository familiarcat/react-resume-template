#!/usr/bin/env node

/**
 * Amplify CI/CD Optimization
 * 
 * This script optimizes the Amplify Gen 2 deployment process for CI/CD environments.
 * It implements caching strategies and parallel processing to speed up deployments.
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

// Function to optimize CI/CD caching
function setupCICDCaching() {
  log('\n=== Setting Up CI/CD Caching ===');
  
  // Determine CI/CD environment
  const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
  const isCircleCI = process.env.CIRCLECI === 'true';
  const isJenkins = process.env.JENKINS_URL !== undefined;
  const isAWSCodeBuild = process.env.CODEBUILD_BUILD_ID !== undefined;
  
  if (isGitHubActions) {
    info('GitHub Actions detected');
    
    // Create cache configuration for GitHub Actions
    const cacheConfig = {
      paths: [
        'node_modules',
        '.amplify-cache',
        '.next/cache'
      ]
    };
    
    // Write cache configuration
    fs.writeFileSync('.github/actions/cache-config.json', JSON.stringify(cacheConfig, null, 2));
    success('Created cache configuration for GitHub Actions');
    
    return true;
  } else if (isCircleCI) {
    info('CircleCI detected');
    
    // Create cache configuration for CircleCI
    const cacheConfig = {
      version: 2,
      jobs: {
        build: {
          steps: [
            {
              restore_cache: {
                keys: [
                  'v1-dependencies-{{ checksum "package-lock.json" }}',
                  'v1-dependencies-'
                ]
              }
            },
            {
              save_cache: {
                paths: [
                  'node_modules',
                  '.amplify-cache',
                  '.next/cache'
                ],
                key: 'v1-dependencies-{{ checksum "package-lock.json" }}'
              }
            }
          ]
        }
      }
    };
    
    // Write cache configuration
    fs.writeFileSync('.circleci/config.yml', JSON.stringify(cacheConfig, null, 2));
    success('Created cache configuration for CircleCI');
    
    return true;
  } else if (isJenkins) {
    info('Jenkins detected');
    
    // Create cache configuration for Jenkins
    const jenkinsfile = `
pipeline {
  agent any
  
  stages {
    stage('Build') {
      steps {
        // Cache dependencies
        cache(path: 'node_modules', key: "\${env.JOB_NAME}-\${hashFiles('package-lock.json')}", restoreKeys: ["\${env.JOB_NAME}-"]) {
          sh 'npm ci'
        }
        
        // Cache Amplify
        cache(path: '.amplify-cache', key: "\${env.JOB_NAME}-amplify-\${hashFiles('amplify/**')}", restoreKeys: ["\${env.JOB_NAME}-amplify-"]) {
          sh 'npm run amplify:gen2:fast'
        }
      }
    }
  }
}
`;
    
    // Write cache configuration
    fs.writeFileSync('Jenkinsfile', jenkinsfile);
    success('Created cache configuration for Jenkins');
    
    return true;
  } else if (isAWSCodeBuild) {
    info('AWS CodeBuild detected');
    
    // Create cache configuration for AWS CodeBuild
    const buildspec = `
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 18
    commands:
      - npm ci
  build:
    commands:
      - npm run amplify:gen2:fast
      - npm run build

cache:
  paths:
    - 'node_modules/**/*'
    - '.amplify-cache/**/*'
    - '.next/cache/**/*'
`;
    
    // Write cache configuration
    fs.writeFileSync('buildspec.yml', buildspec);
    success('Created cache configuration for AWS CodeBuild');
    
    return true;
  } else {
    warning('No CI/CD environment detected');
    
    // Create generic cache configuration
    const cacheDir = path.join(process.cwd(), '.amplify-cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    success('Created generic cache configuration');
    return true;
  }
}

// Function to optimize dependency installation for CI/CD
function optimizeDependenciesForCICD() {
  log('\n=== Optimizing Dependencies for CI/CD ===');
  
  // Use npm ci for faster, more reliable installations in CI/CD
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

// Function to optimize Amplify deployment for CI/CD
async function optimizeAmplifyDeploymentForCICD() {
  log('\n=== Optimizing Amplify Deployment for CI/CD ===');
  
  // Get branch name from CI/CD environment
  let branchName = 'main';
  
  if (process.env.GITHUB_REF) {
    branchName = process.env.GITHUB_REF.replace('refs/heads/', '');
  } else if (process.env.CIRCLE_BRANCH) {
    branchName = process.env.CIRCLE_BRANCH;
  } else if (process.env.JENKINS_BRANCH_NAME) {
    branchName = process.env.JENKINS_BRANCH_NAME;
  } else if (process.env.CODEBUILD_WEBHOOK_HEAD_REF) {
    branchName = process.env.CODEBUILD_WEBHOOK_HEAD_REF.replace('refs/heads/', '');
  }
  
  info(`Deploying branch: ${branchName}`);
  
  // Determine if this is a production deployment
  const isProduction = branchName === 'main' || branchName === 'master' || branchName === 'production';
  
  // Set environment
  process.env.NODE_ENV = isProduction ? 'production' : 'development';
  
  // Deploy using the appropriate command
  const deployCommand = isProduction
    ? 'bash scripts/aws-wrapper.sh npx ampx pipeline-deploy'
    : 'bash scripts/aws-wrapper.sh npx ampx sandbox --once';
  
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
  
  // Create DynamoDB tables if needed
  info('Creating DynamoDB tables if needed...');
  const createTablesResult = runCommand('node scripts/create-dynamodb-tables.js');
  
  if (!createTablesResult.success) {
    warning('Failed to create DynamoDB tables');
  }
  
  // Seed data if needed
  if (process.env.SEED_DATA === 'true') {
    info('Seeding data...');
    const seedResult = runCommand('node scripts/seed-dynamodb-directly.js');
    
    if (!seedResult.success) {
      warning('Failed to seed data');
    }
  }
  
  return true;
}

// Main function
async function main() {
  log('\n=== Amplify CI/CD Optimization ===');
  
  // Start timer
  const startTime = Date.now();
  
  // Setup CI/CD caching
  const cachingSetup = setupCICDCaching();
  if (!cachingSetup) {
    warning('Failed to setup CI/CD caching');
  }
  
  // Optimize dependencies for CI/CD
  const dependenciesOptimized = optimizeDependenciesForCICD();
  if (!dependenciesOptimized) {
    warning('Failed to optimize dependencies for CI/CD');
  }
  
  // Optimize Amplify deployment for CI/CD
  const deploymentOptimized = await optimizeAmplifyDeploymentForCICD();
  if (!deploymentOptimized) {
    error('Failed to optimize Amplify deployment for CI/CD');
    return false;
  }
  
  // Calculate elapsed time
  const endTime = Date.now();
  const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);
  
  success(`\nAmplify CI/CD optimization completed in ${elapsedSeconds} seconds`);
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
  setupCICDCaching,
  optimizeDependenciesForCICD,
  optimizeAmplifyDeploymentForCICD
};
