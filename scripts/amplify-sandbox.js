#!/usr/bin/env node

/**
 * Amplify Gen 2 Sandbox Management Script
 * 
 * This script provides a comprehensive solution for managing the Amplify Gen 2 sandbox:
 * - Starting and stopping the sandbox
 * - Checking sandbox status
 * - Generating environment variables
 * - Deploying the data model
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
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

// Function to check if the sandbox is running
function isSandboxRunning() {
  try {
    const result = runCommand('npx ampx sandbox status --json', { silent: true });
    if (result.success && result.output) {
      const status = JSON.parse(result.output);
      return status.isRunning === true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

// Function to start the sandbox
async function startSandbox() {
  log('\n=== Starting Amplify Gen 2 Sandbox ===');
  
  // Unset AWS credentials if they exist
  delete process.env.AWS_ACCESS_KEY_ID;
  delete process.env.AWS_SECRET_ACCESS_KEY;
  delete process.env.AWS_SESSION_TOKEN;
  
  // Set AWS profile
  process.env.AWS_PROFILE = 'AmplifyUser';
  
  // Check if sandbox is already running
  if (isSandboxRunning()) {
    success('Sandbox is already running');
    return true;
  }
  
  // Start the sandbox
  const result = runCommand('npx ampx sandbox --profile AmplifyUser');
  
  if (result.success) {
    success('Sandbox started successfully');
    
    // Generate environment variables
    await generateEnvFile();
    
    return true;
  } else {
    error('Failed to start sandbox');
    return false;
  }
}

// Function to stop the sandbox
function stopSandbox() {
  log('\n=== Stopping Amplify Gen 2 Sandbox ===');
  
  // Check if sandbox is running
  if (!isSandboxRunning()) {
    warning('Sandbox is not running');
    return true;
  }
  
  // Stop the sandbox
  const result = runCommand('npx ampx sandbox stop --profile AmplifyUser');
  
  if (result.success) {
    success('Sandbox stopped successfully');
    return true;
  } else {
    error('Failed to stop sandbox');
    return false;
  }
}

// Function to check sandbox status
function checkSandboxStatus() {
  log('\n=== Checking Amplify Gen 2 Sandbox Status ===');
  
  const result = runCommand('npx ampx sandbox status', { silent: true });
  
  if (result.success) {
    try {
      const status = JSON.parse(result.output);
      
      if (status.isRunning) {
        success('Sandbox is running');
        log(`API URL: ${status.apiUrl || 'Not available'}`);
        log(`Auth URL: ${status.authUrl || 'Not available'}`);
      } else {
        warning('Sandbox is not running');
      }
      
      return status;
    } catch (err) {
      error('Failed to parse sandbox status');
      log(result.output);
      return null;
    }
  } else {
    error('Failed to check sandbox status');
    return null;
  }
}

// Function to generate environment variables file
async function generateEnvFile() {
  log('\n=== Generating Environment Variables ===');
  
  // Read the Amplify outputs file
  const amplifyOutputsPath = path.join(process.cwd(), 'amplify_outputs.json');
  
  if (!fs.existsSync(amplifyOutputsPath)) {
    error('amplify_outputs.json file not found. Run "npm run sandbox" first.');
    return false;
  }
  
  try {
    const amplifyOutputs = JSON.parse(fs.readFileSync(amplifyOutputsPath, 'utf8'));
    
    // Extract the necessary values from amplify_outputs.json
    const auth = amplifyOutputs.auth || {};
    const data = amplifyOutputs.data || {};
    
    // Create the .env.local file content
    const envContent = `
# Amplify Configuration
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
`;
    
    // Write the .env.local file
    fs.writeFileSync(path.join(process.cwd(), '.env.local'), envContent.trim());
    success('Successfully generated .env.local file with Amplify configuration.');
    return true;
  } catch (err) {
    error('Error generating environment file:');
    error(err.message);
    return false;
  }
}

// Function to deploy the data model
async function deployDataModel() {
  log('\n=== Deploying Amplify Gen 2 Data Model ===');
  
  // Check if sandbox is running
  if (!isSandboxRunning()) {
    warning('Sandbox is not running. Starting sandbox first...');
    const sandboxStarted = await startSandbox();
    if (!sandboxStarted) {
      error('Failed to start sandbox. Cannot deploy data model.');
      return false;
    }
  }
  
  // Deploy the data model
  const result = runCommand('npx ampx deploy --profile AmplifyUser');
  
  if (result.success) {
    success('Data model deployed successfully');
    
    // Generate updated environment variables
    await generateEnvFile();
    
    return true;
  } else {
    error('Failed to deploy data model');
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
    log('\n=== Amplify Gen 2 Sandbox Management ===');
    log('1. Start Sandbox');
    log('2. Stop Sandbox');
    log('3. Check Sandbox Status');
    log('4. Generate Environment Variables');
    log('5. Deploy Data Model');
    log('6. Start Sandbox and Seed Data');
    log('7. Exit');
    
    rl.question('\nEnter your choice (1-7): ', async (choice) => {
      switch (choice) {
        case '1':
          await startSandbox();
          break;
        case '2':
          stopSandbox();
          break;
        case '3':
          checkSandboxStatus();
          break;
        case '4':
          await generateEnvFile();
          break;
        case '5':
          await deployDataModel();
          break;
        case '6':
          const started = await startSandbox();
          if (started) {
            runCommand('node scripts/seed-amplify-data.js');
          }
          break;
        case '7':
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
  
  switch (command) {
    case 'start':
      await startSandbox();
      break;
    case 'stop':
      stopSandbox();
      break;
    case 'status':
      checkSandboxStatus();
      break;
    case 'env':
      await generateEnvFile();
      break;
    case 'deploy':
      await deployDataModel();
      break;
    case 'seed':
      const started = await startSandbox();
      if (started) {
        runCommand('node scripts/seed-amplify-data.js');
      }
      break;
    case 'interactive':
    case 'cli':
      createCLI();
      break;
    default:
      // If no command is provided, start the sandbox
      if (!command) {
        await startSandbox();
      } else {
        error(`Unknown command: ${command}`);
        log('\nAvailable commands:');
        log('  start       - Start the Amplify Gen 2 sandbox');
        log('  stop        - Stop the Amplify Gen 2 sandbox');
        log('  status      - Check the status of the Amplify Gen 2 sandbox');
        log('  env         - Generate environment variables');
        log('  deploy      - Deploy the Amplify Gen 2 data model');
        log('  seed        - Start sandbox and seed data');
        log('  interactive - Start interactive CLI');
        log('  cli         - Alias for interactive');
      }
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
  startSandbox,
  stopSandbox,
  checkSandboxStatus,
  generateEnvFile,
  deployDataModel,
  isSandboxRunning,
  runCommand
};
