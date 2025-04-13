#!/usr/bin/env node

/**
 * Data Seeding Script for Amplify Gen 2
 *
 * This script seeds data into the Amplify Gen 2 backend.
 * It supports both local development and production environments.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const fs = require('fs');
const path = require('path');
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
const success = (message) => console.log(`${colors.green}✓ ${message}${colors.reset}`);
const warning = (message) => console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
const error = (message) => console.log(`${colors.red}✗ ${message}${colors.reset}`);
const info = (message) => console.log(`${colors.blue}ℹ ${message}${colors.reset}`);

// Get command and environments from command line
const args = process.argv.slice(2);
let command = 'seed';
let sourceEnv = 'development';
let targetEnv = null;

if (args.length >= 1) {
  if (args[0] === 'sync') {
    command = 'sync';
    sourceEnv = args[1] || 'development';
    targetEnv = args[2] || 'production';
  } else {
    sourceEnv = args[0];
  }
}

const environment = sourceEnv;
info(`Environment: ${environment}`);

if (command === 'sync') {
  info(`Sync Mode: ${sourceEnv} -> ${targetEnv}`);
}

// Configure DynamoDB client
const getClient = () => {
  const config = {
    region: process.env.AWS_REGION || 'us-east-2',
  };

  // Use local endpoint for development
  if (environment === 'development') {
    config.endpoint = process.env.DYNAMODB_LOCAL_ENDPOINT || 'http://localhost:20002';
  }

  // Add credentials if provided
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    config.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };

    // Add session token if provided
    if (process.env.AWS_SESSION_TOKEN) {
      config.credentials.sessionToken = process.env.AWS_SESSION_TOKEN;
    }

    info(`Using AWS credentials for ${environment} environment`);
  } else {
    info(`Using default AWS credentials for ${environment} environment`);
  }

  const client = new DynamoDBClient(config);
  return DynamoDBDocumentClient.from(client);
};

// Function to generate a secure ID
const generateId = (prefix = '') => {
  return `${prefix}${crypto.randomUUID()}`;
};

// Function to check if data already exists
const checkDataExists = async (tableName, keyName, keyValue) => {
  const client = getClient();

  try {
    const command = new GetCommand({
      TableName: tableName,
      Key: {
        [keyName]: keyValue,
      },
    });

    const response = await client.send(command);
    return !!response.Item;
  } catch (err) {
    warning(`Error checking if data exists: ${err.message}`);
    return false;
  }
};

// Function to seed resume data
const seedResumeData = async () => {
  log('\n=== Seeding Resume Data ===');

  const client = getClient();
  const resumeId = generateId('resume-');

  // Check if resume already exists
  const resumeExists = await checkDataExists('Resume', 'id', resumeId);
  if (resumeExists) {
    info('Resume data already exists, skipping...');
    return true;
  }

  // Create resume
  try {
    const resumeData = {
      id: resumeId,
      title: 'Full Stack Developer Resume',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: 'Resume',
      Item: resumeData,
    });

    await client.send(command);
    success(`Created resume: ${resumeId}`);

    // Create related data
    await seedContactInfo(resumeId);
    await seedSummary(resumeId);
    await seedEducation(resumeId);
    await seedExperience(resumeId);
    await seedSkills(resumeId);

    return true;
  } catch (err) {
    error(`Error seeding resume data: ${err.message}`);
    return false;
  }
};

// Function to seed contact info
const seedContactInfo = async (resumeId) => {
  const client = getClient();
  const contactId = generateId('contact-');

  try {
    const contactData = {
      id: contactId,
      resumeId: resumeId,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '(555) 123-4567',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: 'ContactInfo',
      Item: contactData,
    });

    await client.send(command);
    success(`Created contact info: ${contactId}`);
    return true;
  } catch (err) {
    error(`Error seeding contact info: ${err.message}`);
    return false;
  }
};

// Function to seed summary
const seedSummary = async (resumeId) => {
  const client = getClient();
  const summaryId = generateId('summary-');

  try {
    const summaryData = {
      id: summaryId,
      resumeId: resumeId,
      persona: 'Experienced full-stack developer with a passion for creating elegant solutions.',
      goals: 'To drive innovation by blending cutting-edge technology with creative design.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: 'Summary',
      Item: summaryData,
    });

    await client.send(command);
    success(`Created summary: ${summaryId}`);
    return true;
  } catch (err) {
    error(`Error seeding summary: ${err.message}`);
    return false;
  }
};

// Function to seed education
const seedEducation = async (resumeId) => {
  const client = getClient();
  const educationId = generateId('education-');

  try {
    const educationData = {
      id: educationId,
      resumeId: resumeId,
      summary: 'Bachelor\'s and Master\'s degrees in Computer Science.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: 'Education',
      Item: educationData,
    });

    await client.send(command);
    success(`Created education: ${educationId}`);

    // Create school
    const schoolId = generateId('school-');
    const schoolData = {
      id: schoolId,
      educationId: educationId,
      name: 'University of Technology',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const schoolCommand = new PutCommand({
      TableName: 'School',
      Item: schoolData,
    });

    await client.send(schoolCommand);
    success(`Created school: ${schoolId}`);

    // Create degree
    const degreeId = generateId('degree-');
    const degreeData = {
      id: degreeId,
      schoolId: schoolId,
      major: 'Computer Science',
      startYear: '2010',
      endYear: '2014',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const degreeCommand = new PutCommand({
      TableName: 'Degree',
      Item: degreeData,
    });

    await client.send(degreeCommand);
    success(`Created degree: ${degreeId}`);

    return true;
  } catch (err) {
    error(`Error seeding education: ${err.message}`);
    return false;
  }
};

// Function to seed experience
const seedExperience = async (resumeId) => {
  const client = getClient();
  const experienceId = generateId('experience-');

  try {
    const experienceData = {
      id: experienceId,
      resumeId: resumeId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: 'Experience',
      Item: experienceData,
    });

    await client.send(command);
    success(`Created experience: ${experienceId}`);

    // Create positions
    const positions = [
      {
        id: generateId('position-'),
        experienceId: experienceId,
        title: 'Senior Developer',
        company: 'Tech Solutions Inc.',
        startDate: '2014-01',
        endDate: '2016-06',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: generateId('position-'),
        experienceId: experienceId,
        title: 'Lead Engineer',
        company: 'Innovative Systems',
        startDate: '2016-07',
        endDate: '2018-12',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: generateId('position-'),
        experienceId: experienceId,
        title: 'Software Architect',
        company: 'Enterprise Solutions',
        startDate: '2019-01',
        endDate: '2021-06',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    for (const position of positions) {
      const positionCommand = new PutCommand({
        TableName: 'Position',
        Item: position,
      });

      await client.send(positionCommand);
      success(`Created position: ${position.id}`);
    }

    return true;
  } catch (err) {
    error(`Error seeding experience: ${err.message}`);
    return false;
  }
};

// Function to seed skills
const seedSkills = async (resumeId) => {
  const client = getClient();

  try {
    const skills = [
      {
        id: generateId('skill-'),
        resumeId: resumeId,
        title: 'JavaScript',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: generateId('skill-'),
        resumeId: resumeId,
        title: 'TypeScript',
        link: 'https://www.typescriptlang.org/',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: generateId('skill-'),
        resumeId: resumeId,
        title: 'React',
        link: 'https://reactjs.org/',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: generateId('skill-'),
        resumeId: resumeId,
        title: 'Next.js',
        link: 'https://nextjs.org/',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: generateId('skill-'),
        resumeId: resumeId,
        title: 'AWS Amplify',
        link: 'https://aws.amazon.com/amplify/',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    for (const skill of skills) {
      const skillCommand = new PutCommand({
        TableName: 'Skill',
        Item: skill,
      });

      await client.send(skillCommand);
      success(`Created skill: ${skill.id}`);
    }

    return true;
  } catch (err) {
    error(`Error seeding skills: ${err.message}`);
    return false;
  }
};

// Function to sync data between environments
const syncData = async (sourceEnv, targetEnv) => {
  log(`\n=== Syncing Data from ${sourceEnv} to ${targetEnv} ===`);

  try {
    // Configure source client
    const sourceConfig = {
      region: process.env.AWS_REGION || 'us-east-2',
    };

    if (sourceEnv === 'development') {
      sourceConfig.endpoint = process.env.DYNAMODB_LOCAL_ENDPOINT || 'http://localhost:20002';
    }

    const sourceClient = DynamoDBDocumentClient.from(new DynamoDBClient(sourceConfig));

    // Configure target client
    const targetConfig = {
      region: process.env.AWS_REGION || 'us-east-2',
    };

    if (targetEnv === 'development') {
      targetConfig.endpoint = process.env.DYNAMODB_LOCAL_ENDPOINT || 'http://localhost:20002';
    }

    const targetClient = DynamoDBDocumentClient.from(new DynamoDBClient(targetConfig));

    // Get table names
    const tableNames = [
      'Resume',
      'ContactInfo',
      'Summary',
      'Education',
      'School',
      'Degree',
      'Experience',
      'Position',
      'Skill'
    ];

    // For each table, get all items from source and put them in target
    for (const tableName of tableNames) {
      info(`Syncing table: ${tableName}`);

      // Get all items from source
      const sourceItems = await scanTable(sourceClient, tableName);
      info(`Found ${sourceItems.length} items in source table`);

      // Put all items in target
      let successCount = 0;
      for (const item of sourceItems) {
        try {
          await targetClient.send(new PutCommand({
            TableName: tableName,
            Item: item,
          }));
          successCount++;
        } catch (err) {
          error(`Failed to put item in target table: ${err.message}`);
        }
      }

      info(`Successfully synced ${successCount} of ${sourceItems.length} items`);
    }

    success(`Data sync from ${sourceEnv} to ${targetEnv} completed successfully`);
    return true;
  } catch (err) {
    error(`Data sync failed: ${err.message}`);
    return false;
  }
};

// Helper function to scan a table
async function scanTable(client, tableName) {
  const items = [];
  let lastEvaluatedKey = null;

  do {
    const params = {
      TableName: tableName,
      Limit: 100,
    };

    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }

    const response = await client.send(new QueryCommand(params));
    items.push(...(response.Items || []));
    lastEvaluatedKey = response.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return items;
};

// Main function
async function main() {
  if (command === 'sync') {
    log('\n=== Data Syncing for Amplify Gen 2 ===');
    log(`Source Environment: ${sourceEnv}`);
    log(`Target Environment: ${targetEnv}`);
  } else {
    log('\n=== Data Seeding for Amplify Gen 2 ===');
    log(`Environment: ${environment}`);
  }

  // Start timer
  const startTime = Date.now();

  try {
    // Check if we're running in Amplify environment
    const isAmplifyEnv = process.env.AWS_EXECUTION_ENV && process.env.AWS_EXECUTION_ENV.startsWith('AWS_ECS');
    if (isAmplifyEnv) {
      info('Running in Amplify environment');
    } else {
      info('Running in local environment');
    }

    // Check if we have AWS credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      warning('AWS credentials not found in environment variables');
      warning('Using default credentials or IAM role');
    }

    let result = false;

    if (command === 'sync') {
      // Sync data between environments
      result = await syncData(sourceEnv, targetEnv);
    } else {
      // Seed resume data
      result = await seedResumeData();
    }

    // Calculate elapsed time
    const endTime = Date.now();
    const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);

    if (result) {
      if (command === 'sync') {
        success(`Data syncing completed in ${elapsedSeconds} seconds`);
      } else {
        success(`Data seeding completed in ${elapsedSeconds} seconds`);
      }
      return true;
    } else {
      if (command === 'sync') {
        error(`Data syncing failed after ${elapsedSeconds} seconds`);
      } else {
        error(`Data seeding failed after ${elapsedSeconds} seconds`);
      }

      // In Amplify environment, we don't want to fail the build
      if (isAmplifyEnv) {
        warning('Continuing despite failure in Amplify environment');
        return true;
      }

      return false;
    }
  } catch (err) {
    if (command === 'sync') {
      error(`Data syncing failed: ${err.message}`);
    } else {
      error(`Data seeding failed: ${err.message}`);
    }

    // In Amplify environment, we don't want to fail the build
    if (process.env.AWS_EXECUTION_ENV && process.env.AWS_EXECUTION_ENV.startsWith('AWS_ECS')) {
      warning('Continuing despite failure in Amplify environment');
      return true;
    }

    return false;
  }
}

// Run the main function
if (require.main === module) {
  main().then(success => {
    if (success) {
      log('\n=== Data Seeding Successful ===');
      process.exit(0);
    } else {
      log('\n=== Data Seeding Failed ===');
      process.exit(1);
    }
  }).catch(err => {
    error(`Data seeding failed: ${err.message}`);
    process.exit(1);
  });
}

// Export functions for use in other scripts
module.exports = {
  seedResumeData,
  syncData
};
