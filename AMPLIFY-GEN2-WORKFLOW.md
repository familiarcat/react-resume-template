# Amplify Gen 2 Project Workflow

This document provides a comprehensive guide for working with AWS Amplify Gen 2 in this project, covering project setup, deployment, and continued development.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Backend Development](#backend-development)
4. [Frontend Development](#frontend-development)
5. [Deployment](#deployment)
6. [Troubleshooting](#troubleshooting)
7. [Common Workflows](#common-workflows)

## Prerequisites

Before starting, ensure you have the following:

- Node.js v18.19.0+ or v20.5.0+
- AWS CLI installed and configured
- AWS account with appropriate permissions
- Git installed

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Amplify Gen 2 Dependencies

```bash
npm run amplify:gen2:install-deps
```

This installs all required AWS Amplify Gen 2 packages.

### 4. Configure AWS Credentials

```bash
npm run aws:helper:fix
```

This will guide you through setting up your AWS credentials properly.

## Backend Development

### 1. Define Data Models

Edit the data models in `amplify/data/resource.ts`:

```typescript
// Example model definition
const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [allow.guest()]),
  // Add more models as needed
});
```

### 2. Deploy to Sandbox

For development, deploy to your personal sandbox:

```bash
npm run amplify:gen2:sandbox
```

This will:
- Deploy your backend to AWS
- Watch for changes and redeploy automatically
- Generate the necessary client files

For a one-time deployment without watching:

```bash
npm run amplify:gen2:sandbox-once
```

### 3. Create DynamoDB Tables

If your DynamoDB tables aren't created automatically:

```bash
npm run amplify:gen2:create-tables
```

### 4. Seed Data

Seed your DynamoDB tables with test data:

```bash
npm run amplify:gen2:seed-direct
```

## Frontend Development

### 1. Configure Next.js for Static Export

Since we're using static export (`output: export`), we need to ensure we're not using middleware. Edit your `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Disable features not compatible with static export
  images: {
    unoptimized: true,
  },
  // Ensure no middleware is used
};

module.exports = nextConfig;
```

### 2. Remove or Adapt Middleware

If you have middleware in your project (files like `middleware.ts` or `middleware.js`), you need to:

- Remove them if they're not essential
- Or adapt your project to not use static export if middleware is required

### 3. Start Development Server with Static Export

Create a specific script for static development:

```bash
# Add this to package.json scripts
"dev:static": "next build && next export && npx serve out"
```

Then run:

```bash
npm run dev:static
```

This builds the static site and serves it, avoiding middleware issues.

### 4. Connect to Amplify Backend

In your frontend code, use the generated client:

```typescript
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { Amplify } from 'aws-amplify';
import amplifyconfig from '../amplify_outputs.json';

// Configure Amplify
Amplify.configure(amplifyconfig);

// Generate client
const client = generateClient<Schema>();

// Use the client
const fetchTodos = async () => {
  const { data: todos, errors } = await client.models.Todo.list();
  return todos;
};
```

## Deployment

### 1. Full Deployment Process

For a complete deployment and seeding:

```bash
npm run amplify:gen2:full
```

This will:
- Deploy your backend
- Generate client code
- Create DynamoDB tables
- Seed data

### 2. Deploy to Production

For production deployment:

```bash
# Set environment to production
export NODE_ENV=production

# Deploy backend
npm run amplify:gen2:sandbox-once

# Create tables if needed
npm run amplify:gen2:create-tables

# Build frontend
npm run build

# The static files will be in the 'out' directory
# Deploy these files to your hosting service
```

### 3. CI/CD Pipeline Deployment

For CI/CD pipelines, use:

```bash
npm run amplify:gen2:pipeline-deploy -- --branch $BRANCH_NAME --app-id $AWS_APP_ID
```

## Troubleshooting

### DynamoDB Tables Not Created

If your DynamoDB tables aren't being created:

```bash
# Create tables manually
npm run amplify:gen2:create-tables

# Seed tables manually
npm run amplify:gen2:seed-direct
```

### Middleware Issues with Static Export

If you encounter middleware errors with static export:

1. Remove middleware files from your project
2. Update `next.config.js` to ensure compatibility with static export:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Disable features not compatible with static export
  experimental: {
    // Disable any experimental features that might use middleware
  },
};

module.exports = nextConfig;
```

3. Use alternative approaches for functionality typically handled by middleware:
   - For authentication, use client-side auth checks
   - For redirects, use client-side navigation
   - For API routes, use AWS Lambda functions or AppSync resolvers

### AWS Credential Issues

If you encounter AWS credential issues:

```bash
# Check AWS credentials
npm run aws:check

# Fix AWS credentials
npm run aws:helper:fix
```

## Common Workflows

### 1. Development Workflow

```bash
# Start backend sandbox
npm run amplify:gen2:sandbox

# In another terminal, start frontend development
npm run dev:static
```

### 2. Adding a New Model

1. Edit `amplify/data/resource.ts` to add your model
2. Deploy to sandbox: `npm run amplify:gen2:sandbox-once`
3. Create tables: `npm run amplify:gen2:create-tables`
4. Update your frontend code to use the new model

### 3. Updating Existing Data

1. Make changes to your data model
2. Deploy to sandbox: `npm run amplify:gen2:sandbox-once`
3. Generate client: `npm run amplify:gen2:generate-outputs && npm run amplify:gen2:generate-graphql`
4. Update your frontend code as needed

### 4. Production Release

1. Test thoroughly in development
2. Deploy to production: `npm run amplify:gen2:pipeline-deploy -- --branch main --app-id $AWS_APP_ID`
3. Build static site: `npm run build`
4. Deploy static files to hosting service

## Additional Resources

- [AWS Amplify Gen 2 Documentation](https://docs.amplify.aws/gen2/)
- [Next.js Static Export Documentation](https://nextjs.org/docs/advanced-features/static-html-export)
- [AWS Amplify CLI Documentation](https://docs.amplify.aws/cli/)
