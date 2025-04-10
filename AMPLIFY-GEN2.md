# Amplify Gen 2 Data Management

This guide provides instructions for managing your Amplify Gen 2 data, including sandbox management, data model deployment, synchronization, and seeding.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Sandbox Management](#sandbox-management)
3. [Data Model Deployment](#data-model-deployment)
4. [Data Seeding](#data-seeding)
5. [Data Synchronization](#data-synchronization)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before using these scripts, make sure you have the following:

- AWS CLI installed and configured with appropriate credentials
- Amplify CLI installed (`npm install -g @aws-amplify/cli`)
- Node.js 18.19.0 or higher
- AWS account with appropriate permissions

## Sandbox Management

The sandbox management scripts allow you to start, stop, and check the status of your Amplify Gen 2 sandbox.

### Starting the Sandbox

```bash
npm run sandbox:start
```

This command will:
1. Start the Amplify Gen 2 sandbox
2. Generate environment variables in `.env.local`
3. Configure the sandbox for local development

### Stopping the Sandbox

```bash
npm run sandbox:stop
```

### Checking Sandbox Status

```bash
npm run sandbox:status
```

### Interactive CLI

```bash
npm run sandbox:cli
```

This will open an interactive CLI with options for managing the sandbox.

## Data Model Deployment

The data model deployment scripts allow you to deploy your Amplify Gen 2 data model to the cloud.

### Deploying the Data Model

```bash
npm run sandbox:deploy
```

This command will deploy your data model to the sandbox.

## Data Seeding

The data seeding scripts allow you to populate your Amplify Gen 2 database with test data.

### Seeding Data

```bash
npm run seed-data
```

This command will:
1. Clean up any existing data with the same seed ID
2. Create a complete hierarchy of related data
3. Generate unique IDs for each record to avoid duplicates

### Custom Seed Data

You can create custom seed data by modifying the `scripts/resumes/sample_resume.json` file or creating a new JSON file in the `scripts/resumes` directory.

## Data Synchronization

The data synchronization scripts allow you to sync data between local and production environments.

### Syncing from Local to Production

```bash
npm run sync-data:local-to-prod
```

### Syncing from Production to Local

```bash
npm run sync-data:prod-to-local
```

### Interactive CLI

```bash
npm run sync-data:cli
```

This will open an interactive CLI with options for syncing data.

## Production Deployment

The production deployment scripts allow you to deploy your Amplify Gen 2 backend to production.

### Full Deployment to Development

```bash
npm run amplify:deploy:dev
```

This command will:
1. Deploy the backend to the development environment
2. Generate environment variables in `.env.local`
3. Seed data into the development environment

### Full Deployment to Production

```bash
npm run amplify:deploy:prod
```

This command will:
1. Deploy the backend to the production environment
2. Generate environment variables in `.env.production`
3. Seed data into the production environment

### Interactive CLI

```bash
npm run amplify:cli
```

This will open an interactive CLI with options for deploying to different environments.

## Local Development

To start local development with the Amplify Gen 2 sandbox:

```bash
npm run local-dev
```

This command will:
1. Start the Amplify Gen 2 sandbox
2. Generate environment variables
3. Start the Next.js development server

## Troubleshooting

### Sandbox Issues

If you encounter issues with the sandbox:

1. Check the sandbox status: `npm run sandbox:status`
2. Stop and restart the sandbox: `npm run sandbox:stop && npm run sandbox:start`
3. Delete the sandbox and start fresh: `npm run sandbox-delete && npm run sandbox:start`

### Data Model Issues

If you encounter issues with the data model:

1. Check the Amplify outputs: `cat amplify_outputs.json`
2. Redeploy the data model: `npm run sandbox:deploy`

### Data Seeding Issues

If you encounter issues with data seeding:

1. Check the environment variables: `cat .env.local`
2. Try running the seed script with verbose logging: `NODE_ENV=development DEBUG=true npm run seed-data`

### Sync Issues

If you encounter issues with data synchronization:

1. Export data manually: `npm run sync-data export-local`
2. Import data manually: `npm run sync-data import-local <file-path>`

## Script Reference

Here's a complete list of available scripts:

- `npm run sandbox` - Start the Amplify Gen 2 sandbox
- `npm run sandbox:start` - Start the Amplify Gen 2 sandbox
- `npm run sandbox:stop` - Stop the Amplify Gen 2 sandbox
- `npm run sandbox:status` - Check the status of the Amplify Gen 2 sandbox
- `npm run sandbox:deploy` - Deploy the data model to the sandbox
- `npm run sandbox:cli` - Open the interactive sandbox CLI
- `npm run generate-env` - Generate environment variables
- `npm run local-dev` - Start local development with the sandbox
- `npm run seed-data` - Seed data into the database
- `npm run sync-data` - Open the data sync CLI
- `npm run sync-data:cli` - Open the interactive data sync CLI
- `npm run sync-data:local-to-prod` - Sync data from local to production
- `npm run sync-data:prod-to-local` - Sync data from production to local
- `npm run amplify:deploy` - Open the deployment CLI
- `npm run amplify:deploy:dev` - Full deployment to development
- `npm run amplify:deploy:prod` - Full deployment to production
- `npm run amplify:cli` - Open the interactive deployment CLI
