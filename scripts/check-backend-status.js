#!/usr/bin/env node

/**
 * Check Backend Status Script
 *
 * This script checks the status of the Amplify Gen 2 backend.
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

// Function to check backend status
async function checkBackendStatus() {
  log('\n=== Checking Amplify Gen 2 Backend Status ===');

  // Set AWS profile
  process.env.AWS_PROFILE = 'AmplifyUser';

  // Unset AWS credentials if they exist
  delete process.env.AWS_ACCESS_KEY_ID;
  delete process.env.AWS_SECRET_ACCESS_KEY;
  delete process.env.AWS_SESSION_TOKEN;

  // Check if amplify_outputs.json exists
  const amplifyOutputsPath = path.join(process.cwd(), 'amplify_outputs.json');

  if (fs.existsSync(amplifyOutputsPath)) {
    try {
      const amplifyOutputs = JSON.parse(fs.readFileSync(amplifyOutputsPath, 'utf8'));

      if (amplifyOutputs.data?.url && amplifyOutputs.data?.api_key) {
        success('Backend is deployed (found API URL and API key in amplify_outputs.json)');
        log(`API URL: ${amplifyOutputs.data.url}`);
        log(`API Key: ${amplifyOutputs.data.api_key.substring(0, 5)}...${amplifyOutputs.data.api_key.substring(amplifyOutputs.data.api_key.length - 5)}`);
        return true;
      } else {
        warning('Backend may be deployed but API URL or API key not found in amplify_outputs.json');
        return false;
      }
    } catch (err) {
      error(`Error parsing amplify_outputs.json: ${err.message}`);
      return false;
    }
  } else {
    // Try to get backend info using ampx info
    const result = runCommand('npx ampx info --json --profile AmplifyUser', { silent: true, ignoreError: true });

    if (result.success && result.output) {
      try {
        const info = JSON.parse(result.output);
        success('Backend info retrieved successfully');
        log(`Backend Info: ${JSON.stringify(info, null, 2)}`);
        return true;
      } catch (err) {
        error(`Error parsing ampx info output: ${err.message}`);
        return false;
      }
    } else {
      warning('Backend may not be deployed or ampx info command failed');

      // Try to check if the backend is initialized
      const initResult = runCommand('npx ampx --version', { silent: true, ignoreError: true });

      if (initResult.success) {
        info(`Amplify CLI version: ${initResult.output.trim()}`);
        info('To deploy the backend, run: npm run amplify:deploy:backend');
      } else {
        error('Amplify CLI not found or not working properly');
      }

      return false;
    }
  }
}

// Function to check API status
async function checkApiStatus() {
  log('\n=== Checking API Status ===');

  // Get the API endpoint and API key
  const amplifyOutputsPath = path.join(process.cwd(), 'amplify_outputs.json');

  if (!fs.existsSync(amplifyOutputsPath)) {
    warning('amplify_outputs.json file not found. The backend may not be deployed or sandbox not started.');
    info('To deploy the backend, run: npm run amplify:deploy:backend');
    info('To start the sandbox, run: npm run sandbox');
    return false;
  }

  try {
    const amplifyOutputs = JSON.parse(fs.readFileSync(amplifyOutputsPath, 'utf8'));
    const apiUrl = amplifyOutputs.data?.url;
    const apiKey = amplifyOutputs.data?.api_key;

    if (!apiUrl || !apiKey) {
      warning('API URL or API key not found in amplify_outputs.json');
      info('The backend may not be deployed correctly or the sandbox not started.');
      info('To deploy the backend, run: npm run amplify:deploy:backend');
      info('To start the sandbox, run: npm run sandbox');
      return false;
    }

    // Check API status by running a simple query
    const query = `
query ListResumes {
  listResumes {
    items {
      id
      title
    }
  }
}
    `;

    // Execute the query using curl
    const curlCommand = `curl -X POST ${apiUrl} -H "Content-Type: application/json" -H "x-api-key: ${apiKey}" -d '{"query": ${JSON.stringify(query)}}'`;

    try {
      info('Executing GraphQL query to check API status...');
      const result = execSync(curlCommand, { encoding: 'utf8' });
      const jsonResult = JSON.parse(result);

      if (jsonResult.errors) {
        warning(`API query failed: ${JSON.stringify(jsonResult.errors)}`);

        // Try a simpler query
        info('Trying a simpler query...');
        const simpleQuery = `
query ListTodos {
  listTodos {
    items {
      id
      content
    }
  }
}
        `;

        const simpleCurlCommand = `curl -X POST ${apiUrl} -H "Content-Type: application/json" -H "x-api-key: ${apiKey}" -d '{"query": ${JSON.stringify(simpleQuery)}}'`;

        try {
          const simpleResult = execSync(simpleCurlCommand, { encoding: 'utf8' });
          const simpleJsonResult = JSON.parse(simpleResult);

          if (simpleJsonResult.errors) {
            warning(`Simple API query also failed: ${JSON.stringify(simpleJsonResult.errors)}`);
            return false;
          } else {
            success(`Simple API query executed successfully`);
            log(`API URL: ${apiUrl}`);
            log(`API Key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}`);
            log(`Query Result: ${JSON.stringify(simpleJsonResult.data, null, 2)}`);
            return true;
          }
        } catch (err) {
          error(`Error executing simple API query: ${err.message}`);
          return false;
        }
      } else {
        success(`API query executed successfully`);
        log(`API URL: ${apiUrl}`);
        log(`API Key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}`);
        log(`Query Result: ${JSON.stringify(jsonResult.data, null, 2)}`);
        return true;
      }
    } catch (err) {
      error(`Error executing API query: ${err.message}`);
      return false;
    }
  } catch (err) {
    error(`Error parsing amplify_outputs.json: ${err.message}`);
    return false;
  }
}

// Main function
async function main() {
  log('\n=== Checking Backend and API Status ===');

  // Check backend status
  const backendStatus = await checkBackendStatus();

  if (!backendStatus) {
    warning('Backend status check failed. Continuing with API status check...');
  }

  // Check API status
  const apiStatus = await checkApiStatus();

  if (!apiStatus) {
    error('API status check failed.');
    return false;
  }

  success('Backend and API status checks completed successfully');
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
    error('Script failed:');
    error(err.message);
    process.exit(1);
  });
}

// Export functions for use in other scripts
module.exports = {
  checkBackendStatus,
  checkApiStatus
};
