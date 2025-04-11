#!/usr/bin/env node

/**
 * Environment-Specific Data Seeding Script
 * 
 * This script seeds data into the Amplify Gen 2 database based on the environment:
 * - Development: Creates sample data with a development prefix
 * - Production: Creates production data with a production prefix
 */

const { generateClient } = require('@aws-amplify/api');
const { Amplify } = require('aws-amplify');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

// Environment-specific prefixes
const ENV_PREFIXES = {
  development: 'DEV',
  production: 'PROD'
};

// Generate a unique seed ID for this run
const SEED_ID = process.env.SEED_ID || `seed-${crypto.randomUUID().substring(0, 8)}`;

// Configure Amplify based on environment
async function configureAmplify(environment = 'development') {
  try {
    // Load amplify_outputs.json
    let amplifyOutputsPath;
    
    if (environment === 'production') {
      amplifyOutputsPath = path.join(process.cwd(), 'amplify_outputs.production.json');
      
      // If production outputs don't exist, try the default file
      if (!fs.existsSync(amplifyOutputsPath)) {
        amplifyOutputsPath = path.join(process.cwd(), 'amplify_outputs.json');
      }
    } else {
      amplifyOutputsPath = path.join(process.cwd(), 'amplify_outputs.json');
    }
    
    if (!fs.existsSync(amplifyOutputsPath)) {
      error(`amplify_outputs.json file not found for ${environment} environment. Run deployment first.`);
      return false;
    }
    
    const amplifyOutputs = JSON.parse(fs.readFileSync(amplifyOutputsPath, 'utf8'));
    
    if (!amplifyOutputs.data?.url || !amplifyOutputs.data?.api_key) {
      error('API URL or API key not found in amplify_outputs.json');
      return false;
    }
    
    // Configure Amplify
    Amplify.configure({
      API: {
        GraphQL: {
          endpoint: amplifyOutputs.data.url,
          region: amplifyOutputs.data.aws_region || 'us-east-1',
          defaultAuthMode: 'apiKey',
          apiKey: amplifyOutputs.data.api_key
        }
      }
    });
    
    success(`Amplify configured successfully for ${environment} environment`);
    info(`API URL: ${amplifyOutputs.data.url}`);
    info(`API Key: ${amplifyOutputs.data.api_key.substring(0, 5)}...${amplifyOutputs.data.api_key.substring(amplifyOutputs.data.api_key.length - 5)}`);
    
    return true;
  } catch (err) {
    error(`Failed to configure Amplify: ${err.message}`);
    return false;
  }
}

// Clean up existing data
async function cleanupExistingData(client, environment = 'development') {
  log(`\n=== Cleaning up existing ${environment} data ===`);
  
  const prefix = ENV_PREFIXES[environment];
  
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
        const records = await client.models[modelName].list();
        
        // Filter records with our environment prefix
        const envRecords = records.data.filter(record => 
          record.title?.includes(`[${prefix}]`) || 
          record.name?.includes(`[${prefix}]`) || 
          record.content?.includes(`[${prefix}]`) ||
          record.goals?.includes(`[${prefix}]`) ||
          record.persona?.includes(`[${prefix}]`)
        );
        
        if (envRecords.length > 0) {
          info(`Found ${envRecords.length} ${modelName} records to delete`);
          
          // Delete each record
          for (const record of envRecords) {
            await client.models[modelName].delete({ id: record.id });
            info(`Deleted ${modelName} record: ${record.id}`);
          }
          
          success(`Cleaned up ${envRecords.length} ${modelName} records`);
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
    error(`Failed to clean up existing data: ${err.message}`);
    return false;
  }
}

