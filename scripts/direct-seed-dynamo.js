#!/usr/bin/env node

const { execSync } = require('child_process');
const crypto = require('crypto');

// Generate a unique ID
const generateId = () => crypto.randomUUID();

// Get table names
console.log('Getting DynamoDB tables...');
try {
  const tablesOutput = execSync('bash scripts/clean-aws-env.sh aws dynamodb list-tables', { encoding: 'utf8' });
  const tables = JSON.parse(tablesOutput).TableNames || [];

  console.log(`Found ${tables.length} tables:`);
  tables.forEach(table => console.log(`- ${table}`));

  // Find relevant tables
  const todoTable = tables.find(table => table.includes('Todo'));
  const resumeTable = tables.find(table => table.includes('Resume'));
  const summaryTable = tables.find(table => table.includes('Summary'));

  if (!todoTable) {
    console.error('No Todo table found');
    process.exit(1);
  }

  // Create a test Todo item
  console.log(`\nCreating test item in ${todoTable}...`);
  const todoId = generateId();
  const todoItem = {
    id: { S: todoId },
    content: { S: `Test Todo created at ${new Date().toISOString()}` },
    __typename: { S: 'Todo' }
  };

  const putTodoCommand = `bash scripts/clean-aws-env.sh aws dynamodb put-item --table-name ${todoTable} --item '${JSON.stringify(todoItem)}'`;

  try {
    execSync(putTodoCommand, { stdio: 'inherit' });
    console.log(`Successfully created Todo item with ID: ${todoId}`);
  } catch (err) {
    console.error('Failed to create Todo item:');
    console.error(err.message);
  }

  // Create Resume and Summary if tables exist
  if (resumeTable && summaryTable) {
    console.log('\nCreating Resume and Summary items...');
    
    // Create IDs
    const resumeId = generateId();
    const summaryId = generateId();
    
    // Create Summary item
    const summaryItem = {
      id: { S: summaryId },
      goals: { S: `Test goals created at ${new Date().toISOString()}` },
      persona: { S: `Test persona created at ${new Date().toISOString()}` },
      resume: { S: resumeId },
      __typename: { S: 'Summary' }
    };
    
    const putSummaryCommand = `bash scripts/clean-aws-env.sh aws dynamodb put-item --table-name ${summaryTable} --item '${JSON.stringify(summaryItem)}'`;
    
    try {
      execSync(putSummaryCommand, { stdio: 'inherit' });
      console.log(`Successfully created Summary item with ID: ${summaryId}`);
    } catch (err) {
      console.error('Failed to create Summary item:');
      console.error(err.message);
    }
    
    // Create Resume item
    const resumeItem = {
      id: { S: resumeId },
      title: { S: `Test Resume created at ${new Date().toISOString()}` },
      summaryId: { S: summaryId },
      __typename: { S: 'Resume' }
    };
    
    const putResumeCommand = `bash scripts/clean-aws-env.sh aws dynamodb put-item --table-name ${resumeTable} --item '${JSON.stringify(resumeItem)}'`;
    
    try {
      execSync(putResumeCommand, { stdio: 'inherit' });
      console.log(`Successfully created Resume item with ID: ${resumeId}`);
    } catch (err) {
      console.error('Failed to create Resume item:');
      console.error(err.message);
    }
  }

  console.log('\nDirect DynamoDB seeding completed!');
} catch (err) {
  console.error('Failed to list DynamoDB tables:');
  console.error(err.message);
  process.exit(1);
}
