#!/usr/bin/env node

/**
 * Amplify Gen 2 Data Sync Script
 * 
 * This script synchronizes data between local and production environments:
 * - Exports data from the source environment
 * - Imports data into the target environment
 * - Supports bidirectional sync (local to production and production to local)
 * - Preserves relationships between records
 */

const { generateClient } = require('@aws-amplify/api');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Amplify } = require('aws-amplify');
const { startSandbox, isSandboxRunning } = require('./amplify-sandbox');

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

// Define the models to sync in order of dependencies
const MODELS = [
  'Todo', 'Summary', 'ContactInformation', 'Reference', 'Education',
  'School', 'Degree', 'Experience', 'Position', 'Skill', 'Resume'
];

// Configure Amplify for a specific environment
async function configureAmplify(environment) {
  try {
    // Load environment variables
    let envVars = {};
    
    if (environment === 'local') {
      // Load from .env.local
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        
        for (const line of envLines) {
          const [key, value] = line.split('=');
          if (key && value) {
            envVars[key.trim()] = value.trim();
          }
        }
      } else {
        error('.env.local file not found. Run "npm run sandbox" first.');
        return false;
      }
    } else if (environment === 'production') {
      // Load from .env.production
      const envPath = path.join(process.cwd(), '.env.production');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        
        for (const line of envLines) {
          const [key, value] = line.split('=');
          if (key && value) {
            envVars[key.trim()] = value.trim();
          }
        }
      } else {
        error('.env.production file not found. Create it with your production environment variables.');
        return false;
      }
    } else {
      error(`Unknown environment: ${environment}`);
      return false;
    }
    
    // Configure Amplify
    Amplify.configure({
      API: {
        GraphQL: {
          endpoint: envVars.NEXT_PUBLIC_API_URL,
          region: envVars.NEXT_PUBLIC_AWS_REGION || 'us-east-2',
          defaultAuthMode: 'apiKey',
          apiKey: envVars.NEXT_PUBLIC_API_KEY
        }
      }
    });
    
    success(`Amplify configured for ${environment} environment`);
    return true;
  } catch (err) {
    error(`Failed to configure Amplify for ${environment} environment:`);
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
    
    return client;
  } catch (err) {
    error('Failed to generate data client:');
    error(err.message);
    return null;
  }
}

// Export data from the source environment
async function exportData(client, exportPath) {
  log('\n=== Exporting data ===');
  
  try {
    const exportData = {};
    
    for (const modelName of MODELS) {
      info(`Exporting ${modelName} data...`);
      
      try {
        // List all records for this model
        const records = await client.models[modelName].list();
        
        if (records.data.length > 0) {
          exportData[modelName] = records.data;
          success(`Exported ${records.data.length} ${modelName} records`);
        } else {
          info(`No ${modelName} records to export`);
        }
      } catch (err) {
        warning(`Error exporting ${modelName} data: ${err.message}`);
      }
    }
    
    // Write the export data to a file
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    success(`Data exported to ${exportPath}`);
    return true;
  } catch (err) {
    error('Failed to export data:');
    error(err.message);
    return false;
  }
}

// Import data into the target environment
async function importData(client, importPath) {
  log('\n=== Importing data ===');
  
  try {
    // Read the import data from the file
    if (!fs.existsSync(importPath)) {
      error(`Import file not found: ${importPath}`);
      return false;
    }
    
    const importData = JSON.parse(fs.readFileSync(importPath, 'utf8'));
    
    // Track imported IDs to maintain relationships
    const idMap = {};
    
    // Import data for each model
    for (const modelName of MODELS) {
      if (!importData[modelName] || importData[modelName].length === 0) {
        info(`No ${modelName} data to import`);
        continue;
      }
      
      info(`Importing ${importData[modelName].length} ${modelName} records...`);
      
      for (const record of importData[modelName]) {
        try {
          // Store the original ID
          const originalId = record.id;
          
          // Create a copy of the record without the ID
          const { id, createdAt, updatedAt, ...recordData } = record;
          
          // Update foreign keys with mapped IDs
          for (const key in recordData) {
            if (key.endsWith('Id') && idMap[recordData[key]]) {
              recordData[key] = idMap[recordData[key]];
            }
          }
          
          // Create the record
          const result = await client.models[modelName].create(recordData);
          
          // Store the mapping between original and new IDs
          idMap[originalId] = result.data.id;
          
          info(`Imported ${modelName} record: ${result.data.id}`);
        } catch (err) {
          warning(`Error importing ${modelName} record: ${err.message}`);
        }
      }
      
      success(`Imported ${modelName} data`);
    }
    
    success('Data import completed');
    return true;
  } catch (err) {
    error('Failed to import data:');
    error(err.message);
    return false;
  }
}