// Seed data based on environment
async function seedData(client, environment = 'development') {
  log(`\n=== Seeding ${environment} data ===`);
  
  const prefix = ENV_PREFIXES[environment];
  
  try {
    // Create a Todo item as a simple test
    info('Creating a test Todo item...');
    const todoResult = await client.models.Todo.create({
      content: `Test Todo [${prefix}] [${SEED_ID}]`
    });
    
    success(`Created Todo: ${todoResult.data.id}`);
    
    // Create a Resume
    info('Creating Resume...');
    const resumeResult = await client.models.Resume.create({
      title: `Full Stack Developer Resume [${prefix}] [${SEED_ID}]`
    });
    
    const resumeId = resumeResult.data.id;
    success(`Created Resume: ${resumeId}`);
    
    // Create a Summary
    info('Creating Summary...');
    const summaryResult = await client.models.Summary.create({
      goals: `To drive innovation by blending cutting-edge technology with creative design. [${prefix}] [${SEED_ID}]`,
      persona: `A versatile, team-oriented leader with technical proficiency. [${prefix}] [${SEED_ID}]`,
      url: 'https://example.com',
      headshot: 'https://example.com/headshot.jpg',
      gptResponse: `Experienced leader in software development. [${prefix}] [${SEED_ID}]`,
      resume: resumeId
    });
    
    const summaryId = summaryResult.data.id;
    success(`Created Summary: ${summaryId}`);
    
    // Update Resume with Summary ID
    info('Updating Resume with Summary ID...');
    await client.models.Resume.update({
      id: resumeId,
      summaryId: summaryId
    });
    
    success(`Updated Resume with Summary ID`);
    
    // Create ContactInformation
    info('Creating ContactInformation...');
    const contactResult = await client.models.ContactInformation.create({
      name: `John Doe [${prefix}] [${SEED_ID}]`,
      email: `john.doe.${environment}.${SEED_ID}@example.com`,
      phone: '555-123-4567',
      resume: resumeId
    });
    
    const contactId = contactResult.data.id;
    success(`Created ContactInformation: ${contactId}`);
    
    // Update Resume with ContactInformation ID
    info('Updating Resume with ContactInformation ID...');
    await client.models.Resume.update({
      id: resumeId,
      contactInformationId: contactId
    });
    
    success(`Updated Resume with ContactInformation ID`);
    
    // Create References
    info('Creating References...');
    const reference1Result = await client.models.Reference.create({
      name: `Jane Smith [${prefix}] [${SEED_ID}]`,
      phone: '555-987-6543',
      email: `jane.smith.${environment}@example.com`,
      contactInformationId: contactId
    });
    
    success(`Created Reference: ${reference1Result.data.id}`);
    
    const reference2Result = await client.models.Reference.create({
      name: `Bob Johnson [${prefix}] [${SEED_ID}]`,
      phone: '555-567-8901',
      email: `bob.johnson.${environment}@example.com`,
      contactInformationId: contactId
    });
    
    success(`Created Reference: ${reference2Result.data.id}`);
    
    // Create Education
    info('Creating Education...');
    const educationResult = await client.models.Education.create({
      summary: `Bachelor's and Master's degrees in Computer Science. [${prefix}] [${SEED_ID}]`,
      resume: resumeId
    });
    
    const educationId = educationResult.data.id;
    success(`Created Education: ${educationId}`);
    
    // Update Resume with Education ID
    info('Updating Resume with Education ID...');
    await client.models.Resume.update({
      id: resumeId,
      educationId: educationId
    });
    
    success(`Updated Resume with Education ID`);
    
    // Create Schools
    info('Creating Schools...');
    const school1Result = await client.models.School.create({
      name: `University of Technology [${prefix}] [${SEED_ID}]`,
      educationId: educationId
    });
    
    const school1Id = school1Result.data.id;
    success(`Created School: ${school1Id}`);
    
    const school2Result = await client.models.School.create({
      name: `State College [${prefix}] [${SEED_ID}]`,
      educationId: educationId
    });
    
    const school2Id = school2Result.data.id;
    success(`Created School: ${school2Id}`);
    
    // Create Degrees
    info('Creating Degrees...');
    const degree1Result = await client.models.Degree.create({
      major: `Computer Science [${prefix}] [${SEED_ID}]`,
      startYear: '2010',
      endYear: '2014',
      schoolId: school1Id
    });
    
    success(`Created Degree: ${degree1Result.data.id}`);
    
    const degree2Result = await client.models.Degree.create({
      major: `Software Engineering [${prefix}] [${SEED_ID}]`,
      startYear: '2014',
      endYear: '2016',
      schoolId: school2Id
    });
    
    success(`Created Degree: ${degree2Result.data.id}`);
    
    // Create Experience
    info('Creating Experience...');
    const experienceResult = await client.models.Experience.create({});
    
    const experienceId = experienceResult.data.id;
    success(`Created Experience: ${experienceId}`);
    
    // Update Resume with Experience ID
    info('Updating Resume with Experience ID...');
    await client.models.Resume.update({
      id: resumeId,
      experienceId: experienceId
    });
    
    success(`Updated Resume with Experience ID`);
    
    // Create Positions
    info('Creating Positions...');
    const position1Result = await client.models.Position.create({
      title: `Senior Developer [${prefix}] [${SEED_ID}]`,
      company: `Tech Solutions Inc. [${prefix}] [${SEED_ID}]`,
      startDate: '2016',
      endDate: '2018',
      experienceId: experienceId
    });
    
    success(`Created Position: ${position1Result.data.id}`);
    
    const position2Result = await client.models.Position.create({
      title: `Lead Engineer [${prefix}] [${SEED_ID}]`,
      company: `Innovative Systems [${prefix}] [${SEED_ID}]`,
      startDate: '2018',
      endDate: '2020',
      experienceId: experienceId
    });
    
    success(`Created Position: ${position2Result.data.id}`);
    
    // Create Skills
    info('Creating Skills...');
    const skills = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS'
    ];
    
    for (const skillName of skills) {
      const skillResult = await client.models.Skill.create({
        title: `${skillName} [${prefix}] [${SEED_ID}]`,
        link: `https://example.com/${skillName.toLowerCase()}`,
        resumeId: resumeId
      });
      
      success(`Created Skill: ${skillResult.data.id}`);
    }
    
    success(`${environment} data seeding completed successfully`);
    return true;
  } catch (err) {
    error(`Failed to seed ${environment} data: ${err.message}`);
    return false;
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const environment = args[0] || 'development';
  
  if (!['development', 'production'].includes(environment)) {
    error(`Invalid environment: ${environment}. Must be 'development' or 'production'.`);
    return false;
  }
  
  log(`\n=== Amplify Gen 2 Data Seeding (${environment}) ===`);
  log(`Seed ID: ${SEED_ID}`);
  log(`Environment Prefix: ${ENV_PREFIXES[environment]}`);
  
  // Configure Amplify
  const amplifyConfigured = await configureAmplify(environment);
  if (!amplifyConfigured) {
    error(`Failed to configure Amplify for ${environment} environment. Cannot seed data.`);
    return false;
  }
  
  // Generate client
  info('Generating client...');
  const client = generateClient();
  
  // Clean up existing data
  const cleanupCompleted = await cleanupExistingData(client, environment);
  if (!cleanupCompleted) {
    warning(`Data cleanup for ${environment} environment failed or was incomplete. Proceeding with seeding anyway...`);
  }
  
  // Seed data
  const seedingCompleted = await seedData(client, environment);
  if (!seedingCompleted) {
    error(`Data seeding for ${environment} environment failed.`);
    return false;
  }
  
  success(`Data seeding process for ${environment} environment completed successfully`);
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
    error(`Script failed: ${err.message}`);
    process.exit(1);
  });
}

// Export functions for use in other scripts
module.exports = {
  configureAmplify,
  cleanupExistingData,
  seedData
};
