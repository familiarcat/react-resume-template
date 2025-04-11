# AWS Credential Management

This project uses AWS credentials for deploying and managing resources in AWS. This document provides guidance on how to properly manage AWS credentials for this project.

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
# Run any AWS command
bash scripts/aws-wrapper.sh aws s3 ls

# Run Amplify commands
bash scripts/aws-wrapper.sh npx ampx deploy
```

### 3. Use the npm Scripts

The project includes npm scripts for common AWS operations:

```bash
# Check AWS credentials
npm run aws:check

# Run commands with clean environment
npm run aws:clean aws s3 ls

# Fix AWS credentials
npm run aws:helper:fix

# Deploy with clean environment
npm run amplify:deploy:clean

# Start sandbox with clean environment
npm run sandbox:clean
```

### 4. Set Up Proper IAM Roles and Policies

Create a dedicated IAM user with the minimum required permissions:

1. Log in to the AWS Console
2. Go to IAM → Users → Create user
3. Name it "AmplifyUser"
4. Attach the "AdministratorAccess-Amplify" policy
5. Create access keys and use them with the `npm run aws:helper:fix` script

### 5. Rotate Credentials Regularly

Set up a process to rotate your AWS credentials every 90 days:

1. Log in to the AWS Console
2. Go to IAM → Users → AmplifyUser → Security credentials
3. Delete old access keys
4. Create new access keys
5. Update your credentials using `npm run aws:helper:fix`

## Troubleshooting

### Common Issues

#### InvalidClientTokenId Error

If you see this error:

```
An error occurred (InvalidClientTokenId) when calling the GetCallerIdentity operation: The security token included in the request is invalid.
```

This indicates that your AWS access key is invalid or expired. Solutions:

1. Generate new access keys in the AWS Console
2. Run `npm run aws:helper:fix` to update your credentials
3. Verify that your AWS account is active

#### ExpiredToken Error

If you see this error:

```
An error occurred (ExpiredToken) when calling the GetCallerIdentity operation: The security token included in the request is expired
```

This indicates that your AWS session token has expired. Solutions:

1. If using AWS SSO, run `aws sso login --profile AmplifyUser`
2. If using temporary credentials, generate new ones

#### AccessDenied Error

If you see this error:

```
An error occurred (AccessDenied) when calling the GetCallerIdentity operation: Access denied
```

This indicates that your AWS credentials do not have sufficient permissions. Solutions:

1. Verify that your IAM user has the necessary permissions
2. Check if your account has any restrictions or policies preventing access

## Additional Resources

- [AWS CLI Configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
