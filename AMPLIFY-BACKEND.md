# AWS Amplify Gen 2 Backend Deployment and Seeding

This guide provides instructions for deploying your AWS Amplify Gen 2 backend and seeding it with mock data.

## Prerequisites

Before deploying your backend, make sure you have the following:

- AWS CLI installed and configured with appropriate credentials
- Amplify CLI installed (`npm install -g @aws-amplify/cli`)
- Node.js 18.19.0 or higher
- AWS account with appropriate permissions

## Deploying the Backend

You can deploy your backend using the provided script:

```bash
npm run amplify:deploy:backend
```

This script will:

1. Deploy your Amplify Gen 2 backend to AWS
2. Generate mock data for all models
3. Seed the backend with the mock data

## Manual Deployment

If you prefer to deploy the backend manually, you can use the following commands:

### 1. Deploy the Backend

```bash
npx ampx deploy
```

### 2. Seed the Backend

```bash
node scripts/deploy-and-seed-backend.js
```

## Data Model

The backend includes the following models:

- **Resume**: The main model that contains references to all other models
- **Summary**: Contains information about the resume owner's goals and persona
- **ContactInformation**: Contains contact information for the resume owner
- **Reference**: Contains references for the resume owner
- **Education**: Contains education information for the resume owner
- **School**: Contains information about schools attended
- **Degree**: Contains information about degrees earned
- **Experience**: Contains work experience information
- **Position**: Contains information about positions held
- **Skill**: Contains information about skills

## Mock Data

The seeding script creates a complete hierarchy of related records:

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

## Verifying Deployment

You can verify that your backend has been deployed and seeded by:

1. Checking the AWS AppSync console to see the API
2. Using the AWS DynamoDB console to see the tables and data
3. Using the provided script to check the status of your backend:

```bash
npm run amplify:check:backend
```

This script will:
1. Check if the backend is deployed
2. Check if the API is working
3. Run a test query to verify that the data is accessible

## Troubleshooting

If you encounter issues during deployment:

1. Check the AWS CloudFormation console to see if there are any stack creation errors
2. Check the AWS AppSync console to see if the API was created
3. Check the AWS DynamoDB console to see if the tables were created
4. Run the following command to see the status of your backend:

```bash
npm run amplify:check:backend
```

### Common Issues

#### amplify_outputs.json Not Found

If you see an error about `amplify_outputs.json` not being found, it means the backend hasn't been deployed or the sandbox hasn't been started. Try running:

```bash
npm run sandbox
```

Or deploy the backend:

```bash
npm run amplify:deploy:backend
```

#### API URL or API Key Not Found

If you see an error about the API URL or API key not being found, it means the backend hasn't been deployed correctly. Try running:

```bash
npm run sandbox
```

#### Mutations Failed

If you see errors about mutations failing, it could be because:

1. The backend schema doesn't match the mutations
2. The backend hasn't been deployed correctly
3. The API is not accessible

Try running the check script to verify the backend status:

```bash
npm run amplify:check:backend
```

## Cleaning Up

If you want to remove the backend, you can use the following command:

```bash
npx ampx delete --profile AmplifyUser
```

This will delete all resources created by Amplify, including:

- AppSync API
- DynamoDB tables
- IAM roles and policies
- CloudFormation stacks

If you're using the sandbox, you can stop it with:

```bash
npm run sandbox:stop
```

Or delete it with:

```bash
npm run sandbox-delete
```

## Additional Resources

- [AWS Amplify Gen 2 Documentation](https://docs.amplify.aws/gen2/)
- [AWS Amplify Data Documentation](https://docs.amplify.aws/gen2/build-a-backend/data/)
