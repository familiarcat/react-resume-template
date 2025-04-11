#!/usr/bin/env node

/**
 * Seed DynamoDB Tables Directly
 * 
 * This script seeds data directly into DynamoDB tables using the AWS SDK.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { execSync } = require('child_process');
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

// Generate a unique seed ID for this run
const SEED_ID = process.env.SEED_ID || `seed-${crypto.randomUUID().substring(0, 8)}`;

// Initialize DynamoDB client
function initializeDynamoDBClient() {
  // Get AWS profile from environment or use default
  const awsProfile = process.env.AWS_PROFILE || 'AmplifyUser';
  
  // Get AWS region from environment or use default
  const awsRegion = process.env.AWS_REGION || 'us-east-2';
  
  // Set AWS profile
  process.env.AWS_PROFILE = awsProfile;
  
  // Create DynamoDB client
  const client = new DynamoDBClient({ region: awsRegion });
  const docClient = DynamoDBDocumentClient.from(client);
  
  return docClient;
}

// Clean up existing data
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
      
      // Scan for items with the seed ID
      const scanCommand = new ScanCommand({
        TableName: modelName,
        FilterExpression: 'contains(#title, :seedId) OR contains(#content, :seedId) OR contains(#name, :seedId) OR contains(#goals, :seedId)',
        ExpressionAttributeNames: {
          '#title': 'title',
          '#content': 'content',
          '#name': 'name',
          '#goals': 'goals'
        },
        ExpressionAttributeValues: {
          ':seedId': `[${SEED_ID}]`
        }
      });
      
      const scanResult = await client.send(scanCommand);
      const items = scanResult.Items || [];
      
      if (items.length === 0) {
        info(`No ${modelName} records to clean up`);
        continue;
      }
      
      info(`Found ${items.length} ${modelName} records to clean up`);
      
      // Delete each item
      for (const item of items) {
        const deleteCommand = new DeleteCommand({
          TableName: modelName,
          Key: { id: item.id }
        });
        
        await client.send(deleteCommand);
        info(`Deleted ${modelName} with ID: ${item.id}`);
      }
      
      success(`Cleaned up ${items.length} ${modelName} records`);
    }
    
    success('Data cleanup completed');
    return true;
  } catch (err) {
    error(`Failed to clean up data: ${err.message}`);
    return false;
  }
}

// Seed data
async function seedData(client) {
  log('\n=== Seeding data ===');
  
  try {
    // Create a test Todo item
    info('Creating a test Todo item...');
    const todoId = crypto.randomUUID();
    const todoCommand = new PutCommand({
      TableName: 'Todo',
      Item: {
        id: todoId,
        content: `Test Todo [${SEED_ID}]`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
    
    await client.send(todoCommand);
    success(`Created Todo: ${todoId}`);
    
    // Create Resume
    info('Creating Resume...');
    const resumeId = crypto.randomUUID();
    const resumeCommand = new PutCommand({
      TableName: 'Resume',
      Item: {
        id: resumeId,
        title: `Full Stack Developer Resume [${SEED_ID}]`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
    
    await client.send(resumeCommand);
    success(`Created Resume: ${resumeId}`);
    
    // Create Summary
    info('Creating Summary...');
    const summaryId = crypto.randomUUID();
    const summaryCommand = new PutCommand({
      TableName: 'Summary',
      Item: {
        id: summaryId,
        goals: `To drive innovation by blending cutting-edge technology with creative design. [${SEED_ID}]`,
        persona: `Experienced full-stack developer with a passion for creating elegant solutions. [${SEED_ID}]`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
    
    await client.send(summaryCommand);
    success(`Created Summary: ${summaryId}`);
    
    // Update Resume with Summary ID
    info('Updating Resume with Summary ID...');
    const resumeUpdateCommand = new PutCommand({
      TableName: 'Resume',
      Item: {
        id: resumeId,
        title: `Full Stack Developer Resume [${SEED_ID}]`,
        summaryId: summaryId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
    
    await client.send(resumeUpdateCommand);
    success('Updated Resume with Summary ID');
    
    // Create ContactInformation
    info('Creating ContactInformation...');
    const contactId = crypto.randomUUID();
    const contactCommand = new PutCommand({
      TableName: 'ContactInformation',
      Item: {
        id: contactId,
        name: `John Doe [${SEED_ID}]`,
        email: 'john.doe@example.com',
        phone: '(555) 123-4567',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
    
    await client.send(contactCommand);
    success(`Created ContactInformation: ${contactId}`);
    
    // Update Resume with ContactInformation ID
    info('Updating Resume with ContactInformation ID...');
    const resumeUpdateCommand2 = new PutCommand({
      TableName: 'Resume',
      Item: {
        id: resumeId,
        title: `Full Stack Developer Resume [${SEED_ID}]`,
        summaryId: summaryId,
        contactInformationId: contactId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
    
    await client.send(resumeUpdateCommand2);
    success('Updated Resume with ContactInformation ID');
    
    // Create References
    info('Creating References...');
    const referenceIds = [];
    
    const references = [
      { name: `Jane Smith [${SEED_ID}]`, email: 'jane.smith@example.com', phone: '(555) 234-5678' },
      { name: `Bob Johnson [${SEED_ID}]`, email: 'bob.johnson@example.com', phone: '(555) 345-6789' },
      { name: `Alice Williams [${SEED_ID}]`, email: 'alice.williams@example.com', phone: '(555) 456-7890' }
    ];
    
    for (const ref of references) {
      const refId = crypto.randomUUID();
      const refCommand = new PutCommand({
        TableName: 'Reference',
        Item: {
          id: refId,
          name: ref.name,
          email: ref.email,
          phone: ref.phone,
          contactInformationId: contactId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
      
      await client.send(refCommand);
      success(`Created Reference: ${refId}`);
      referenceIds.push(refId);
    }
    
    // Create Education
    info('Creating Education...');
    const educationId = crypto.randomUUID();
    const educationCommand = new PutCommand({
      TableName: 'Education',
      Item: {
        id: educationId,
        summary: `Bachelor's and Master's degrees in Computer Science. [${SEED_ID}]`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
    
    await client.send(educationCommand);
    success(`Created Education: ${educationId}`);
    
    // Update Resume with Education ID
    info('Updating Resume with Education ID...');
    const resumeUpdateCommand3 = new PutCommand({
      TableName: 'Resume',
      Item: {
        id: resumeId,
        title: `Full Stack Developer Resume [${SEED_ID}]`,
        summaryId: summaryId,
        contactInformationId: contactId,
        educationId: educationId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
    
    await client.send(resumeUpdateCommand3);
    success('Updated Resume with Education ID');
    
    // Create Schools
    info('Creating Schools...');
    const schoolIds = [];
    
    const schools = [
      { name: `University of Technology [${SEED_ID}]` },
      { name: `State College [${SEED_ID}]` }
    ];
    
    for (const school of schools) {
      const schoolId = crypto.randomUUID();
      const schoolCommand = new PutCommand({
        TableName: 'School',
        Item: {
          id: schoolId,
          name: school.name,
          educationId: educationId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
      
      await client.send(schoolCommand);
      success(`Created School: ${schoolId}`);
      schoolIds.push(schoolId);
    }
    
    // Create Degrees
    info('Creating Degrees...');
    const degreeIds = [];
    
    const degrees = [
      { major: `Computer Science [${SEED_ID}]`, startYear: '2010', endYear: '2014', schoolId: schoolIds[0] },
      { major: `Software Engineering [${SEED_ID}]`, startYear: '2014', endYear: '2016', schoolId: schoolIds[0] },
      { major: `Artificial Intelligence [${SEED_ID}]`, startYear: '2016', endYear: '2018', schoolId: schoolIds[1] }
    ];
    
    for (const degree of degrees) {
      const degreeId = crypto.randomUUID();
      const degreeCommand = new PutCommand({
        TableName: 'Degree',
        Item: {
          id: degreeId,
          major: degree.major,
          startYear: degree.startYear,
          endYear: degree.endYear,
          schoolId: degree.schoolId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
      
      await client.send(degreeCommand);
      success(`Created Degree: ${degreeId}`);
      degreeIds.push(degreeId);
    }
    
    // Create Experience
    info('Creating Experience...');
    const experienceId = crypto.randomUUID();
    const experienceCommand = new PutCommand({
      TableName: 'Experience',
      Item: {
        id: experienceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
    
    await client.send(experienceCommand);
    success(`Created Experience: ${experienceId}`);
    
    // Update Resume with Experience ID
    info('Updating Resume with Experience ID...');
    const resumeUpdateCommand4 = new PutCommand({
      TableName: 'Resume',
      Item: {
        id: resumeId,
        title: `Full Stack Developer Resume [${SEED_ID}]`,
        summaryId: summaryId,
        contactInformationId: contactId,
        educationId: educationId,
        experienceId: experienceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
    
    await client.send(resumeUpdateCommand4);
    success('Updated Resume with Experience ID');
    
    // Create Positions
    info('Creating Positions...');
    const positionIds = [];
    
    const positions = [
      { title: `Senior Developer [${SEED_ID}]`, company: 'Tech Solutions Inc.', startDate: '2014-01', endDate: '2016-06' },
      { title: `Lead Engineer [${SEED_ID}]`, company: 'Innovative Systems', startDate: '2016-07', endDate: '2018-12' },
      { title: `Software Architect [${SEED_ID}]`, company: 'Enterprise Solutions', startDate: '2019-01', endDate: '2021-06' },
      { title: `CTO [${SEED_ID}]`, company: 'Startup Ventures', startDate: '2021-07', endDate: 'Present' }
    ];
    
    for (const position of positions) {
      const positionId = crypto.randomUUID();
      const positionCommand = new PutCommand({
        TableName: 'Position',
        Item: {
          id: positionId,
          title: position.title,
          company: position.company,
          startDate: position.startDate,
          endDate: position.endDate,
          experienceId: experienceId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
      
      await client.send(positionCommand);
      success(`Created Position: ${positionId}`);
      positionIds.push(positionId);
    }
    
    // Create Skills
    info('Creating Skills...');
    const skillIds = [];
    
    const skills = [
      { title: `JavaScript [${SEED_ID}]`, link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
      { title: `TypeScript [${SEED_ID}]`, link: 'https://www.typescriptlang.org/' },
      { title: `React [${SEED_ID}]`, link: 'https://reactjs.org/' },
      { title: `Node.js [${SEED_ID}]`, link: 'https://nodejs.org/' },
      { title: `AWS [${SEED_ID}]`, link: 'https://aws.amazon.com/' }
    ];
    
    for (const skill of skills) {
      const skillId = crypto.randomUUID();
      const skillCommand = new PutCommand({
        TableName: 'Skill',
        Item: {
          id: skillId,
          title: skill.title,
          link: skill.link,
          resumeId: resumeId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
      
      await client.send(skillCommand);
      success(`Created Skill: ${skillId}`);
      skillIds.push(skillId);
    }
    
    success('Data seeding completed successfully');
    return true;
  } catch (err) {
    error(`Failed to seed data: ${err.message}`);
    return false;
  }
}

// Main function
async function main() {
  log(`\n=== DynamoDB Direct Seeding ===`);
  log(`Seed ID: ${SEED_ID}`);
  
  // Initialize DynamoDB client
  const client = initializeDynamoDBClient();
  
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
    error(`Script failed: ${err.message}`);
    process.exit(1);
  });
}

// Export functions for use in other scripts
module.exports = {
  cleanupExistingData,
  seedData
};
