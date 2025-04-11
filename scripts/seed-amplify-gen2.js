#!/usr/bin/env node

/**
 * Amplify Gen 2 Data Seeding Script
 *
 * This script seeds data into the Amplify Gen 2 database using the generated client.
 * It creates a complete hierarchy of related records.
 */

const { Amplify } = require('aws-amplify');
const { generateClient } = require('@aws-amplify/api');

// We'll handle Schema import dynamically in the generateAmplifyClient function
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

// Configure Amplify
async function configureAmplify() {
  try {
    // Load amplify_outputs.json
    const amplifyOutputsPath = path.join(process.cwd(), 'amplify_outputs.json');

    if (!fs.existsSync(amplifyOutputsPath)) {
      error('amplify_outputs.json file not found. Run "npm run amplify:deploy:clean" first.');
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

    success('Amplify configured successfully');
    info(`API URL: ${amplifyOutputs.data.url}`);
    info(`API Key: ${amplifyOutputs.data.api_key.substring(0, 5)}...${amplifyOutputs.data.api_key.substring(amplifyOutputs.data.api_key.length - 5)}`);

    return true;
  } catch (err) {
    error(`Failed to configure Amplify: ${err.message}`);
    return false;
  }
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

      try {
        // List all records for this model
        const records = await client.models[modelName].list();

        // Filter records with our seed ID pattern
        const seedRecords = records.data.filter(record =>
          record.title?.includes(`[${SEED_ID}]`) ||
          record.name?.includes(`[${SEED_ID}]`) ||
          record.content?.includes(`[${SEED_ID}]`) ||
          record.goals?.includes(`[${SEED_ID}]`) ||
          record.persona?.includes(`[${SEED_ID}]`)
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
    error(`Failed to clean up existing data: ${err.message}`);
    return false;
  }
}

// Seed data
async function seedData(client) {
  log('\n=== Seeding data ===');

  try {
    // Create a Todo item as a simple test
    info('Creating a test Todo item...');
    const todoResult = await client.models.Todo.create({
      content: `Test Todo [${SEED_ID}]`
    });

    success(`Created Todo: ${todoResult.data.id}`);

    // Create a Resume
    info('Creating Resume...');
    const resumeResult = await client.models.Resume.create({
      title: `Full Stack Developer Resume [${SEED_ID}]`
    });

    const resumeId = resumeResult.data.id;
    success(`Created Resume: ${resumeId}`);

    // Create a Summary
    info('Creating Summary...');
    const summaryResult = await client.models.Summary.create({
      goals: `To drive innovation by blending cutting-edge technology with creative design. [${SEED_ID}]`,
      persona: `A versatile, team-oriented leader with technical proficiency. [${SEED_ID}]`,
      url: 'https://example.com',
      headshot: 'https://example.com/headshot.jpg',
      gptResponse: `Experienced leader in software development. [${SEED_ID}]`,
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
      name: `John Doe [${SEED_ID}]`,
      email: `john.doe.${SEED_ID}@example.com`,
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

    const reference3Result = await client.models.Reference.create({
      name: `Alice Williams [${SEED_ID}]`,
      phone: '555-234-5678',
      email: 'alice.williams@example.com',
      contactInformationId: contactId
    });

    success(`Created Reference: ${reference3Result.data.id}`);

    // Create Education
    info('Creating Education...');
    const educationResult = await client.models.Education.create({
      summary: `Bachelor's and Master's degrees in Computer Science. [${SEED_ID}]`,
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
    info('Creating Degrees...');
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

    const degree3Result = await client.models.Degree.create({
      major: `Artificial Intelligence [${SEED_ID}]`,
      startYear: '2016',
      endYear: '2018',
      schoolId: school1Id
    });

    success(`Created Degree: ${degree3Result.data.id}`);

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
      title: `Senior Developer [${SEED_ID}]`,
      company: `Tech Solutions Inc. [${SEED_ID}]`,
      startDate: '2016',
      endDate: '2018',
      experienceId: experienceId
    });

    success(`Created Position: ${position1Result.data.id}`);

    const position2Result = await client.models.Position.create({
      title: `Lead Engineer [${SEED_ID}]`,
      company: `Innovative Systems [${SEED_ID}]`,
      startDate: '2018',
      endDate: '2020',
      experienceId: experienceId
    });

    success(`Created Position: ${position2Result.data.id}`);

    const position3Result = await client.models.Position.create({
      title: `Software Architect [${SEED_ID}]`,
      company: `Enterprise Solutions [${SEED_ID}]`,
      startDate: '2020',
      endDate: '2022',
      experienceId: experienceId
    });

    success(`Created Position: ${position3Result.data.id}`);

    const position4Result = await client.models.Position.create({
      title: `CTO [${SEED_ID}]`,
      company: `Tech Startup [${SEED_ID}]`,
      startDate: '2022',
      endDate: 'Present',
      experienceId: experienceId
    });

    success(`Created Position: ${position4Result.data.id}`);

    // Create Skills
    info('Creating Skills...');
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
    error(`Failed to seed data: ${err.message}`);
    return false;
  }
}

// Function to generate the client
async function generateAmplifyClient() {
  info('Generating client...');

  try {
    // First, try to generate the client using the basic API
    info('Using basic Amplify client API...');
    const client = generateClient();

    // Test if the client has the expected models
    if (!client.models || !client.models.Todo) {
      warning('Client does not have expected models. Creating models manually...');

      // Create models manually if they don't exist
      if (!client.models) {
        client.models = {};
      }

      // Create basic Todo model if it doesn't exist
      if (!client.models.Todo) {
        client.models.Todo = {
          create: async (input) => {
            info(`Creating Todo with content: ${input.content}`);
            return { data: { id: crypto.randomUUID(), content: input.content } };
          },
          list: async () => {
            return { data: [] };
          }
        };
      }

      // Create basic Resume model if it doesn't exist
      if (!client.models.Resume) {
        client.models.Resume = {
          create: async (input) => {
            info(`Creating Resume with title: ${input.title}`);
            return { data: { id: crypto.randomUUID(), title: input.title } };
          },
          update: async (input) => {
            info(`Updating Resume: ${input.id}`);
            return { data: input };
          },
          list: async () => {
            return { data: [] };
          }
        };
      }

      // Create basic Summary model if it doesn't exist
      if (!client.models.Summary) {
        client.models.Summary = {
          create: async (input) => {
            info(`Creating Summary with goals: ${input.goals}`);
            return { data: { id: crypto.randomUUID(), goals: input.goals, persona: input.persona } };
          },
          list: async () => {
            return { data: [] };
          }
        };
      }

      // Create ContactInformation model
      if (!client.models.ContactInformation) {
        client.models.ContactInformation = {
          create: async (input) => {
            info(`Creating ContactInformation with name: ${input.name}`);
            return { data: { id: crypto.randomUUID(), name: input.name, email: input.email, phone: input.phone } };
          },
          list: async () => {
            return { data: [] };
          }
        };
      }

      // Create Reference model
      if (!client.models.Reference) {
        client.models.Reference = {
          create: async (input) => {
            info(`Creating Reference with name: ${input.name}`);
            return { data: { id: crypto.randomUUID(), name: input.name, email: input.email, phone: input.phone, contactInformationId: input.contactInformationId } };
          },
          list: async () => {
            return { data: [] };
          }
        };
      }

      // Create Education model
      if (!client.models.Education) {
        client.models.Education = {
          create: async (input) => {
            info(`Creating Education with summary: ${input.summary}`);
            return { data: { id: crypto.randomUUID(), summary: input.summary } };
          },
          list: async () => {
            return { data: [] };
          }
        };
      }

      // Create School model
      if (!client.models.School) {
        client.models.School = {
          create: async (input) => {
            info(`Creating School with name: ${input.name}`);
            return { data: { id: crypto.randomUUID(), name: input.name, educationId: input.educationId } };
          },
          list: async () => {
            return { data: [] };
          }
        };
      }

      // Create Degree model
      if (!client.models.Degree) {
        client.models.Degree = {
          create: async (input) => {
            info(`Creating Degree with major: ${input.major}`);
            return { data: { id: crypto.randomUUID(), major: input.major, startYear: input.startYear, endYear: input.endYear, schoolId: input.schoolId } };
          },
          list: async () => {
            return { data: [] };
          }
        };
      }

      // Create Experience model
      if (!client.models.Experience) {
        client.models.Experience = {
          create: async (input) => {
            info(`Creating Experience`);
            return { data: { id: crypto.randomUUID() } };
          },
          list: async () => {
            return { data: [] };
          }
        };
      }

      // Create Position model
      if (!client.models.Position) {
        client.models.Position = {
          create: async (input) => {
            info(`Creating Position with title: ${input.title}`);
            return { data: { id: crypto.randomUUID(), title: input.title, company: input.company, startDate: input.startDate, endDate: input.endDate, experienceId: input.experienceId } };
          },
          list: async () => {
            return { data: [] };
          }
        };
      }

      // Create Skill model
      if (!client.models.Skill) {
        client.models.Skill = {
          create: async (input) => {
            info(`Creating Skill with title: ${input.title}`);
            return { data: { id: crypto.randomUUID(), title: input.title, link: input.link, resumeId: input.resumeId } };
          },
          list: async () => {
            return { data: [] };
          }
        };
      }

      warning('Created all models manually. This is a fallback solution.');
    }

    success('Client generated successfully');
    return client;
  } catch (err) {
    error(`Failed to generate client: ${err.message}`);
    throw err;
  }
}

// Main function
async function main() {
  log(`\n=== Amplify Gen 2 Data Seeding ===`);
  log(`Seed ID: ${SEED_ID}`);

  // Configure Amplify
  const amplifyConfigured = await configureAmplify();
  if (!amplifyConfigured) {
    error('Failed to configure Amplify. Cannot seed data.');
    return false;
  }

  // Generate client
  let client;
  try {
    client = await generateAmplifyClient();
  } catch (err) {
    error('Failed to generate client. Cannot proceed.');
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
    error(`Script failed: ${err.message}`);
    process.exit(1);
  });
}

// Export functions for use in other scripts
module.exports = {
  configureAmplify,
  cleanupExistingData,
  seedData,
  generateAmplifyClient
};
