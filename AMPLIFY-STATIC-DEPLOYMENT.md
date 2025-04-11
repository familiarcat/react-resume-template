# AWS Amplify Static Deployment Guide

This guide provides instructions for deploying this Next.js application to AWS Amplify as a static site.

## Why Static Export?

AWS Amplify has limitations when it comes to deploying Next.js applications with server-side rendering (SSR). The `required-server-files.json` error is a common issue that occurs when trying to deploy a Next.js application with SSR to AWS Amplify.

To avoid this issue, we've configured the application to use Next.js's static export feature, which generates a purely static site that can be easily deployed to AWS Amplify.

## Prerequisites

- AWS account with appropriate permissions
- Git repository with your code

## Deployment Steps

### 1. Configure Your Repository

Make sure your repository includes the following files:

- `next.config.static.js`: Next.js configuration for static export
- `amplify.yml` or `amplify.gen2.yml`: AWS Amplify build configuration
- `scripts/amplify-static-build.js`: Custom build script for static export

### 2. Deploy to AWS Amplify

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

## How It Works

The static export process works as follows:

1. **Build Configuration**:
   - The `next.config.static.js` file configures Next.js to use the `export` output mode
   - This generates a purely static site in the `out` directory

2. **Build Process**:
   - The `amplify-static-build.js` script handles the build process
   - It copies the static configuration to `next.config.js`
   - It runs `next build` to generate the static site
   - It verifies that the `out` directory exists

3. **Deployment**:
   - AWS Amplify deploys the contents of the `out` directory
   - The `amplify.yml` file configures AWS Amplify to use the `out` directory as the base directory

## Limitations of Static Export

Using static export has some limitations:

1. **No Server-Side Rendering (SSR)**:
   - All pages are pre-rendered at build time
   - No dynamic server-side rendering

2. **No API Routes**:
   - Next.js API routes are not supported
   - You'll need to use AWS Lambda or other services for APIs

3. **No Server Components**:
   - React Server Components are not supported
   - All components must be client components

4. **No Incremental Static Regeneration (ISR)**:
   - Pages cannot be regenerated after deployment
   - You'll need to redeploy to update content

## Workarounds for Limitations

To work around these limitations, you can:

1. **Use Client-Side Data Fetching**:
   - Fetch data on the client side using React hooks
   - Use AWS Amplify's client-side libraries for authentication and data access

2. **Use AWS Lambda for APIs**:
   - Create AWS Lambda functions for your APIs
   - Use AWS API Gateway to expose your Lambda functions

3. **Use AWS Amplify's Authentication and Data Services**:
   - Use AWS Cognito for authentication
   - Use AWS AppSync for GraphQL APIs
   - Use AWS DynamoDB for data storage

4. **Use a Headless CMS for Content**:
   - Use a headless CMS like Contentful, Sanity, or Strapi
   - Fetch content on the client side

## Testing Locally

To test the static export locally:

1. **Run the static build script**:
   ```bash
   npm run amplify:build:static
   ```

2. **Serve the static site**:
   ```bash
   npx serve out
   ```

3. **Open the site in your browser**:
   ```
   http://localhost:3000
   ```

## Troubleshooting

If you encounter issues during deployment, try the following:

### Build Failures

1. **Check the build logs** for errors
2. **Run the build locally** to see if it works
3. **Check for unsupported features** like API routes or server components

### Routing Issues

1. **Check for dynamic routes** that might not be properly pre-rendered
2. **Add a `next.config.js` with `trailingSlash: true`** to fix routing issues
3. **Use relative paths** for assets and links

### Missing Assets

1. **Check that assets are included** in the `public` directory
2. **Use relative paths** for assets
3. **Check the `out` directory** to make sure assets are being copied

## Additional Resources

- [Next.js Static Export Documentation](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports)
- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html)
- [AWS Amplify Hosting Documentation](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html)
- [AWS Amplify Troubleshooting](https://docs.aws.amazon.com/amplify/latest/userguide/troubleshooting-ssr-deployment.html)
