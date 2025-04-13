#!/usr/bin/env node

/**
 * Amplify Data Seeding Script
 * 
 * This script seeds data into AWS Amplify Gen 2 data models,
 * ensuring consistency between local development and production environments.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');
require('dotenv').config();

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
const success = (message) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);
const warning = (message) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);
const error = (message) => console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);
const info = (message) => console.log(`${colors.blue}[INFO]${colors.reset} ${message}`);

// Function to generate a deterministic ID based on a seed
function generateDeterministicId(seed) {
  return crypto.createHash('md5').update(seed).digest('hex').substring(0, 8);
}

// Function to check if ampx is installed
function checkAmpx() {
  try {
    execSync('npx ampx --version', { stdio: 'ignore' });
    return true;
  } catch (err) {
    return false;
  }
}

// Function to generate Amplify outputs
function generateAmplifyOutputs() {
  log('\n=== Generating Amplify Outputs ===');
  
  try {
    info('Running ampx generate outputs...');
    execSync('npx ampx generate outputs', { stdio: 'inherit' });
    success('Successfully generated Amplify outputs');
    return true;
  } catch (err) {
    error(`Failed to generate Amplify outputs: ${err.message}`);
    return false;
  }
}

// Function to check AWS credentials
function checkAwsCredentials() {
  log('\n=== Checking AWS Credentials ===');
  
  // Check if AWS_PROFILE is set
  const awsProfile = process.env.AWS_PROFILE;
  if (awsProfile) {
    info(`AWS_PROFILE is set to ${awsProfile}`);
    
    // Check if AWS_ACCESS_KEY_ID is also set (which can cause conflicts)
    if (process.env.AWS_ACCESS_KEY_ID) {
      warning('Both AWS_PROFILE and AWS_ACCESS_KEY_ID are set, which can cause conflicts');
      info('Unsetting AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY for this process...');
      
      // Unset AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY for this process
      delete process.env.AWS_ACCESS_KEY_ID;
      delete process.env.AWS_SECRET_ACCESS_KEY;
      delete process.env.AWS_SESSION_TOKEN;
      
      success('AWS credential environment variables unset for this process');
    }
  } else if (process.env.AWS_ACCESS_KEY_ID) {
    info('Using AWS_ACCESS_KEY_ID for authentication');
  } else {
    warning('No AWS credentials found in environment variables');
    info('Checking for AWS credentials file...');
    
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    const awsCredentialsPath = path.join(homeDir, '.aws', 'credentials');
    
    if (fs.existsSync(awsCredentialsPath)) {
      info('AWS credentials file found');
      info('Setting AWS_PROFILE to default...');
      process.env.AWS_PROFILE = 'default';
      success('AWS_PROFILE set to default');
    } else {
      error('No AWS credentials found');
      return false;
    }
  }
  
  return true;
}

// Function to seed data
async function seedData() {
  log('\n=== Seeding Data ===');
  
  try {
    // Check if seed data directory exists
    const seedDataDir = path.join(process.cwd(), 'seed-data');
    if (!fs.existsSync(seedDataDir)) {
      info('Creating seed data directory...');
      fs.mkdirSync(seedDataDir, { recursive: true });
    }
    
    // Create sample seed data if it doesn't exist
    const resumeSeedPath = path.join(seedDataDir, 'resume.json');
    if (!fs.existsSync(resumeSeedPath)) {
      info('Creating sample resume seed data...');
      
      const sampleResume = {
        id: generateDeterministicId('resume-seed'),
        name: 'John Doe',
        title: 'Software Engineer',
        summary: 'Experienced software engineer with a passion for building scalable applications.',
        experience: [
          {
            id: generateDeterministicId('experience-1'),
            company: 'Example Corp',
            title: 'Senior Software Engineer',
            startDate: '2020-01-01',
            endDate: null,
            current: true,
            description: 'Leading development of cloud-based applications.'
          },
          {
            id: generateDeterministicId('experience-2'),
            company: 'Previous Inc',
            title: 'Software Engineer',
            startDate: '2018-01-01',
            endDate: '2019-12-31',
            current: false,
            description: 'Developed web applications using React and Node.js.'
          }
        ],
        education: [
          {
            id: generateDeterministicId('education-1'),
            institution: 'University of Example',
            degree: 'Bachelor of Science in Computer Science',
            startDate: '2014-09-01',
            endDate: '2018-05-31',
            description: 'Graduated with honors.'
          }
        ],
        skills: [
          'JavaScript',
          'TypeScript',
          'React',
          'Node.js',
          'AWS',
          'GraphQL'
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      fs.writeFileSync(resumeSeedPath, JSON.stringify(sampleResume, null, 2));
      success('Created sample resume seed data');
    }
    
    // Seed data using AWS CLI
    info('Seeding data using AWS CLI...');
    
    // Get seed data files
    const seedDataFiles = fs.readdirSync(seedDataDir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(seedDataDir, file));
    
    if (seedDataFiles.length === 0) {
      warning('No seed data files found');
      return false;
    }
    
    // Seed each data file
    for (const seedDataFile of seedDataFiles) {
      const fileName = path.basename(seedDataFile);
      const modelName = fileName.replace('.json', '');
      
      info(`Seeding ${modelName} data...`);
      
      try {
        // Read seed data
        const seedData = JSON.parse(fs.readFileSync(seedDataFile, 'utf8'));
        
        // Use AWS CLI to put item in DynamoDB
        const tableName = `Resume-${process.env.AMPLIFY_APP_ID || 'd28u81cjrxr0oe'}-${process.env.BRANCH_NAME || 'main'}`;
        
        // Check if item already exists
        try {
          execSync(
            `aws dynamodb get-item --table-name ${tableName} --key '{"id":{"S":"${seedData.id}"}}'`,
            { stdio: 'ignore' }
          );
          
          info(`Item with ID ${seedData.id} already exists in ${tableName}`);
        } catch (getErr) {
          // Item doesn't exist, create it
          info(`Creating item with ID ${seedData.id} in ${tableName}...`);
          
          // Convert seed data to DynamoDB format
          const dynamoDbItem = {};
          Object.entries(seedData).forEach(([key, value]) => {
            if (typeof value === 'string') {
              dynamoDbItem[key] = { S: value };
            } else if (typeof value === 'number') {
              dynamoDbItem[key] = { N: value.toString() };
            } else if (typeof value === 'boolean') {
              dynamoDbItem[key] = { BOOL: value };
            } else if (Array.isArray(value)) {
              if (value.length > 0 && typeof value[0] === 'string') {
                dynamoDbItem[key] = { SS: value };
              } else {
                dynamoDbItem[key] = { L: value.map(item => ({ S: JSON.stringify(item) })) };
              }
            } else if (value === null) {
              dynamoDbItem[key] = { NULL: true };
            } else if (typeof value === 'object') {
              dynamoDbItem[key] = { S: JSON.stringify(value) };
            }
          });
          
          // Put item in DynamoDB
          execSync(
            `aws dynamodb put-item --table-name ${tableName} --item '${JSON.stringify(dynamoDbItem)}'`,
            { stdio: 'inherit' }
          );
          
          success(`Created item with ID ${seedData.id} in ${tableName}`);
        }
      } catch (err) {
        error(`Failed to seed ${modelName} data: ${err.message}`);
      }
    }
    
    success('Data seeding completed');
    return true;
  } catch (err) {
    error(`Data seeding failed: ${err.message}`);
    return false;
  }
}

// Main function
async function main() {
  log('\n=== Data Seeding Process ===');
  
  // Start timer
  const startTime = Date.now();
  
  try {
    // Check if ampx is installed
    if (!checkAmpx()) {
      error('ampx is not installed');
      info('Installing ampx...');
      execSync('npm install -g ampx', { stdio: 'inherit' });
    }
    
    // Check AWS credentials
    if (!checkAwsCredentials()) {
      throw new Error('AWS credentials check failed');
    }
    
    // Generate Amplify outputs
    if (!generateAmplifyOutputs()) {
      throw new Error('Failed to generate Amplify outputs');
    }
    
    // Seed data
    if (!await seedData()) {
      throw new Error('Failed to seed data');
    }
    
    // Calculate elapsed time
    const endTime = Date.now();
    const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);
    
    success(`Data seeding process completed successfully in ${elapsedSeconds} seconds`);
    return true;
  } catch (err) {
    error(`Data seeding process failed: ${err.message}`);
    return false;
  }
}

// Run the main function
if (require.main === module) {
  main().then(success => {
    if (success) {
      log('\n=== Data Seeding Process Completed Successfully ===');
      process.exit(0);
    } else {
      log('\n=== Data Seeding Process Failed ===');
      process.exit(1);
    }
  }).catch(err => {
    error(`Unexpected error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { main, seedData };
