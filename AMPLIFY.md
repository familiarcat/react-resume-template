# AWS Amplify Deployment Guide

This guide provides instructions for deploying this Next.js application to AWS Amplify Gen 2.

## Prerequisites

- An AWS account
- AWS Amplify CLI installed (optional)
- Git repository with your code

## Deployment Options

### Option 1: Using the AWS Amplify Console (Recommended)

1. **Log in to the AWS Amplify Console**:
   - Go to the [AWS Amplify Console](https://console.aws.amazon.com/amplify/home)
   - Click "New app" > "Host web app"

2. **Connect your repository**:
   - Choose your Git provider (GitHub, BitBucket, GitLab, etc.)
   - Authorize AWS Amplify to access your repository
   - Select the repository and branch to deploy

3. **Configure build settings**:
   - In the "App build specification" section, select "Use a configuration file"
   - Make sure the file is set to `amplify.gen2.yml`
   - Click "Next"

4. **Review and deploy**:
   - Review your settings
   - Click "Save and deploy"

### Option 2: Using the AWS Amplify CLI

1. **Initialize Amplify**:
   ```bash
   amplify init
   ```

2. **Add hosting**:
   ```bash
   amplify add hosting
   ```

3. **Deploy**:
   ```bash
   amplify publish
   ```

## Troubleshooting

If you encounter issues during deployment, try the following:

1. **Check the build logs**:
   - In the AWS Amplify Console, go to your app
   - Click on the branch you're deploying
   - Click on the latest build
   - Check the build logs for errors

2. **Try a different Node.js version**:
   - In the AWS Amplify Console, go to your app
   - Click on "Build settings"
   - In the "Build image settings" section, set the Node.js version to 18.19.0

3. **Clear the cache and redeploy**:
   - In the AWS Amplify Console, go to your app
   - Click on the branch you're deploying
   - Click on "Redeploy with cleared cache"

4. **Use a custom build script**:
   - In the AWS Amplify Console, go to your app
   - Click on "Build settings"
   - In the "Build commands" section, set the build command to `npm run amplify:gen2`

## Additional Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html)
- [Next.js on AWS Amplify](https://docs.aws.amazon.com/amplify/latest/userguide/server-side-rendering-amplify.html)
- [Troubleshooting AWS Amplify Deployments](https://docs.aws.amazon.com/amplify/latest/userguide/troubleshooting-ssr-deployment.html)
