#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the Amplify outputs file
const amplifyOutputsPath = path.join(process.cwd(), 'amplify_outputs.json');

try {
  if (!fs.existsSync(amplifyOutputsPath)) {
    console.error('amplify_outputs.json file not found. Run "npm run sandbox" first.');
    process.exit(1);
  }

  const amplifyOutputs = JSON.parse(fs.readFileSync(amplifyOutputsPath, 'utf8'));
  
  // Extract the necessary values from amplify_outputs.json
  const {
    awsAppsyncApiEndpoint,
    awsAppsyncApiId,
    awsAppsyncAuthenticationType,
    awsAppsyncRegion,
    identityPoolId,
    region,
    userPoolId,
    webClientId
  } = amplifyOutputs;

  // Create the .env.local file content
  const envContent = `
# Amplify Configuration
NEXT_PUBLIC_AWS_APPSYNC_API_ENDPOINT=${awsAppsyncApiEndpoint}
NEXT_PUBLIC_AWS_APPSYNC_API_ID=${awsAppsyncApiId}
NEXT_PUBLIC_AWS_APPSYNC_AUTHENTICATION_TYPE=${awsAppsyncAuthenticationType}
NEXT_PUBLIC_AWS_APPSYNC_REGION=${awsAppsyncRegion}
NEXT_PUBLIC_AWS_COGNITO_IDENTITY_POOL_ID=${identityPoolId}
NEXT_PUBLIC_AWS_REGION=${region}
NEXT_PUBLIC_AWS_USER_POOLS_ID=${userPoolId}
NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID=${webClientId}
`;

  // Write the .env.local file
  fs.writeFileSync(path.join(process.cwd(), '.env.local'), envContent.trim());
  console.log('Successfully generated .env.local file with Amplify configuration.');
} catch (error) {
  console.error('Error generating environment file:', error);
  process.exit(1);
}
