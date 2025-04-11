# Amplify Gen 2 Workflow Guide

This guide provides a comprehensive workflow for deploying and managing your Amplify Gen 2 application in both development and production environments.

## Table of Contents

1. [Overview](#overview)
2. [Development Workflow](#development-workflow)
3. [Production Workflow](#production-workflow)
4. [Optimizing Deployment](#optimizing-deployment)
5. [Environment-Specific Data](#environment-specific-data)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

## Overview

The Amplify Gen 2 workflow is designed to:

- **Optimize deployment times** by using caching and parallel processing
- **Separate development and production environments** to keep them isolated
- **Maintain distinct data sets** for development and production
- **Ensure DynamoDB tables are properly created** during deployment
- **Provide a consistent and repeatable process** for deployments

## Development Workflow

The development workflow is designed for local development and testing.

### Running the Development Workflow

```bash
npm run amplify:dev
```

This command will:

1. Deploy to the development environment (using sandbox for faster iterations)
2. Verify that DynamoDB tables are created
3. Seed the database with development-specific data

### Development-Only Commands

```bash
# Deploy to development environment only
npm run amplify:optimize development

# Seed development data only
npm run amplify:seed:dev
```

## Production Workflow

The production workflow is designed for deploying to production.

### Running the Production Workflow

```bash
npm run amplify:prod
```

This command will:

1. Deploy to the production environment
2. Verify that DynamoDB tables are created
3. Seed the database with production-specific data

### Production-Only Commands

```bash
# Deploy to production environment only
npm run amplify:optimize production

# Seed production data only
npm run amplify:seed:prod
```

## Optimizing Deployment

The deployment process has been optimized to reduce build times:

### Caching Strategy

The deployment scripts implement a caching strategy that:

- Tracks changes to key files in the Amplify configuration
- Skips deployment if no changes are detected
- Uses the sandbox for faster local development

### Force Deployment

If you need to force a deployment (e.g., if tables aren't being created):

```bash
npm run amplify:gen2:force
```

This command will:

1. Force a clean deployment of your Amplify Gen 2 backend
2. Verify that DynamoDB tables are created
3. Generate the client for interacting with the API

## Environment-Specific Data

The seeding scripts create environment-specific data:

### Development Data

Development data is prefixed with `[DEV]` to distinguish it from production data. This allows you to:

- Easily identify development data
- Clean up development data without affecting production data
- Test with realistic but non-production data

### Production Data

Production data is prefixed with `[PROD]` to distinguish it from development data. This allows you to:

- Easily identify production data
- Maintain separate production data sets
- Ensure production data is not mixed with development data

## Troubleshooting

### DynamoDB Tables Not Created

If your DynamoDB tables aren't being created:

1. **Check your data model**: Make sure your `amplify/data/resource.ts` file has the correct syntax.

2. **Use force deployment**: Run `npm run amplify:gen2:force` to force a clean deployment.

3. **Check authorization modes**: Make sure your authorization mode is set to 'apiKey' instead of 'iam' in your data model.

4. **Verify AWS credentials**: Make sure your AWS credentials are properly configured.

5. **Check CloudFormation**: Look at the CloudFormation console to see if there are any stack creation errors.

### Deployment Takes Too Long

If your deployment is taking too long:

1. **Use the optimized deployment**: Run `npm run amplify:optimize` to use the optimized deployment process.

2. **Use the sandbox for development**: The sandbox is much faster than deploying to the cloud.

3. **Check for unnecessary deployments**: The optimized deployment script will skip deployment if no changes are detected.

## Best Practices

### Development vs. Production

- Use the development workflow for local development and testing
- Use the production workflow for deploying to production
- Keep development and production data separate

### Data Management

- Use the environment-specific seeding scripts to maintain separate data sets
- Clean up old data regularly to avoid clutter
- Use the prefixes to easily identify data from different environments

### Deployment

- Use the optimized deployment scripts to reduce build times
- Use the force deployment option if you encounter issues
- Check the CloudFormation console for stack creation errors

### AWS Resources

- Monitor your AWS resources to avoid unexpected charges
- Clean up unused resources
- Use the AWS CLI to verify resource creation

## Additional Resources

- [AWS Amplify Gen 2 Documentation](https://docs.amplify.aws/gen2/)
- [AWS Amplify Data Documentation](https://docs.amplify.aws/gen2/build-a-backend/data/)
- [AWS DynamoDB Documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)
- [AWS CloudFormation Documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html)
