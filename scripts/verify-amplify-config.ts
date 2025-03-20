import { generateClient } from '@aws-amplify/api';
import { type Schema } from '../amplify/data/resource';
import { DataAPI } from '../app/lib/amplify-server';

async function verifyConfiguration() {
  console.log('\n=== Amplify Configuration Verification ===');
  
  // Check environment variables
  console.log('\nEnvironment Variables:');
  const envVars = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_API_KEY',
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY'
  ];
  
  envVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`${varName}: ${value ? '✓ Set' : '✗ Missing'}`);
  });

  // Try to initialize Amplify client
  try {
    console.log('\nTesting Amplify Client initialization...');
    const client = generateClient<Schema>();
    
    console.log('\nAvailable Models:');
    if (client.models) {
      const modelNames = Object.keys(client.models);
      if (modelNames.length > 0) {
        modelNames.forEach(name => console.log(`- ${name}`));
      } else {
        console.log('No models found');
      }
    } else {
      console.log('Models not initialized');
    }
    
    // Try to make a test query using DataAPI
    console.log('\nTesting API connection...');
    try {
      const response = await DataAPI.Resume.list();
      console.log('API Test Result:', response ? '✓ Success' : '✗ Failed');
    } catch (error) {
      console.error('API Test Failed:', error);
    }
    
  } catch (error) {
    console.error('\nFailed to initialize Amplify client:', error);
  }
  
  console.log('\n=======================================');
}

// Run verification
verifyConfiguration().catch(console.error);
