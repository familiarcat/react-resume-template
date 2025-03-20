#!/usr/bin/env node
/**
 * seedData.js
 *
 * This script seeds data for all Amplify Gen 2 models by reading a single JSON file
 * from the 'resumes' folder (brady_resume.json). It will create any missing DynamoDB
 * tables automatically and insert default values (empty strings) for any missing properties.
 */
import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  DeleteTableCommand
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Add credential debugging
async function checkCredentials() {
  // Clear any existing AWS credentials from environment
  delete process.env.AWS_ACCESS_KEY_ID;
  delete process.env.AWS_SECRET_ACCESS_KEY;
  delete process.env.AWS_SESSION_TOKEN;
  
  // Force default profile
  process.env.AWS_PROFILE = 'default';
  
  console.log('\nChecking AWS credentials...');
  console.log('-------------------------');
  console.log('Forced AWS Profile: default');
  console.log('AWS_PROFILE:', process.env.AWS_PROFILE);
  console.log('AWS_REGION:', process.env.AWS_REGION || 'us-east-2');
  console.log('UNIQUE_ID:', process.env.UNIQUE_ID || 'defaultUniqueId');
  console.log('-------------------------\n');
}

// Initialize DynamoDB client with explicit credentials
const initializeDynamoDBClient = () => {
  // Use AWS SDK's default credential provider chain instead of explicit credentials
  const config = {
    region: process.env.AWS_REGION || 'us-east-2'
  };
  
  const client = new DynamoDBClient(config);
  return DynamoDBDocumentClient.from(client);
};

const UNIQUE_ID = process.env.UNIQUE_ID || "defaultUniqueId";
const documentClient = initializeDynamoDBClient();

// Base table configuration
const baseTableConfig = {
  BillingMode: "PAY_PER_REQUEST",
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "S" }
  ],
  KeySchema: [
    { AttributeName: "id", KeyType: "HASH" }
  ]
};

/** 
 * Define the data models and their seeding functions.
 * Each model object includes the model name, the key field, and a function to
 * extract the seeding data from the seed JSON.
 * @type {Array<{name: string, keyField: string, seedFn: Function}>}
 */
export const models = [
  { name: "Resume", keyField: "id", seedFn: (resume) => ({
    title: resume.title,
    summaryId: resume.summaryId,
    contactInformationId: resume.contactInformationId,
    educationId: resume.educationId,
    experienceId: resume.experienceId
  })},
  { name: "Summary", keyField: "id", seedFn: (summary) => ({
    goals: summary.summary?.goals || "",
    persona: summary.summary?.persona || "",
    url: summary.summary?.url || "",
    headshot: summary.summary?.headshot || "",
    gptResponse: summary.summary?.gptResponse || "",
    resume: summary.summary?.resume || ""
  })},
  { name: "ContactInformation", keyField: "id", seedFn: (contact) => ({
    name: contact.contactInformation?.name || "",
    email: contact.contactInformation?.email || "",
    phone: contact.contactInformation?.phone || "",
    resume: contact.contactInformation?.resume || ""
  })},
  { name: "Reference", keyField: "id", seedFn: (reference) => ({
    name: reference.name || "",
    phone: reference.phone || "",
    email: reference.email || "",
    contactInformationId: reference.contactInformationId || ""
  })},
  { name: "Education", keyField: "id", seedFn: (education) => ({
    summary: education.education.summary || "",
    resume: education.education.resume || ""
  })},
  { name: "School", keyField: "id", seedFn: (school) => ({
    name: school.name || "",
    educationId: school.educationId || ""
  })},
  { name: "Degree", keyField: "id", seedFn: (degree) => ({
    major: degree.major || "",
    startYear: degree.startYear || "",
    endYear: degree.endYear || "",
    schoolId: degree.schoolId || ""
  })},
  { name: "Experience", keyField: "id", seedFn: (experience) => ({
    title: experience.experience.title || "",
    text: experience.experience.text || "",
    gptResponse: experience.experience.gptResponse || "",
    resume: experience.experience.resume || ""
  })},
  { name: "Company", keyField: "id", seedFn: (company) => ({
    name: company.name || "",
    role: company.role || "",
    startDate: company.startDate || "",
    endDate: company.endDate || "",
    title: company.title || "",
    gptResponse: company.gptResponse || "",
    experienceId: company.experienceId || ""
  })},
  { name: "Engagement", keyField: "id", seedFn: (engagement) => ({
    client: engagement.client || "",
    startDate: engagement.startDate || "",
    endDate: engagement.endDate || "",
    gptResponse: engagement.gptResponse || "",
    companyId: engagement.companyId || ""
  })},
  { name: "Accomplishment", keyField: "id", seedFn: (accomplishment) => ({
    title: accomplishment.title || "",
    description: accomplishment.description || "",
    link: accomplishment.link || "",
    companyId: accomplishment.companyId || "",
    engagementId: accomplishment.engagementId || ""
  })},
  { name: "Skill", keyField: "id", seedFn: (skill) => ({
    title: skill.title || "",
    link: skill.link || "",
    resumeId: skill.resumeId || "",
    companyId: skill.companyId || "",
    accomplishmentId: skill.accomplishmentId || ""
  })}
];

