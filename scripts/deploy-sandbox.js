#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
async function deploySandbox() {
  try {
    // Set AWS profile
    process.env.AWS_PROFILE = 'AmplifyUser';
    
    // Unset AWS credentials if they exist
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.AWS_SESSION_TOKEN;
    
    // Deploy the sandbox
    runCommand('npx ampx sandbox --profile AmplifyUser');
    
    // Generate environment variables
    runCommand('node scripts/generate-env.js');
    
    console.log('Sandbox deployment completed successfully!');
  } catch (error) {
    console.error('Error deploying sandbox:', error);
    process.exit(1);
  }
}

// Run the deployment
deploySandbox();
