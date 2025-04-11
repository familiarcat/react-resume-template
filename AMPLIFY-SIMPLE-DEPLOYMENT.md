# Simple AWS Amplify Deployment Guide

This guide provides straightforward instructions for deploying this Next.js application to AWS Amplify using static export.

## Configuration Files

This repository includes two key configuration files:

1. **next.config.js**: Configures Next.js to use static export
2. **amplify.yml**: Configures AWS Amplify to build and deploy the application

## Deployment Steps

### 1. Push Your Code to a Git Repository

Make sure your code is pushed to a Git repository (GitHub, BitBucket, GitLab, etc.).

### 2. Create a New AWS Amplify App

1. Log in to the [AWS Amplify Console](https://console.aws.amazon.com/amplify/home)
2. Click "New app" > "Host web app"
3. Choose your Git provider and connect your repository
4. Select the branch you want to deploy

### 3. Configure the Build Settings

The default build settings should work, but you can verify them:

1. In the "Build settings" section, make sure the build specification is set to use `amplify.yml`
2. The build commands should be:
   - **preBuild**: `npm ci`
   - **build**: `npm run build`
3. The artifacts should be:
   - **baseDirectory**: `out`
   - **files**: `**/*`

### 4. Deploy the App

1. Click "Save and deploy"
2. Wait for the build and deployment to complete
3. Once deployed, you can access your app at the provided URL

## How It Works

This deployment uses Next.js's static export feature, which generates a purely static site that can be easily deployed to AWS Amplify.

1. **Static Export**: The `next.config.js` file is configured with `output: 'export'`, which tells Next.js to generate a static site in the `out` directory.

2. **Build Process**: The `npm run build` command builds the Next.js application and generates the static site.

3. **Deployment**: AWS Amplify deploys the contents of the `out` directory to a global CDN.

## Troubleshooting

If you encounter issues during deployment:

1. **Check the build logs** for errors
2. **Verify that your Next.js application is compatible with static export**
3. **Make sure all dependencies are installed** during the build process

## Limitations

Static export has some limitations:

1. **No Server-Side Rendering (SSR)**
2. **No API Routes**
3. **No Server Components**
4. **No Incremental Static Regeneration (ISR)**

For most simple applications, these limitations are acceptable. If you need these features, you may need to consider other deployment options.

## Testing Locally

To test the static export locally:

1. Run `npm run build` to generate the static site
2. Run `npx serve out` to serve the static site
3. Open `http://localhost:3000` in your browser
