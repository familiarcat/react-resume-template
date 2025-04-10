# AWS Amplify Deployment Guide

This guide provides instructions for deploying this application to AWS Amplify.

## Prerequisites

- AWS account with appropriate permissions
- Git repository with your code

## Deployment Options

### Option 1: AWS Amplify Console (Recommended)

1. **Log in to the AWS Amplify Console**:
   - Go to the [AWS Amplify Console](https://console.aws.amazon.com/amplify/home)
   - Click "New app" > "Host web app"

2. **Connect your repository**:
   - Choose your Git provider (GitHub, BitBucket, GitLab, etc.)
   - Authorize AWS Amplify to access your repository
   - Select the repository and branch to deploy

3. **Configure build settings**:
   - In the "App build specification" section, select "Use a configuration file"
   - Make sure the file is set to `amplify.yml` or `amplify.gen2.yml`
   - Click "Next"

4. **Review and deploy**:
   - Review your settings
   - Click "Save and deploy"

### Option 2: Manual Deployment

If you encounter issues with the automatic deployment, you can try a manual deployment:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies**:
   ```bash
   npm ci --legacy-peer-deps
   ```

3. **Build the application**:
   ```bash
   npm run build
   ```

4. **Deploy to AWS Amplify**:
   ```bash
   npm run amplify:deploy:prod
   ```

## Troubleshooting

If you encounter issues during deployment, try the following:

### Node.js Version Issues

AWS Amplify uses Node.js 16 by default. If you need a different version, you can:

1. **Add a .nvmrc file** (already included in this repository):
   ```
   18.19.0
   ```

2. **Specify the Node.js version in the Amplify Console**:
   - Go to your app in the Amplify Console
   - Click on "Build settings"
   - In the "Build image settings" section, set the Node.js version to 18.19.0

### Build Failures

If the build fails, check the build logs for errors. Common issues include:

1. **Missing dependencies**:
   - Make sure all dependencies are listed in package.json
   - Try adding `--legacy-peer-deps` to npm install commands

2. **Memory issues**:
   - Increase the memory limit by setting `NODE_OPTIONS="--max-old-space-size=4096"`

3. **Permission issues**:
   - Avoid using sudo in build scripts
   - Make sure all scripts are executable (`chmod +x scripts/*.sh`)

### Deployment Hangs

If the deployment hangs in the "Deploy pending" state:

1. **Check the build logs** for any errors or warnings
2. **Try a simpler build configuration** by using the minimal build script
3. **Clear the cache and redeploy** from the Amplify Console

## Configuration Files

This repository includes several configuration files for AWS Amplify:

- `amplify.yml`: Standard configuration for AWS Amplify
- `amplify.gen2.yml`: Configuration for AWS Amplify Gen 2
- `next.config.amplify.js`: Next.js configuration optimized for AWS Amplify

## Build Scripts

This repository includes several build scripts for AWS Amplify:

- `scripts/amplify-node-setup-simple.sh`: Sets up Node.js for AWS Amplify builds
- `scripts/amplify-build-minimal.js`: Minimal build script for AWS Amplify
- `scripts/amplify-build-v2.js`: More comprehensive build script for AWS Amplify
- `scripts/amplify-deploy.js`: Script for deploying to AWS Amplify

## Environment Variables

The following environment variables are used during the build:

- `NODE_ENV`: Set to `production` for production builds
- `NODE_OPTIONS`: Set to `--max-old-space-size=4096` to increase memory limit
- `NEXT_TELEMETRY_DISABLED`: Set to `1` to disable Next.js telemetry

## Additional Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html)
- [Next.js on AWS Amplify](https://docs.aws.amazon.com/amplify/latest/userguide/server-side-rendering-amplify.html)
- [Troubleshooting AWS Amplify Deployments](https://docs.aws.amazon.com/amplify/latest/userguide/troubleshooting-ssr-deployment.html)
