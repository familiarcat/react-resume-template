#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('=== Checking AWS Configuration ===');

// Check environment variables
console.log('\nCurrent environment variables:');
console.log(`AWS_PROFILE: ${process.env.AWS_PROFILE || 'not set'}`);
console.log(`AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? 'set' : 'not set'}`);
console.log(`AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? 'set' : 'not set'}`);
console.log(`AWS_REGION: ${process.env.AWS_REGION || 'not set'}`);
console.log(`AWS_DEFAULT_REGION: ${process.env.AWS_DEFAULT_REGION || 'not set'}`);

// Test AWS identity
console.log('\nTesting AWS identity:');
try {
  const identity = execSync('bash scripts/aws-wrapper.sh aws sts get-caller-identity --output json', { encoding: 'utf8' });
  console.log('Successfully authenticated:');
  try {
    const identityJson = JSON.parse(identity);
    console.log(`Account: ${identityJson.Account}`);
    console.log(`User: ${identityJson.Arn}`);
  } catch (jsonErr) {
    console.log(identity);
  }
} catch (err) {
  console.error('Failed to authenticate with AWS:');
  console.error(err.message);
}

// List DynamoDB tables
console.log('\nListing DynamoDB tables:');
try {
  const tables = execSync('bash scripts/aws-wrapper.sh aws dynamodb list-tables --output json', { encoding: 'utf8' });
  try {
    const tablesJson = JSON.parse(tables);
    console.log(`Found ${tablesJson.TableNames.length} tables:`);
    tablesJson.TableNames.forEach(table => console.log(`- ${table}`));
  } catch (jsonErr) {
    console.log(tables);
  }
} catch (err) {
  console.error('Failed to list DynamoDB tables:');
  console.error(err.message);
}