/**
 * Deletes a table if it exists and waits for deletion to complete
 * @param {string} tableName
 * @returns {Promise<void>}
 */
async function deleteTableIfExists(tableName) {
  try {
    console.log(`Attempting to delete existing table: ${tableName}`);
    const deleteCommand = new DeleteTableCommand({ TableName: tableName });
    await documentClient.send(deleteCommand);
    
    // Wait for table deletion
    const maxWaitTime = 60000;
    const startTime = Date.now();
    
    while (true) {
      try {
        const describeCommand = new DescribeTableCommand({ TableName: tableName });
        await documentClient.send(describeCommand);
        
        if (Date.now() - startTime > maxWaitTime) {
          throw new Error('Table deletion timeout');
        }
        
        console.log(`Waiting for table ${tableName} to be deleted...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        if (error.name === 'ResourceNotFoundException') {
          console.log(`Table ${tableName} has been deleted`);
          return;
        }
        throw error;
      }
    }
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      console.log(`Table ${tableName} does not exist, proceeding with creation`);
      return;
    }
    throw error;
  }
}

/**
 * Creates a new DynamoDB table for the given model, deleting any existing table first.
 * @param {string} modelName
 * @param {string} uniqueId
 * @returns {Promise<string|null>} The table name if created/found, otherwise null.
 */
async function createTableForModel(modelName, uniqueId) {
  const tableName = `${modelName}-${uniqueId}`;
  
  try {
    // Delete existing table first
    await deleteTableIfExists(tableName);
    
    console.log(`Creating new table: ${tableName}`);
    
    const createCommand = new CreateTableCommand({
      TableName: tableName,
      ...baseTableConfig
    });
    
    await documentClient.send(createCommand);
    console.log(`Table creation initiated for: ${tableName}`);

    // Wait for table to become active
    const maxWaitTime = 60000;
    const startTime = Date.now();
    
    while (true) {
      try {
        const describeCommand = new DescribeTableCommand({ TableName: tableName });
        const response = await documentClient.send(describeCommand);
        
        if (response.Table.TableStatus === 'ACTIVE') {
          console.log(`Table ${tableName} is now active`);
          return tableName;
        }
        
        if (Date.now() - startTime > maxWaitTime) {
          throw new Error('Table creation timeout');
        }
        
        console.log(`Waiting for table ${tableName} to become active... Current status: ${response.Table.TableStatus}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (error) {
        if (error.name === 'ResourceNotFoundException') {
          console.log(`Table ${tableName} not ready yet, waiting...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }
        throw error;
      }
    }
  } catch (error) {
    console.error(`Error creating table ${tableName}:`, error);
    return null;
  }
}

/**
 * Finds or creates a table for a given model, ensuring a fresh table if it already exists.
 * @param {string} modelName
 * @param {string} uniqueId
 * @returns {Promise<string|null>} The table name if created, otherwise null.
 */
async function findTableForModel(modelName, uniqueId) {
  const tableName = `${modelName}-${uniqueId}`;
  
  try {
    // Check if table exists
    const describeCommand = new DescribeTableCommand({ TableName: tableName });
    try {
      await documentClient.send(describeCommand);
      console.log(`Table ${tableName} already exists, skipping creation`);
      return tableName;
    } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
        // Table doesn't exist, create it
        return await createTableForModel(modelName, uniqueId);
      }
      throw error;
    }
  } catch (error) {
    console.error("Error finding/creating table:", error);
    console.error("Full error details:", JSON.stringify(error, null, 2));
    return null;
  }
}

/**
 * Define unique identifier fields for each model type
 * @type {Object.<string, string[]>}
 */
const MODEL_UNIQUE_IDENTIFIERS = {
  'Resume': ['title'],
  'Summary': ['resume'],
  'ContactInformation': ['name', 'email'],
  'Reference': ['name', 'contactInformationId'],
  'Education': ['resume'],
  'School': ['name', 'educationId'],
  'Degree': ['major', 'schoolId'],
  'Experience': ['resume'],
  'Company': ['name', 'experienceId'],
  'Engagement': ['client', 'companyId'],
  'Accomplishment': ['title', 'companyId'],
  'Skill': ['title', 'resumeId']
};

/**
 * Checks if a record already exists with the same content based on model-specific unique identifiers
 * @param {string} tableName
 * @param {Object} record
 * @returns {Promise<boolean>}
 */
async function isRecordDuplicate(tableName, record) {
  try {
    // Extract model name from table name (e.g., "Resume-defaultUniqueId" -> "Resume")
    const modelName = tableName.split('-')[0];
    
    // Get unique identifier fields for this model
    const uniqueFields = MODEL_UNIQUE_IDENTIFIERS[modelName];
    if (!uniqueFields) {
      console.warn(`No unique identifiers defined for model ${modelName}, using all non-empty fields`);
      // Fallback to comparing all non-empty fields except id
      const relevantFields = Object.entries(record)
        .filter(([key, value]) => 
          key !== 'id' && 
          value !== undefined && 
          value !== null && 
          value !== ''
        );

      if (relevantFields.length === 0) return false;

      const scanCommand = new ScanCommand({
        TableName: tableName,
        FilterExpression: relevantFields
          .map(([key]) => `#${key} = :${key}`)
          .join(' AND '),
        ExpressionAttributeNames: relevantFields
          .reduce((acc, [key]) => ({ ...acc, [`#${key}`]: key }), {}),
        ExpressionAttributeValues: relevantFields
          .reduce((acc, [key, value]) => ({ ...acc, [`:${key}`]: value }), {})
      });

      const result = await documentClient.send(scanCommand);
      return result.Items && result.Items.length > 0;
    }

    // Check only the unique identifier fields
    const filterExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    for (const field of uniqueFields) {
      if (record[field] !== undefined && record[field] !== null && record[field] !== '') {
        filterExpressions.push(`#${field} = :${field}`);
        expressionAttributeNames[`#${field}`] = field;
        expressionAttributeValues[`:${field}`] = record[field];
      }
    }

    // If none of the unique identifier fields have values, return false
    if (filterExpressions.length === 0) {
      return false;
    }

    const scanCommand = new ScanCommand({
      TableName: tableName,
      FilterExpression: filterExpressions.join(' AND '),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    });

    const result = await documentClient.send(scanCommand);
    if (result.Items && result.Items.length > 0) {
      console.log(`Found duplicate ${modelName} record with matching unique identifiers:`, 
        uniqueFields.reduce((acc, field) => ({ ...acc, [field]: record[field] }), {}));
      return true;
    }
    return false;

  } catch (error) {
    console.error(`Error checking for duplicate record in ${tableName}:`, error);
    return false;
  }
}

/**
 * Builds update parameters for the UpdateCommand.
 * This version does not skip any attribute; if a property is missing or empty,
 * a default value (empty string) is used.
 */
function buildUpdateParams(tableName, keyField, record) {
  if (!record[keyField]) {
    record[keyField] = randomUUID();
    console.log(`Auto-generated ${keyField}: ${record[keyField]}`);
  }
  const key = { [keyField]: record[keyField] };
  const attributes = { ...record };
  delete attributes[keyField];
  const updateExprParts = [];
  const exprAttrValues = {};
  const exprAttrNames = {};

  // Always include every attribute. If missing or empty, assign a default empty string.
  for (const attr in attributes) {
    let value = attributes[attr];
    if (value === undefined || value === null || value === "") {
      value = "";
    }
    const attrPlaceholder = "#" + attr;
    const valuePlaceholder = ":" + attr;
    updateExprParts.push(`${attrPlaceholder} = ${valuePlaceholder}`);
    exprAttrNames[attrPlaceholder] = attr;
    exprAttrValues[valuePlaceholder] = value;
  }
  if (updateExprParts.length === 0) return null;
  const updateExpression = "set " + updateExprParts.join(", ");
  return {
    TableName: tableName,
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: exprAttrNames,
    ExpressionAttributeValues: exprAttrValues,
    ReturnValues: "ALL_NEW"
  };
}

/**
 * Upserts a record into the appropriate DynamoDB table.
 */
async function upsertRecord(modelName, keyField, record) {
  const tableName = await findTableForModel(modelName, UNIQUE_ID);
  if (!tableName) {
    console.error(`Skipping ${modelName} because no table was found or created.`);
    return;
  }

  // Check for duplicates before upserting
  if (await isRecordDuplicate(tableName, record)) {
    console.log(`Skipping duplicate ${modelName} record`);
    return;
  }

  const params = buildUpdateParams(tableName, keyField, record);
  if (!params) {
    console.warn(`Nothing to update for ${modelName} record with key ${record[keyField]}`);
    return;
  }

  try {
    const command = new UpdateCommand(params);
    const result = await documentClient.send(command);
    console.log(`Upserted ${modelName} record:`, JSON.stringify(result.Attributes, null, 2));
  } catch (err) {
    console.error(`Error upserting ${modelName} record:`, err);
  }
}

/**
 * Seeds data into DynamoDB tables from the provided seed file.
 */
async function seedData() {
  const filePath = join(__dirname, "resumes", "brady_resume.json");
  console.log('Looking for resume file at:', filePath);
  
  if (!existsSync(filePath)) {
    console.error("Seed file not found:", filePath);
    return;
  }
  
  let data;
  try {
    const content = readFileSync(filePath, "utf8");
    data = JSON.parse(content);
  } catch (error) {
    console.error("Error reading/parsing seed file:", error);
    return;
  }
  const resumeRecord = {
    title: data.title,
    summaryId: data.summaryId,
    contactInformationId: data.contactInformationId,
    educationId: data.educationId,
    experienceId: data.experienceId
  };
  await upsertRecord("Resume", "id", resumeRecord);
  if (data.summary) {
    const summaryRecord = {
      goals: data.summary.goals || "",
      persona: data.summary.persona || "",
      url: data.summary.url || "",
      headshot: data.summary.headshot || "",
      gptResponse: data.summary.gptResponse || "",
      resume: data.summary.resume || ""
    };
    await upsertRecord("Summary", "id", summaryRecord);
  }
  if (data.contactInformation) {
    const contactRecord = {
      name: data.contactInformation.name || "",
      email: data.contactInformation.email || "",
      phone: data.contactInformation.phone || "",
      resume: data.contactInformation.resume || ""
    };
    await upsertRecord("ContactInformation", "id", contactRecord);
    if (Array.isArray(data.contactInformation.references)) {
      for (const ref of data.contactInformation.references) {
        const refRecord = {
          name: ref.name || "",
          phone: ref.phone || "",
          email: ref.email || "",
          contactInformationId: ref.contactInformationId || ""
        };
        await upsertRecord("Reference", "id", refRecord);
      }
    }
  }
  if (data.education) {
    const educationRecord = {
      summary: data.education.summary || "",
      resume: data.education.resume || ""
    };
    await upsertRecord("Education", "id", educationRecord);
    if (Array.isArray(data.education.schools)) {
      for (const school of data.education.schools) {
        const schoolRecord = {
          name: school.name || "",
          educationId: school.educationId || ""
        };
        await upsertRecord("School", "id", schoolRecord);
        if (Array.isArray(school.degrees)) {
          for (const degree of school.degrees) {
            const degreeRecord = {
              major: degree.major || "",
              startYear: degree.startYear || "",
              endYear: degree.endYear || "",
              schoolId: degree.schoolId || ""
            };
            await upsertRecord("Degree", "id", degreeRecord);
          }
        }
      }
    }
  }
  if (data.experience) {
    const experienceRecord = {
      title: data.experience.title || "",
      text: data.experience.text || "",
      gptResponse: data.experience.gptResponse || "",
      resume: data.experience.resume || ""
    };
    await upsertRecord("Experience", "id", experienceRecord);
    if (Array.isArray(data.experience.companies)) {
      for (const company of data.experience.companies) {
        const companyRecord = {
          name: company.name || "",
          role: company.role || "",
          startDate: company.startDate || "",
          endDate: company.endDate || "",
          title: company.title || "",
          gptResponse: company.gptResponse || "",
          experienceId: company.experienceId || ""
        };
        await upsertRecord("Company", "id", companyRecord);
        if (Array.isArray(company.engagements)) {
          for (const engagement of company.engagements) {
            const engagementRecord = {
              client: engagement.client || "",
              startDate: engagement.startDate || "",
              endDate: engagement.endDate || "",
              gptResponse: engagement.gptResponse || "",
              companyId: engagement.companyId || ""
            };
            await upsertRecord("Engagement", "id", engagementRecord);
          }
        }
        if (Array.isArray(company.accomplishments)) {
          for (const accomplishment of company.accomplishments) {
            const accomplishmentRecord = {
              title: accomplishment.title || "",
              description: accomplishment.description || "",
              link: accomplishment.link || "",
              companyId: accomplishment.companyId || "",
              engagementId: accomplishment.engagementId || ""
            };
            await upsertRecord("Accomplishment", "id", accomplishmentRecord);
          }
        }
      }
    }
  }
  if (Array.isArray(data.skills)) {
    for (const skill of data.skills) {
      const skillRecord = {
        title: skill.title || "",
        link: skill.link || "",
        resumeId: skill.resumeId || "",
        companyId: skill.companyId || "",
        accomplishmentId: skill.accomplishmentId || ""
      };
      await upsertRecord("Skill", "id", skillRecord);
    }
  }
}

// Modify the main execution to include credential check
async function main() {
  await checkCredentials();
  await seedData();
}

main().catch(error => {
  console.error("Script failed:", error);
  process.exit(1);
});