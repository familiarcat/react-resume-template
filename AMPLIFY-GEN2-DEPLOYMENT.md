# AWS Amplify Gen 2 Deployment Guide

This guide provides instructions for deploying your AWS Amplify Gen 2 backend and seeding it with data.

## Prerequisites

Before deploying your backend, make sure you have the following:

- AWS CLI installed and configured with appropriate credentials
- Amplify CLI installed (`npm install -g @aws-amplify/cli`)
- Node.js 18.19.0 or higher
- AWS account with appropriate permissions

## Deployment Options

### Option 1: Force Deployment (Recommended for First Deployment)

If you're having issues with tables not being created, use the force deployment option:

```bash
npm run amplify:gen2:force
```

This script will:
1. Force deploy your Amplify Gen 2 backend
2. Verify that DynamoDB tables are created
3. Generate the client

### Option 2: Full Deployment (Deploy + Seed)

To deploy your backend and seed it with data in one step:

```bash
npm run amplify:gen2:full
```

This script will:
1. Deploy your Amplify Gen 2 backend
2. Generate the client
3. Seed the database with mock data

### Option 3: Step-by-Step Deployment

If you prefer to deploy and seed separately:

#### 1. Deploy the Backend

```bash
npm run amplify:gen2:deploy
```

This will deploy your Amplify Gen 2 backend and generate the client.

#### 2. Seed the Database

```bash
npm run amplify:gen2:seed
```

This will seed your database with mock data.

## Verifying Deployment

To verify that your backend has been deployed and seeded:

```bash
npm run amplify:check:backend
```

This script will:
1. Check if the backend is deployed
2. Check if the API is working
3. Run a test query to verify that the data is accessible

## Understanding the Deployment Process

### 1. Backend Deployment

The `amplify:gen2:deploy` script:
- Deploys your data model defined in `amplify/data/resource.ts`
- Creates the necessary DynamoDB tables
- Sets up the AppSync GraphQL API
- Generates the client for interacting with the API

### 2. Data Seeding

The `amplify:gen2:seed` script:
- Creates a complete hierarchy of related records
- Uses a unique seed ID to identify records created in each run
- Cleans up existing records with the same seed ID before creating new ones

## Data Structure

The seeding script creates the following records:

- 1 Resume
- 1 Summary
- 1 ContactInformation
- 3 References
- 1 Education
- 2 Schools
- 3 Degrees
- 1 Experience
- 4 Positions
- 5 Skills

## Troubleshooting

### Common Issues

#### 1. DynamoDB Tables Not Created

If your DynamoDB tables aren't being created:

- **Check your data model**: Make sure your `amplify/data/resource.ts` file has the correct syntax. Each model should be properly defined with the correct indentation and structure.

- **Use force deployment**: Run `npm run amplify:gen2:force` to force a clean deployment and verify table creation.

- **Check authorization modes**: Make sure your authorization mode is set to 'apiKey' instead of 'iam' in your data model.

- **Wait for CloudFormation**: Sometimes it takes time for CloudFormation to create all resources. Wait 5-10 minutes and check again.

#### 2. Deployment Fails

If the deployment fails:
- Check your AWS credentials
- Make sure you have the correct permissions
- Check the AWS CloudFormation console for stack creation errors
- Try running with the `--force` flag: `npx ampx deploy --force`

#### 3. Seeding Fails

If seeding fails:
- Check if the backend is deployed correctly
- Make sure the API is accessible
- Check if the data model matches the seeding script
- Verify that the DynamoDB tables exist

#### 4. amplify_outputs.json Not Found

If you see an error about `amplify_outputs.json` not being found:
- Run `npm run amplify:gen2:deploy` to deploy the backend
- Check if the file exists in your project root
- If it still doesn't exist, try running `npx ampx sandbox` to generate it

## Cleaning Up

To remove the backend:

```bash
npx ampx delete --profile AmplifyUser
```

This will delete all resources created by Amplify, including:
- AppSync API
- DynamoDB tables
- IAM roles and policies
- CloudFormation stacks

## Additional Resources

- [AWS Amplify Gen 2 Documentation](https://docs.amplify.aws/gen2/)
- [AWS Amplify Data Documentation](https://docs.amplify.aws/gen2/build-a-backend/data/)
- [AWS AppSync Documentation](https://docs.aws.amazon.com/appsync/latest/devguide/welcome.html)
- [AWS DynamoDB Documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)
