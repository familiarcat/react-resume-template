# AWS Amplify Gen 2 Project Guide

This guide provides comprehensive instructions for working with AWS Amplify Gen 2 in this project, including setup, development, deployment, and troubleshooting.

## Quick Start

```bash
# Install dependencies
npm install

# Install Amplify Gen 2 dependencies
npm run amplify:gen2:install-deps

# Configure AWS credentials
npm run aws:helper:fix

# Configure Next.js for static export
npm run next:static-config

# Deploy to sandbox
npm run amplify:gen2:sandbox-once

# Create DynamoDB tables
npm run amplify:gen2:create-tables

# Seed data
npm run amplify:gen2:seed-direct

# Start static development server
npm run dev:static
```

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Common Tasks](#common-tasks)

## Prerequisites

- Node.js v18.19.0+ or v20.5.0+
- AWS CLI installed and configured
- AWS account with appropriate permissions
- Git installed

## Project Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd <repository-directory>

# Install dependencies
npm install
```

### 2. Configure AWS

```bash
# Install Amplify Gen 2 dependencies
npm run amplify:gen2:install-deps

# Configure AWS credentials
npm run aws:helper:fix
```

### 3. Configure Next.js for Static Export

Since we're using static export with Next.js, we need to ensure compatibility:

```bash
# Update Next.js config for static export
npm run next:static-config
```

This script:
- Updates `next.config.js` for static export
- Checks for and handles middleware files (which are incompatible with static export)
- Creates backups of modified files

### 4. Deploy Backend

```bash
# Deploy to sandbox
npm run amplify:gen2:sandbox-once

# Create DynamoDB tables
npm run amplify:gen2:create-tables

# Seed data
npm run amplify:gen2:seed-direct
```

## Development Workflow

### Local Development

```bash
# Start the static development server
npm run dev:static
```

This builds the Next.js app as a static export and serves it, avoiding middleware issues.

### Backend Development

1. Edit data models in `amplify/data/resource.ts`
2. Deploy changes:

```bash
# Deploy changes to sandbox
npm run amplify:gen2:sandbox-once

# Create or update tables
npm run amplify:gen2:create-tables

# Regenerate client code
npm run amplify:gen2:generate-outputs
npm run amplify:gen2:generate-graphql
```

### Frontend Development

1. Connect to the Amplify backend in your components:

```typescript
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { Amplify } from 'aws-amplify';
import amplifyconfig from '../amplify_outputs.json';

// Configure Amplify
Amplify.configure(amplifyconfig);

// Generate client
const client = generateClient<Schema>();

// Use the client
const fetchTodos = async () => {
  const { data: todos, errors } = await client.models.Todo.list();
  return todos;
};
```

2. Use the static development server:

```bash
npm run dev:static
```

## Deployment

### Full Deployment Process

For a complete deployment and seeding:

```bash
npm run amplify:gen2:full
```

### Production Deployment

```bash
# Set environment to production
export NODE_ENV=production

# Deploy backend
npm run amplify:gen2:sandbox-once

# Create tables if needed
npm run amplify:gen2:create-tables

# Seed production data
npm run amplify:gen2:seed-direct

# Build frontend
npm run build

# The static files will be in the 'out' directory
# Deploy these files to your hosting service
```

### CI/CD Pipeline

```bash
npm run amplify:gen2:pipeline-deploy -- --branch $BRANCH_NAME --app-id $AWS_APP_ID
```

## Troubleshooting

### Middleware Issues with Static Export

If you see this error:

```
⨯ Middleware cannot be used with "output: export". See more info here: https://nextjs.org/docs/advanced-features/static-html-export
```

Run:

```bash
npm run next:static-config
```

This will:
1. Update your Next.js config for static export
2. Disable any middleware files
3. Create backups of modified files

Then use the static development server:

```bash
npm run dev:static
```

### DynamoDB Tables Not Created

If your DynamoDB tables aren't being created:

```bash
# Create tables manually
npm run amplify:gen2:create-tables

# Seed tables manually
npm run amplify:gen2:seed-direct
```

### AWS Credential Issues

If you encounter AWS credential issues:

```bash
# Check AWS credentials
npm run aws:check

# Fix AWS credentials
npm run aws:helper:fix
```

## Common Tasks

### Adding a New Model

1. Edit `amplify/data/resource.ts` to add your model
2. Deploy to sandbox: `npm run amplify:gen2:sandbox-once`
3. Create tables: `npm run amplify:gen2:create-tables`
4. Update your frontend code to use the new model

### Updating Existing Data

1. Make changes to your data model
2. Deploy to sandbox: `npm run amplify:gen2:sandbox-once`
3. Generate client: `npm run amplify:gen2:generate-outputs && npm run amplify:gen2:generate-graphql`
4. Update your frontend code as needed

### Checking DynamoDB Tables

```bash
# List tables
aws dynamodb list-tables --region us-east-2 --profile AmplifyUser

# Scan a table
aws dynamodb scan --table-name Todo --region us-east-2 --profile AmplifyUser
```

## Additional Resources

- [Detailed Workflow Documentation](./AMPLIFY-GEN2-WORKFLOW.md)
- [Amplify Gen 2 Commands Reference](./AMPLIFY-GEN2-COMMANDS.md)
- [AWS Amplify Gen 2 Documentation](https://docs.amplify.aws/gen2/)
- [Next.js Static Export Documentation](https://nextjs.org/docs/advanced-features/static-html-export)
