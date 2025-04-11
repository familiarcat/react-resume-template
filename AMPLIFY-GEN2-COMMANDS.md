# Amplify Gen 2 Commands

This document provides information about the available commands for working with AWS Amplify Gen 2 in this project.

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Local Development](#local-development)
4. [Deployment](#deployment)
5. [Data Seeding](#data-seeding)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Troubleshooting](#troubleshooting)

## Overview

AWS Amplify Gen 2 has updated its CLI commands. The `deploy` command is no longer available. Instead, we use:

- `ampx sandbox` for local development
- `ampx sandbox --once` for one-time local deployment
- `ampx pipeline-deploy` for CI/CD deployment

All commands in this project use the AWS wrapper to ensure proper credential handling.

## Setup

### Install Dependencies

Before using Amplify Gen 2, you need to install the required dependencies:

```bash
npm run amplify:gen2:install-deps
```

This will install all the required dependencies for Amplify Gen 2, including:

- @aws-amplify/api
- @aws-amplify/backend
- @aws-amplify/backend-graphql
- @aws-amplify/cli
- aws-amplify
- aws-cdk-lib
- aws-sdk

### Configure AWS Credentials

Make sure your AWS credentials are properly configured:

```bash
npm run aws:helper:fix
```

This will guide you through setting up your AWS credentials properly.

## Local Development

### Start the Sandbox

The sandbox provides a local development environment for Amplify Gen 2:

```bash
# Start the sandbox in watch mode
npm run sandbox:clean

# Or use the direct command
npm run amplify:gen2:sandbox
```

This will start the sandbox in watch mode, which will automatically redeploy when you make changes to your backend code.

### One-Time Deployment

For a one-time deployment to the sandbox:

```bash
# Deploy once to the sandbox
npm run sandbox:deploy-once

# Or use the direct command
npm run amplify:gen2:sandbox-once
```

This will deploy your backend to the sandbox once and then exit.

## Deployment

### Deploy to Development

To deploy to the development environment:

```bash
# Deploy to development
npm run amplify:dev

# Or use the clean environment
npm run amplify:deploy:clean
```

This will deploy your backend to the development environment.

### Deploy to Production

To deploy to the production environment:

```bash
# Deploy to production
npm run amplify:prod
```

This will deploy your backend to the production environment.

### Force Deployment

If you need to force a deployment:

```bash
# Force deployment
npm run amplify:gen2:force
```

This will force a clean deployment of your backend.

## Data Seeding

### Seed Development Data

To seed development data:

```bash
# Seed development data
npm run amplify:seed:dev

# Or use the clean environment
npm run amplify:seed:clean
```

This will seed your database with development-specific data.

### Seed Production Data

To seed production data:

```bash
# Seed production data
npm run amplify:seed:prod
```

This will seed your database with production-specific data.

### Full Deployment and Seeding

To deploy and seed in one step:

```bash
# Full deployment and seeding
npm run amplify:gen2:full
```

This will deploy your backend and seed it with data.

## CI/CD Pipeline

### Pipeline Deployment

For CI/CD pipeline deployment:

```bash
# Deploy using pipeline-deploy
npm run amplify:pipeline-deploy -- --app-id=<app-id> [--branch=<branch>]
```

This will deploy your backend using the `pipeline-deploy` command, which is designed for CI/CD pipelines.

## Troubleshooting

### Check AWS Credentials

If you encounter issues with AWS credentials:

```bash
# Check AWS credentials
npm run aws:check

# Fix AWS credentials
npm run aws:helper:fix
```

### Check Backend Status

To check the status of your backend:

```bash
# Check backend status
npm run amplify:check:backend
```

### Fix DynamoDB Tables

If your DynamoDB tables are not being created:

```bash
# Fix DynamoDB tables
npm run amplify:fix-tables
```

### Apply AWS Best Practices

To apply AWS credential management best practices to the entire project:

```bash
# Apply AWS best practices
npm run aws:manager:apply-all
```

### Common Errors and Solutions

#### "Unknown command: deploy"

If you see this error:

```
Error: Unknown command: deploy
```

This is because the `deploy` command is no longer available in the current version of Amplify Gen 2. Use `sandbox --once` instead:

```bash
npm run amplify:gen2:sandbox-once
```

#### "Cannot read properties of undefined (reading 'create')"

If you see this error during data seeding:

```
Failed to seed data: Cannot read properties of undefined (reading 'create')
```

This is because the client is not properly generated. Make sure to run:

```bash
npm run amplify:gen2:generate-outputs
npm run amplify:gen2:generate-graphql
```

Then try seeding again:

```bash
npm run amplify:gen2:seed
```

#### "Not enough non-option arguments: got 0, need at least 1"

If you see this error when running `ampx generate`:

```
Error: Not enough non-option arguments: got 0, need at least 1
```

This is because the `generate` command requires a subcommand. Use one of these instead:

```bash
npm run amplify:gen2:generate-outputs
npm run amplify:gen2:generate-graphql
```

## Additional Resources

- [AWS Amplify Gen 2 Documentation](https://docs.amplify.aws/gen2/)
- [AWS Amplify CLI Documentation](https://docs.amplify.aws/cli/)
- [AWS Amplify Gen 2 API Reference](https://docs.amplify.aws/gen2/reference/api/)
- [AWS Amplify Gen 2 Data Modeling](https://docs.amplify.aws/gen2/build-a-backend/data/)
