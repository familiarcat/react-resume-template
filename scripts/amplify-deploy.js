#!/usr/bin/env node

/**
 * Amplify Gen 2 Deployment Script
 * 
 * This script manages the deployment of the Amplify Gen 2 backend:
 * - Deploys the backend to the cloud
 * - Generates environment variables for the deployed backend
 * - Seeds data into the deployed backend
 * - Supports both development and production environments
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { runCommand } = require('./amplify-sandbox');

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

// Function to deploy the Amplify Gen 2 backend
async function deployBackend(environment = 'dev') {
  log(`\n=== Deploying Amplify Gen 2 Backend (${environment}) ===`);
  
  try {
    // Set AWS profile
    process.env.AWS_PROFILE = 'AmplifyUser';
    
    // Unset AWS credentials if they exist
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.AWS_SESSION_TOKEN;
    
    // Deploy the backend
    const result = runCommand(`npx ampx deploy --profile AmplifyUser --environment ${environment}`);
    
    if (result.success) {
      success(`Backend deployed successfully to ${environment} environment`);
      
      // Generate environment variables
      await generateEnvFile(environment);
      
      return true;
    } else {
      error(`Failed to deploy backend to ${environment} environment`);
      return false;
    }
  } catch (err) {
    error(`Failed to deploy backend to ${environment} environment:`);
    error(err.message);
    return false;
  }
}

// Function to generate environment variables file for the deployed backend
async function generateEnvFile(environment = 'dev') {
  log(`\n=== Generating Environment Variables for ${environment} ===`);
  
  // Read the Amplify outputs file
  const amplifyOutputsPath = path.join(process.cwd(), 'amplify_outputs.json');
  
  if (!fs.existsSync(amplifyOutputsPath)) {
    error('amplify_outputs.json file not found. Run "npx ampx deploy" first.');
    return false;
  }
  
  try {
    const amplifyOutputs = JSON.parse(fs.readFileSync(amplifyOutputsPath, 'utf8'));
    
    // Extract the necessary values from amplify_outputs.json
    const auth = amplifyOutputs.auth || {};
    const data = amplifyOutputs.data || {};
    
    // Create the environment file content
    const envContent = `
# Amplify Configuration for ${environment} environment
NEXT_PUBLIC_API_URL=${data.url || ''}
NEXT_PUBLIC_API_KEY=${data.api_key || ''}
NEXT_PUBLIC_AWS_REGION=${data.aws_region || ''}
NEXT_PUBLIC_AWS_APPSYNC_API_ENDPOINT=${data.url || ''}
NEXT_PUBLIC_AWS_APPSYNC_API_ID=${data.url ? data.url.split('/')[2].split('.')[0] : ''}
NEXT_PUBLIC_AWS_APPSYNC_AUTHENTICATION_TYPE=${data.default_authorization_type || ''}
NEXT_PUBLIC_AWS_APPSYNC_REGION=${data.aws_region || ''}
NEXT_PUBLIC_AWS_COGNITO_IDENTITY_POOL_ID=${auth.identity_pool_id || ''}
NEXT_PUBLIC_AWS_USER_POOLS_ID=${auth.user_pool_id || ''}
NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID=${auth.user_pool_client_id || ''}

# Timestamp to verify env file was generated
NEXT_PUBLIC_ENV_GENERATED_AT=${new Date().toISOString()}
NEXT_PUBLIC_ENVIRONMENT=${environment}
`;
    
    // Determine the output file path based on the environment
    let outputPath;
    if (environment === 'dev' || environment === 'development') {
      outputPath = path.join(process.cwd(), '.env.local');
    } else if (environment === 'prod' || environment === 'production') {
      outputPath = path.join(process.cwd(), '.env.production');
    } else {
      outputPath = path.join(process.cwd(), `.env.${environment}`);
    }
    
    // Write the environment file
    fs.writeFileSync(outputPath, envContent.trim());
    
    success(`Successfully generated environment file: ${outputPath}`);
    return true;
  } catch (err) {
    error('Error generating environment file:');
    error(err.message);
    return false;
  }
}

// Function to seed data into the deployed backend
async function seedDeployedData(environment = 'dev') {
  log(`\n=== Seeding Data into ${environment} Environment ===`);
  
  try {
    // Set the environment
    process.env.NODE_ENV = environment === 'prod' || environment === 'production' ? 'production' : 'development';
    
    // Generate a unique seed ID
    process.env.SEED_ID = `deploy-${Date.now()}`;
    
    // Run the seed script
    const result = runCommand('node scripts/seed-amplify-data.js');
    
    if (result.success) {
      success(`Data seeded successfully into ${environment} environment`);
      return true;
    } else {
      error(`Failed to seed data into ${environment} environment`);
      return false;
    }
  } catch (err) {
    error(`Failed to seed data into ${environment} environment:`);
    error(err.message);
    return false;
  }
}

// Function to create an interactive CLI
function createCLI() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  function displayMenu() {
    log('\n=== Amplify Gen 2 Deployment ===');
    log('1. Deploy to Development Environment');
    log('2. Deploy to Production Environment');
    log('3. Generate Environment Variables for Development');
    log('4. Generate Environment Variables for Production');
    log('5. Seed Data into Development Environment');
    log('6. Seed Data into Production Environment');
    log('7. Full Deployment (Deploy + Seed) to Development');
    log('8. Full Deployment (Deploy + Seed) to Production');
    log('9. Exit');
    
    rl.question('\nEnter your choice (1-9): ', async (choice) => {
      switch (choice) {
        case '1':
          await deployBackend('dev');
          break;
        case '2':
          await deployBackend('prod');
          break;
        case '3':
          await generateEnvFile('dev');
          break;
        case '4':
          await generateEnvFile('prod');
          break;
        case '5':
          await seedDeployedData('dev');
          break;
        case '6':
          await seedDeployedData('prod');
          break;
        case '7':
          const devDeployed = await deployBackend('dev');
          if (devDeployed) {
            await seedDeployedData('dev');
          }
          break;
        case '8':
          const prodDeployed = await deployBackend('prod');
          if (prodDeployed) {
            await seedDeployedData('prod');
          }
          break;
        case '9':
          rl.close();
          return;
        default:
          warning('Invalid choice. Please try again.');
      }
      
      // Display menu again
      displayMenu();
    });
  }
  
  displayMenu();
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const environment = args[1] || 'dev';
  
  switch (command) {
    case 'deploy':
      await deployBackend(environment);
      break;
    case 'env':
      await generateEnvFile(environment);
      break;
    case 'seed':
      await seedDeployedData(environment);
      break;
    case 'full':
      const deployed = await deployBackend(environment);
      if (deployed) {
        await seedDeployedData(environment);
      }
      break;
    case 'interactive':
    case 'cli':
      createCLI();
      break;
    default:
      // If no command is provided, show help
      log('\n=== Amplify Gen 2 Deployment ===');
      log('\nAvailable commands:');
      log('  deploy <env>    - Deploy the backend to the specified environment (default: dev)');
      log('  env <env>       - Generate environment variables for the specified environment (default: dev)');
      log('  seed <env>      - Seed data into the specified environment (default: dev)');
      log('  full <env>      - Full deployment (deploy + seed) to the specified environment (default: dev)');
      log('  interactive     - Start interactive CLI');
      log('  cli             - Alias for interactive');
      log('\nEnvironments:');
      log('  dev, development - Development environment');
      log('  prod, production - Production environment');
  }
}

// Run the main function
if (require.main === module) {
  main().catch(err => {
    error('Script failed:');
    error(err.message);
    process.exit(1);
  });
}

// Export functions for use in other scripts
module.exports = {
  deployBackend,
  generateEnvFile,
  seedDeployedData
};
