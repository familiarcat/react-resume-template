#!/usr/bin/env node

/**
 * Amplify Gen 2 Data Seeding Script
 * 
 * This script seeds data into the Amplify Gen 2 database:
 * - Generates unique IDs for each record to avoid duplicates
 * - Creates a complete hierarchy of related data
 * - Supports both local and production environments
 * - Cleans up existing data before seeding
 */

const { generateClient } = require('@aws-amplify/api');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Amplify } = require('aws-amplify');
const { startSandbox, isSandboxRunning, runCommand } = require('./amplify-sandbox');

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

// Generate a unique seed ID for this run
// This will be used to identify and clean up data from previous runs
const SEED_ID = process.env.SEED_ID || `seed-${crypto.randomUUID().substring(0, 8)}`;
const ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = ENV === 'production';

// Configure Amplify
async function configureAmplify() {
  try {
    // Load environment variables from .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      
      for (const line of envVars) {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    }
    
    // Configure Amplify
    Amplify.configure({
      API: {
        GraphQL: {
          endpoint: process.env.NEXT_PUBLIC_API_URL,
          region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-2',
          defaultAuthMode: 'apiKey',
          apiKey: process.env.NEXT_PUBLIC_API_KEY
        }
      }
    });
    
    success('Amplify configured successfully');
    return true;
  } catch (err) {
    error('Failed to configure Amplify:');
    error(err.message);
    return false;
  }
}

// Generate a client for the Amplify Data API
async function getDataClient() {
  try {
    // Import the Schema type
    const { Schema } = require('../amplify/data/resource');
    
    // Generate the client
    const client = generateClient();
    
    success('Data client generated successfully');
    return client;
  } catch (err) {
    error('Failed to generate data client:');
    error(err.message);
    return null;
  }
}

// Clean up existing data with the same seed ID
async function cleanupExistingData(client) {
  log('\n=== Cleaning up existing data ===');
  
  try {
    // Define the models to clean up in reverse order of dependencies
    const models = [
      'Skill', 'Degree', 'School', 'Position', 'Reference',
      'Experience', 'Education', 'ContactInformation', 'Summary', 'Resume', 'Todo'
    ];
    
    for (const modelName of models) {
      info(`Cleaning up ${modelName} data...`);
      
      try {
        // List all records for this model
        const listMethod = `list${modelName}`;
        const records = await client.models[modelName].list();
        
        // Filter records with our seed ID pattern
        const seedRecords = records.data.filter(record => 
          record.title?.includes(`[${SEED_ID}]`) || 
          record.name?.includes(`[${SEED_ID}]`) || 
          record.content?.includes(`[${SEED_ID}]`)
        );
        
        if (seedRecords.length > 0) {
          info(`Found ${seedRecords.length} ${modelName} records to delete`);
          
          // Delete each record
          for (const record of seedRecords) {
            await client.models[modelName].delete({ id: record.id });
            info(`Deleted ${modelName} record: ${record.id}`);
          }
          
          success(`Cleaned up ${seedRecords.length} ${modelName} records`);
        } else {
          info(`No ${modelName} records to clean up`);
        }
      } catch (err) {
        warning(`Error cleaning up ${modelName} data: ${err.message}`);
      }
    }
    
    success('Data cleanup completed');
    return true;
  } catch (err) {
    error('Failed to clean up existing data:');
    error(err.message);
    return false;
  }
}

