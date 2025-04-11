# AWS Credential Management Guide

This guide provides comprehensive instructions for managing AWS credentials in this project. Following these best practices will help you avoid common credential issues and ensure your Amplify deployment works correctly.

## Table of Contents

1. [Understanding the Issue](#understanding-the-issue)
2. [Setting Up AWS Credentials](#setting-up-aws-credentials)
3. [Using the AWS Wrapper](#using-the-aws-wrapper)
4. [Common Issues and Solutions](#common-issues-and-solutions)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

## Understanding the Issue

The main issue with AWS credentials in this project is the conflict between different credential sources:

- **AWS_PROFILE** environment variable
- **AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY** environment variables

When both are set simultaneously, the AWS SDK gets confused about which credentials to use, resulting in errors like:

```
An error occurred (InvalidClientTokenId) when calling the GetCallerIdentity operation: The security token included in the request is invalid.
```

## Setting Up AWS Credentials

### 1. Install the AWS CLI

If you haven't already, install the AWS CLI:

- **macOS**: `brew install awscli`
- **Windows**: Download and run the installer from the [AWS CLI website](https://aws.amazon.com/cli/)
- **Linux**: `sudo apt-get install awscli` or equivalent for your distribution

### 2. Create an IAM User in AWS

1. Log in to the [AWS Console](https://console.aws.amazon.com/)
2. Go to IAM → Users → Create user
3. Name it "AmplifyUser"
4. Attach the "AdministratorAccess-Amplify" policy
5. Create access keys and save them securely

### 3. Configure AWS Credentials

Run the AWS credential helper:

```bash
npm run aws:helper:fix
```

This interactive script will:
- Check your current AWS configuration
- Guide you through setting up your AWS credentials
- Create or update the necessary files

Alternatively, you can configure AWS credentials manually:

```bash
# Create the .aws directory if it doesn't exist
mkdir -p ~/.aws

# Create or edit the credentials file
nano ~/.aws/credentials
```

Add the following to your credentials file:

```ini
[AmplifyUser]
aws_access_key_id = YOUR_ACCESS_KEY
aws_secret_access_key = YOUR_SECRET_KEY
region = us-east-2
```

Also create or edit the config file:

```bash
nano ~/.aws/config
```

Add the following to your config file:

```ini
[profile AmplifyUser]
region = us-east-2
output = json
```

### 4. Apply AWS Credential Management to the Project

Run the AWS manager to apply best practices to the entire project:

```bash
npm run aws:manager:apply-all
```

This will:
- Check your AWS credentials
- Update scripts to use the AWS wrapper
- Create a global .env file
- Update .gitignore
- Create an AWS credential management README

## Using the AWS Wrapper

All AWS commands should be run through the AWS wrapper to ensure consistent credential handling:

```bash
# Run any AWS command
npm run aws:wrapper aws s3 ls

# Start the Amplify sandbox
npm run sandbox:clean

# Deploy the backend
npm run amplify:deploy:clean

# Seed data
npm run amplify:seed:clean
```

## Common Issues and Solutions

### InvalidClientTokenId Error

**Issue**: The security token included in the request is invalid.

**Solution**:
1. Run `npm run aws:helper:fix` to update your credentials
2. Verify that your AWS account is active
3. Check if your IAM user has the necessary permissions

### ExpiredToken Error

**Issue**: The security token has expired.

**Solution**:
1. If using AWS SSO, run `aws sso login --profile AmplifyUser`
2. If using temporary credentials, generate new ones

### AccessDenied Error

**Issue**: Your AWS credentials do not have sufficient permissions.

**Solution**:
1. Verify that your IAM user has the necessary permissions
2. Check if your account has any restrictions or policies preventing access

### DynamoDB Tables Not Created

**Issue**: DynamoDB tables are not being created during deployment.

**Solution**:
1. Run `npm run amplify:fix-tables` to fix your data model and force deployment
2. Check the CloudFormation console for any stack creation errors
3. Verify that your data model is correctly defined in `amplify/data/resource.ts`

## Best Practices

### 1. Use a Single Authentication Method

Always use a single authentication method:

```bash
# RECOMMENDED: Use AWS profiles
export AWS_PROFILE=AmplifyUser
unset AWS_ACCESS_KEY_ID
unset AWS_SECRET_ACCESS_KEY

# NOT RECOMMENDED: Use direct credentials
unset AWS_PROFILE
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
```

### 2. Use the AWS Wrapper

All AWS commands should be run through the AWS wrapper:

```bash
bash scripts/aws-wrapper.sh aws s3 ls
```

### 3. Use the npm Scripts

The project includes npm scripts for common AWS operations:

```bash
npm run aws:check
npm run aws:clean aws s3 ls
npm run aws:helper:fix
npm run amplify:deploy:clean
npm run sandbox:clean
```

### 4. Rotate Credentials Regularly

Set up a process to rotate your AWS credentials every 90 days:

1. Log in to the AWS Console
2. Go to IAM → Users → AmplifyUser → Security credentials
3. Delete old access keys
4. Create new access keys
5. Update your credentials using `npm run aws:helper:fix`

### 5. Use Environment-Specific Configurations

Use environment-specific configurations for development and production:

```bash
# Deploy to development
npm run amplify:dev

# Deploy to production
npm run amplify:prod
```

## Troubleshooting

If you encounter issues with AWS credentials:

1. **Check your AWS credentials**:
   ```bash
   npm run aws:check
   ```

2. **Fix your AWS credentials**:
   ```bash
   npm run aws:helper:fix
   ```

3. **Apply best practices to the entire project**:
   ```bash
   npm run aws:manager:apply-all
   ```

4. **Verify DynamoDB tables**:
   ```bash
   npm run aws:clean aws dynamodb list-tables
   ```

5. **Force deploy the backend**:
   ```bash
   npm run amplify:fix-tables
   ```

By following these best practices, you'll avoid credential conflicts and ensure your Amplify application has the proper permissions to create and manage DynamoDB tables.