// Sync data between environments
async function syncData(sourceEnv, targetEnv) {
  log(`\n=== Syncing data from ${sourceEnv} to ${targetEnv} ===`);
  
  // Check if sandbox is running (for local environment)
  if ((sourceEnv === 'local' || targetEnv === 'local') && !isSandboxRunning()) {
    warning('Sandbox is not running. Starting sandbox...');
    const sandboxStarted = await startSandbox();
    if (!sandboxStarted) {
      error('Failed to start sandbox. Cannot sync data.');
      return false;
    }
  }
  
  // Create export directory if it doesn't exist
  const exportDir = path.join(process.cwd(), 'data-exports');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir);
  }
  
  // Export data from source environment
  info(`Configuring Amplify for ${sourceEnv} environment...`);
  const sourceConfigured = await configureAmplify(sourceEnv);
  if (!sourceConfigured) {
    error(`Failed to configure Amplify for ${sourceEnv} environment. Cannot sync data.`);
    return false;
  }
  
  const sourceClient = await getDataClient();
  if (!sourceClient) {
    error(`Failed to get data client for ${sourceEnv} environment. Cannot sync data.`);
    return false;
  }
  
  const exportPath = path.join(exportDir, `${sourceEnv}-export-${Date.now()}.json`);
  const exportCompleted = await exportData(sourceClient, exportPath);
  if (!exportCompleted) {
    error(`Failed to export data from ${sourceEnv} environment. Cannot sync data.`);
    return false;
  }
  
  // Import data into target environment
  info(`Configuring Amplify for ${targetEnv} environment...`);
  const targetConfigured = await configureAmplify(targetEnv);
  if (!targetConfigured) {
    error(`Failed to configure Amplify for ${targetEnv} environment. Cannot sync data.`);
    return false;
  }
  
  const targetClient = await getDataClient();
  if (!targetClient) {
    error(`Failed to get data client for ${targetEnv} environment. Cannot sync data.`);
    return false;
  }
  
  const importCompleted = await importData(targetClient, exportPath);
  if (!importCompleted) {
    error(`Failed to import data into ${targetEnv} environment.`);
    return false;
  }
  
  success(`Data synced from ${sourceEnv} to ${targetEnv} successfully`);
  return true;
}

// Function to create an interactive CLI
function createCLI() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  function displayMenu() {
    log('\n=== Amplify Gen 2 Data Sync ===');
    log('1. Sync from local to production');
    log('2. Sync from production to local');
    log('3. Export data from local');
    log('4. Export data from production');
    log('5. Import data to local');
    log('6. Import data to production');
    log('7. Exit');
    
    rl.question('\nEnter your choice (1-7): ', async (choice) => {
      switch (choice) {
        case '1':
          await syncData('local', 'production');
          break;
        case '2':
          await syncData('production', 'local');
          break;
        case '3':
          await configureAmplify('local');
          const localClient = await getDataClient();
          if (localClient) {
            const exportPath = path.join(process.cwd(), 'data-exports', `local-export-${Date.now()}.json`);
            await exportData(localClient, exportPath);
          }
          break;
        case '4':
          await configureAmplify('production');
          const prodClient = await getDataClient();
          if (prodClient) {
            const exportPath = path.join(process.cwd(), 'data-exports', `production-export-${Date.now()}.json`);
            await exportData(prodClient, exportPath);
          }
          break;
        case '5':
          rl.question('Enter the path to the import file: ', async (importPath) => {
            await configureAmplify('local');
            const localClient = await getDataClient();
            if (localClient) {
              await importData(localClient, importPath);
            }
            displayMenu();
          });
          return;
        case '6':
          rl.question('Enter the path to the import file: ', async (importPath) => {
            await configureAmplify('production');
            const prodClient = await getDataClient();
            if (prodClient) {
              await importData(prodClient, importPath);
            }
            displayMenu();
          });
          return;
        case '7':
          rl.close();
          return;
        default:
          warning('Invalid choice. Please try again.');
      }
      
      // Display menu again
      displayMenu();
    });
  }
  
  displayMenu();
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'local-to-prod':
    case 'local2prod':
      await syncData('local', 'production');
      break;
    case 'prod-to-local':
    case 'prod2local':
      await syncData('production', 'local');
      break;
    case 'export-local':
      await configureAmplify('local');
      const localClient = await getDataClient();
      if (localClient) {
        const exportPath = path.join(process.cwd(), 'data-exports', `local-export-${Date.now()}.json`);
        await exportData(localClient, exportPath);
      }
      break;
    case 'export-prod':
      await configureAmplify('production');
      const prodClient = await getDataClient();
      if (prodClient) {
        const exportPath = path.join(process.cwd(), 'data-exports', `production-export-${Date.now()}.json`);
        await exportData(prodClient, exportPath);
      }
      break;
    case 'import-local':
      if (args.length < 2) {
        error('Import file path is required');
        return;
      }
      await configureAmplify('local');
      const localImportClient = await getDataClient();
      if (localImportClient) {
        await importData(localImportClient, args[1]);
      }
      break;
    case 'import-prod':
      if (args.length < 2) {
        error('Import file path is required');
        return;
      }
      await configureAmplify('production');
      const prodImportClient = await getDataClient();
      if (prodImportClient) {
        await importData(prodImportClient, args[1]);
      }
      break;
    case 'interactive':
    case 'cli':
      createCLI();
      break;
    default:
      // If no command is provided, show help
      log('\n=== Amplify Gen 2 Data Sync ===');
      log('\nAvailable commands:');
      log('  local-to-prod   - Sync data from local to production');
      log('  prod-to-local   - Sync data from production to local');
      log('  export-local    - Export data from local environment');
      log('  export-prod     - Export data from production environment');
      log('  import-local <file> - Import data into local environment');
      log('  import-prod <file>  - Import data into production environment');
      log('  interactive     - Start interactive CLI');
      log('  cli             - Alias for interactive');
  }
}

// Run the main function
if (require.main === module) {
  main().catch(err => {
    error('Script failed:');
    error(err.message);
    process.exit(1);
  });
}

// Export functions for use in other scripts
module.exports = {
  configureAmplify,
  getDataClient,
  exportData,
  importData,
  syncData
};