// Seed data into the database
async function seedData(client) {
  log('\n=== Seeding data ===');
  
  try {
    // Create a Todo item as a simple test
    const todoResult = await client.models.Todo.create({
      content: `Test Todo [${SEED_ID}]`
    });
    
    success(`Created Todo: ${todoResult.data.id}`);
    
    // Create a Summary
    const summaryResult = await client.models.Summary.create({
      goals: `To drive innovation by blending cutting-edge technology with creative design. [${SEED_ID}]`,
      persona: `A versatile, team-oriented leader with technical proficiency. [${SEED_ID}]`,
      url: 'https://example.com',
      headshot: 'https://example.com/headshot.jpg',
      gptResponse: `Experienced leader in software development. [${SEED_ID}]`,
      resume: `Summary for ${SEED_ID}`
    });
    
    const summaryId = summaryResult.data.id;
    success(`Created Summary: ${summaryId}`);
    
    // Create ContactInformation
    const contactResult = await client.models.ContactInformation.create({
      name: `John Doe [${SEED_ID}]`,
      email: `john.doe.${SEED_ID}@example.com`,
      phone: '555-123-4567',
      resume: `Contact for ${SEED_ID}`
    });
    
    const contactId = contactResult.data.id;
    success(`Created ContactInformation: ${contactId}`);
    
    // Create References
    const reference1Result = await client.models.Reference.create({
      name: `Jane Smith [${SEED_ID}]`,
      phone: '555-987-6543',
      email: 'jane.smith@example.com',
      contactInformationId: contactId
    });
    
    success(`Created Reference: ${reference1Result.data.id}`);
    
    const reference2Result = await client.models.Reference.create({
      name: `Bob Johnson [${SEED_ID}]`,
      phone: '555-567-8901',
      email: 'bob.johnson@example.com',
      contactInformationId: contactId
    });
    
    success(`Created Reference: ${reference2Result.data.id}`);
    
    // Create Education
    const educationResult = await client.models.Education.create({
      summary: `Bachelor's and Master's degrees in Computer Science. [${SEED_ID}]`,
      resume: `Education for ${SEED_ID}`
    });
    
    const educationId = educationResult.data.id;
    success(`Created Education: ${educationId}`);
    
    // Create Schools
    const school1Result = await client.models.School.create({
      name: `University of Technology [${SEED_ID}]`,
      educationId: educationId
    });
    
    const school1Id = school1Result.data.id;
    success(`Created School: ${school1Id}`);
    
    const school2Result = await client.models.School.create({
      name: `State College [${SEED_ID}]`,
      educationId: educationId
    });
    
    const school2Id = school2Result.data.id;
    success(`Created School: ${school2Id}`);
    
    // Create Degrees
    const degree1Result = await client.models.Degree.create({
      major: `Computer Science [${SEED_ID}]`,
      startYear: '2010',
      endYear: '2014',
      schoolId: school1Id
    });
    
    success(`Created Degree: ${degree1Result.data.id}`);
    
    const degree2Result = await client.models.Degree.create({
      major: `Software Engineering [${SEED_ID}]`,
      startYear: '2014',
      endYear: '2016',
      schoolId: school2Id
    });
    
    success(`Created Degree: ${degree2Result.data.id}`);
    
    // Create Experience
    const experienceResult = await client.models.Experience.create({});
    
    const experienceId = experienceResult.data.id;
    success(`Created Experience: ${experienceId}`);
    
    // Create Positions
    const position1Result = await client.models.Position.create({
      title: `Senior Developer [${SEED_ID}]`,
      company: `Tech Solutions Inc. [${SEED_ID}]`,
      startDate: '2016',
      endDate: '2020',
      experienceId: experienceId
    });
    
    success(`Created Position: ${position1Result.data.id}`);
    
    const position2Result = await client.models.Position.create({
      title: `Lead Architect [${SEED_ID}]`,
      company: `Innovation Labs [${SEED_ID}]`,
      startDate: '2020',
      endDate: 'Present',
      experienceId: experienceId
    });
    
    success(`Created Position: ${position2Result.data.id}`);
    
    // Create Resume
    const resumeResult = await client.models.Resume.create({
      title: `Full Stack Developer Resume [${SEED_ID}]`,
      summaryId: summaryId,
      contactInformationId: contactId,
      educationId: educationId,
      experienceId: experienceId
    });
    
    const resumeId = resumeResult.data.id;
    success(`Created Resume: ${resumeId}`);
    
    // Create Skills
    const skills = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS'
    ];
    
    for (const skillName of skills) {
      const skillResult = await client.models.Skill.create({
        title: `${skillName} [${SEED_ID}]`,
        link: `https://example.com/${skillName.toLowerCase()}`,
        resumeId: resumeId
      });
      
      success(`Created Skill: ${skillResult.data.id}`);
    }
    
    success('Data seeding completed successfully');
    return true;
  } catch (err) {
    error('Failed to seed data:');
    error(err.message);
    return false;
  }
}

// Main function
async function main() {
  log(`\n=== Amplify Gen 2 Data Seeding (${ENV}) ===`);
  log(`Seed ID: ${SEED_ID}`);
  
  // Check if sandbox is running (for local development)
  if (!IS_PRODUCTION && !isSandboxRunning()) {
    warning('Sandbox is not running. Starting sandbox...');
    const sandboxStarted = await startSandbox();
    if (!sandboxStarted) {
      error('Failed to start sandbox. Cannot seed data.');
      return false;
    }
  }
  
  // Configure Amplify
  const amplifyConfigured = await configureAmplify();
  if (!amplifyConfigured) {
    error('Failed to configure Amplify. Cannot seed data.');
    return false;
  }
  
  // Get data client
  const client = await getDataClient();
  if (!client) {
    error('Failed to get data client. Cannot seed data.');
    return false;
  }
  
  // Clean up existing data
  const cleanupCompleted = await cleanupExistingData(client);
  if (!cleanupCompleted) {
    warning('Data cleanup failed or was incomplete. Proceeding with seeding anyway...');
  }
  
  // Seed data
  const seedingCompleted = await seedData(client);
  if (!seedingCompleted) {
    error('Data seeding failed.');
    return false;
  }
  
  success('Data seeding process completed successfully');
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
  configureAmplify,
  getDataClient,
  cleanupExistingData,
  seedData
};
