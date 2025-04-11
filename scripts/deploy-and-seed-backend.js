#!/usr/bin/env node

/**
 * Deploy and Seed Backend Script
 *
 * This script deploys the Amplify Gen 2 backend and seeds it with mock data.
 * It creates 3-5 related records in the document hierarchy.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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

// Function to execute shell commands
function runCommand(command, options = {}) {
  const { silent = false, ignoreError = false } = options;

  try {
    if (!silent) {
      info(`Executing: ${command}`);
    }

    const output = execSync(command, {
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit'
    });

    return { success: true, output };
  } catch (err) {
    if (!ignoreError) {
      error(`Command failed: ${command}`);
      error(err.message);
    }

    return { success: false, error: err, output: err.stdout };
  }
}

// Function to deploy the backend
async function deployBackend() {
  log('\n=== Deploying Amplify Gen 2 Backend ===');

  // Set AWS profile
  process.env.AWS_PROFILE = 'AmplifyUser';

  // Unset AWS credentials if they exist
  delete process.env.AWS_ACCESS_KEY_ID;
  delete process.env.AWS_SECRET_ACCESS_KEY;
  delete process.env.AWS_SESSION_TOKEN;

  // Check if we need to initialize the backend first
  const checkResult = runCommand('ls -la amplify/data/resource.ts', { silent: true, ignoreError: true });

  if (!checkResult.success) {
    warning('Backend resource file not found. The backend may not be initialized.');
    return false;
  }

  // Deploy the backend
  info('Deploying backend with ampx deploy...');
  const result = runCommand('npx ampx deploy --profile AmplifyUser');

  if (result.success) {
    success('Backend deployed successfully');

    // Wait a moment for the deployment to complete
    info('Waiting for deployment to complete...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    return true;
  } else {
    error('Failed to deploy backend');

    // Try to start the sandbox instead
    warning('Trying to start the sandbox instead...');
    const sandboxResult = runCommand('npm run sandbox');

    if (sandboxResult.success) {
      success('Sandbox started successfully');
      return true;
    } else {
      error('Failed to start sandbox');
      return false;
    }
  }
}

// Function to generate mock data
function generateMockData() {
  log('\n=== Generating Mock Data ===');

  // Generate unique IDs for all entities
  const summaryId = uuidv4();
  const contactInformationId = uuidv4();
  const educationId = uuidv4();
  const experienceId = uuidv4();
  const resumeId = uuidv4();

  // Generate reference IDs
  const referenceIds = [uuidv4(), uuidv4(), uuidv4()];

  // Generate school IDs
  const schoolIds = [uuidv4(), uuidv4()];

  // Generate degree IDs
  const degreeIds = [uuidv4(), uuidv4(), uuidv4()];

  // Generate position IDs
  const positionIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4()];

  // Generate skill IDs
  const skillIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4()];

  // Create mock data
  const mockData = {
    // Summary
    summary: {
      id: summaryId,
      goals: "To drive innovation by blending cutting-edge technology with creative design.",
      persona: "A versatile, team-oriented leader with a strong balance of creative vision and technical proficiency.",
      url: "https://example.com",
      headshot: "https://example.com/headshot.jpg",
      gptResponse: "Experienced full stack developer with a passion for creating elegant solutions to complex problems.",
      resume: resumeId
    },

    // Contact Information
    contactInformation: {
      id: contactInformationId,
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "555-123-4567",
      resume: resumeId
    },

    // References
    references: [
      {
        id: referenceIds[0],
        name: "Jane Smith",
        phone: "555-987-6543",
        email: "jane.smith@example.com",
        contactInformationId: contactInformationId
      },
      {
        id: referenceIds[1],
        name: "Bob Johnson",
        phone: "555-567-8901",
        email: "bob.johnson@example.com",
        contactInformationId: contactInformationId
      },
      {
        id: referenceIds[2],
        name: "Alice Williams",
        phone: "555-234-5678",
        email: "alice.williams@example.com",
        contactInformationId: contactInformationId
      }
    ],

    // Education
    education: {
      id: educationId,
      summary: "Bachelor's and Master's degrees in Computer Science with a focus on software engineering.",
      resume: resumeId
    },

    // Schools
    schools: [
      {
        id: schoolIds[0],
        name: "University of Technology",
        educationId: educationId
      },
      {
        id: schoolIds[1],
        name: "State College",
        educationId: educationId
      }
    ],

    // Degrees
    degrees: [
      {
        id: degreeIds[0],
        major: "Computer Science",
        startYear: "2010",
        endYear: "2014",
        schoolId: schoolIds[0]
      },
      {
        id: degreeIds[1],
        major: "Software Engineering",
        startYear: "2014",
        endYear: "2016",
        schoolId: schoolIds[1]
      },
      {
        id: degreeIds[2],
        major: "Artificial Intelligence",
        startYear: "2016",
        endYear: "2018",
        schoolId: schoolIds[0]
      }
    ],

    // Experience
    experience: {
      id: experienceId
    },

    // Positions
    positions: [
      {
        id: positionIds[0],
        title: "Senior Developer",
        company: "Tech Solutions Inc.",
        startDate: "2016",
        endDate: "2018",
        experienceId: experienceId
      },
      {
        id: positionIds[1],
        title: "Lead Engineer",
        company: "Innovative Systems",
        startDate: "2018",
        endDate: "2020",
        experienceId: experienceId
      },
      {
        id: positionIds[2],
        title: "Software Architect",
        company: "Enterprise Solutions",
        startDate: "2020",
        endDate: "2022",
        experienceId: experienceId
      },
      {
        id: positionIds[3],
        title: "CTO",
        company: "Tech Startup",
        startDate: "2022",
        endDate: "Present",
        experienceId: experienceId
      }
    ],

    // Resume
    resume: {
      id: resumeId,
      title: "Full Stack Developer Resume",
      summaryId: summaryId,
      contactInformationId: contactInformationId,
      educationId: educationId,
      experienceId: experienceId
    },

    // Skills
    skills: [
      {
        id: skillIds[0],
        title: "JavaScript",
        link: "https://example.com/javascript",
        resumeId: resumeId
      },
      {
        id: skillIds[1],
        title: "TypeScript",
        link: "https://example.com/typescript",
        resumeId: resumeId
      },
      {
        id: skillIds[2],
        title: "React",
        link: "https://example.com/react",
        resumeId: resumeId
      },
      {
        id: skillIds[3],
        title: "Node.js",
        link: "https://example.com/nodejs",
        resumeId: resumeId
      },
      {
        id: skillIds[4],
        title: "AWS",
        link: "https://example.com/aws",
        resumeId: resumeId
      }
    ]
  };

  success('Mock data generated successfully');
  return mockData;
}

// Function to generate GraphQL mutations for seeding data
function generateGraphQLMutations(mockData) {
  log('\n=== Generating GraphQL Mutations ===');

  const mutations = [];

  // Summary mutation
  mutations.push(`
mutation CreateSummary {
  createSummary(input: {
    id: "${mockData.summary.id}"
    goals: "${mockData.summary.goals}"
    persona: "${mockData.summary.persona}"
    url: "${mockData.summary.url}"
    headshot: "${mockData.summary.headshot}"
    gptResponse: "${mockData.summary.gptResponse}"
    resume: "${mockData.summary.resume}"
  }) {
    id
  }
}
  `);

  // Contact Information mutation
  mutations.push(`
mutation CreateContactInformation {
  createContactInformation(input: {
    id: "${mockData.contactInformation.id}"
    name: "${mockData.contactInformation.name}"
    email: "${mockData.contactInformation.email}"
    phone: "${mockData.contactInformation.phone}"
    resume: "${mockData.contactInformation.resume}"
  }) {
    id
  }
}
  `);

  // References mutations
  mockData.references.forEach(reference => {
    mutations.push(`
mutation CreateReference${reference.id.substring(0, 8)} {
  createReference(input: {
    id: "${reference.id}"
    name: "${reference.name}"
    phone: "${reference.phone}"
    email: "${reference.email}"
    contactInformationId: "${reference.contactInformationId}"
  }) {
    id
  }
}
    `);
  });

  // Education mutation
  mutations.push(`
mutation CreateEducation {
  createEducation(input: {
    id: "${mockData.education.id}"
    summary: "${mockData.education.summary}"
    resume: "${mockData.education.resume}"
  }) {
    id
  }
}
  `);

  // Schools mutations
  mockData.schools.forEach(school => {
    mutations.push(`
mutation CreateSchool${school.id.substring(0, 8)} {
  createSchool(input: {
    id: "${school.id}"
    name: "${school.name}"
    educationId: "${school.educationId}"
  }) {
    id
  }
}
    `);
  });

  // Degrees mutations
  mockData.degrees.forEach(degree => {
    mutations.push(`
mutation CreateDegree${degree.id.substring(0, 8)} {
  createDegree(input: {
    id: "${degree.id}"
    major: "${degree.major}"
    startYear: "${degree.startYear}"
    endYear: "${degree.endYear}"
    schoolId: "${degree.schoolId}"
  }) {
    id
  }
}
    `);
  });

  // Experience mutation
  mutations.push(`
mutation CreateExperience {
  createExperience(input: {
    id: "${mockData.experience.id}"
  }) {
    id
  }
}
  `);

  // Positions mutations
  mockData.positions.forEach(position => {
    mutations.push(`
mutation CreatePosition${position.id.substring(0, 8)} {
  createPosition(input: {
    id: "${position.id}"
    title: "${position.title}"
    company: "${position.company}"
    startDate: "${position.startDate}"
    endDate: "${position.endDate}"
    experienceId: "${position.experienceId}"
  }) {
    id
  }
}
    `);
  });

  // Resume mutation
  mutations.push(`
mutation CreateResume {
  createResume(input: {
    id: "${mockData.resume.id}"
    title: "${mockData.resume.title}"
    summaryId: "${mockData.resume.summaryId}"
    contactInformationId: "${mockData.resume.contactInformationId}"
    educationId: "${mockData.resume.educationId}"
    experienceId: "${mockData.resume.experienceId}"
  }) {
    id
  }
}
  `);

  // Skills mutations
  mockData.skills.forEach(skill => {
    mutations.push(`
mutation CreateSkill${skill.id.substring(0, 8)} {
  createSkill(input: {
    id: "${skill.id}"
    title: "${skill.title}"
    link: "${skill.link}"
    resumeId: "${skill.resumeId}"
  }) {
    id
  }
}
    `);
  });

  success('GraphQL mutations generated successfully');
  return mutations;
}

// Function to save GraphQL mutations to a file
function saveMutationsToFile(mutations) {
  log('\n=== Saving GraphQL Mutations to File ===');

  // Create the mutations directory if it doesn't exist
  const mutationsDir = path.join(process.cwd(), 'scripts', 'mutations');
  if (!fs.existsSync(mutationsDir)) {
    fs.mkdirSync(mutationsDir, { recursive: true });
  }

  // Generate a timestamp for the file name
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(mutationsDir, `seed-mutations-${timestamp}.graphql`);

  // Write the mutations to the file
  fs.writeFileSync(filePath, mutations.join('\n\n'));

  success(`GraphQL mutations saved to ${filePath}`);
  return filePath;
}

// Function to execute GraphQL mutations
async function executeMutations(filePath) {
  log('\n=== Executing GraphQL Mutations ===');

  // Get the API endpoint and API key
  const amplifyOutputsPath = path.join(process.cwd(), 'amplify_outputs.json');

  if (!fs.existsSync(amplifyOutputsPath)) {
    warning('amplify_outputs.json file not found. The backend may not be deployed or sandbox not started.');
    info('To deploy the backend, run: npm run amplify:deploy:backend');
    info('To start the sandbox, run: npm run sandbox');

    // Try to start the sandbox
    warning('Trying to start the sandbox...');
    const sandboxResult = runCommand('npm run sandbox');

    if (sandboxResult.success) {
      success('Sandbox started successfully');

      // Wait a moment for the sandbox to start
      info('Waiting for sandbox to start...');
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Check if amplify_outputs.json exists now
      if (fs.existsSync(amplifyOutputsPath)) {
        info('amplify_outputs.json file found after starting sandbox');
      } else {
        error('amplify_outputs.json file still not found after starting sandbox');
        return false;
      }
    } else {
      error('Failed to start sandbox');
      return false;
    }
  }

  try {
    const amplifyOutputs = JSON.parse(fs.readFileSync(amplifyOutputsPath, 'utf8'));
    const apiUrl = amplifyOutputs.data?.url;
    const apiKey = amplifyOutputs.data?.api_key;

    if (!apiUrl || !apiKey) {
      warning('API URL or API key not found in amplify_outputs.json');
      info('The backend may not be deployed correctly or the sandbox not started.');
      info('To deploy the backend, run: npm run amplify:deploy:backend');
      info('To start the sandbox, run: npm run sandbox');
      return false;
    }

    // Read the mutations file
    const mutations = fs.readFileSync(filePath, 'utf8').split('\n\n');

    // Execute each mutation
    let successCount = 0;
    let failureCount = 0;

    for (const mutation of mutations) {
      if (!mutation.trim()) continue;

      info(`Executing mutation: ${mutation.split('\n')[1].trim()}`);

      // Create a temporary file for the mutation
      const tempFilePath = path.join(process.cwd(), 'scripts', 'temp-mutation.graphql');
      fs.writeFileSync(tempFilePath, mutation);

      // Execute the mutation using curl
      const curlCommand = `curl -X POST ${apiUrl} -H "Content-Type: application/json" -H "x-api-key: ${apiKey}" -d '{"query": ${JSON.stringify(mutation)}}'`;

      try {
        const result = execSync(curlCommand, { encoding: 'utf8' });
        const jsonResult = JSON.parse(result);

        if (jsonResult.errors) {
          warning(`Mutation failed: ${JSON.stringify(jsonResult.errors)}`);
          failureCount++;
        } else {
          success(`Mutation executed successfully`);
          successCount++;
        }
      } catch (err) {
        error(`Error executing mutation: ${err.message}`);
        failureCount++;
      }

      // Remove the temporary file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }

    if (successCount > 0) {
      success(`${successCount} mutations executed successfully`);
      if (failureCount > 0) {
        warning(`${failureCount} mutations failed`);
      }
      return true;
    } else {
      error('All mutations failed');
      return false;
    }
  } catch (err) {
    error(`Error parsing amplify_outputs.json: ${err.message}`);
    return false;
  }
}

// Function to seed data using the Amplify CLI
async function seedData() {
  log('\n=== Seeding Data ===');

  // Generate mock data
  const mockData = generateMockData();

  // Generate GraphQL mutations
  const mutations = generateGraphQLMutations(mockData);

  // Save mutations to a file
  const filePath = saveMutationsToFile(mutations);

  // Execute mutations
  const success = await executeMutations(filePath);

  return success;
}

// Main function
async function main() {
  log('\n=== Deploy and Seed Backend ===');

  // Deploy the backend
  const deploySuccess = await deployBackend();

  if (!deploySuccess) {
    error('Failed to deploy backend. Cannot seed data.');
    return false;
  }

  // Seed data
  const seedSuccess = await seedData();

  if (!seedSuccess) {
    error('Failed to seed data.');
    return false;
  }

  success('Backend deployed and seeded successfully');
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
  deployBackend,
  seedData
};
