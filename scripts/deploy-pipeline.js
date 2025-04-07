#!/usr/bin/env node

const { execSync } = require('child_process');

// Function to execute shell commands
function runCommand(command) {
  console.log(`Executing: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error);
    process.exit(1);
  }
}

// Main deployment function
async function deployPipeline() {
  try {
    // Deploy the backend in CI mode
    runCommand('npx amplify-backend deploy --ci');
    
    console.log('Pipeline deployment completed successfully!');
  } catch (error) {
    console.error('Error deploying pipeline:', error);
    process.exit(1);
  }
}

// Run the deployment
deployPipeline();
