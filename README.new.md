# Next.js Resume Application with AWS Amplify Gen 2

This project is a modern resume application built with Next.js and AWS Amplify Gen 2. It provides a server-side rendered resume that can be easily deployed to AWS Amplify.

![Next.js Resume Application](resume-screenshot.jpg?raw=true 'Next.js Resume Application')

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Local Development](#local-development)
- [AWS Amplify Gen 2 Integration](#aws-amplify-gen-2-integration)
  - [Setup](#setup)
  - [Deployment](#deployment)
  - [Troubleshooting](#troubleshooting)
- [Data Management](#data-management)
  - [Data Structure](#data-structure)
  - [Seeding Data](#seeding-data)
  - [Syncing Between Environments](#syncing-between-environments)
- [Authentication](#authentication)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Server-Side Rendering**: Fast, SEO-friendly resume application
- **AWS Amplify Gen 2 Integration**: Modern cloud infrastructure with GraphQL API
- **TypeScript**: Type-safe code for better developer experience
- **Responsive Design**: Mobile-friendly UI
- **Data Management**: Easy data seeding and synchronization between environments
- **Authentication**: Secure access to protected routes
- **Testing**: Comprehensive test suite with Jest
- **CI/CD**: Automated deployment pipeline

## Getting Started

### Prerequisites

- Node.js 18.19.0 or higher
- npm or yarn
- AWS Account (for deployment)
- AWS CLI (configured with appropriate credentials)
- Amplify CLI (for local development with Amplify)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/nextjs-resume-amplify.git
cd nextjs-resume-amplify
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

Copy the `.env.example` file to `.env.local` and update the values:

```bash
cp .env.example .env.local
```

### Local Development

1. Start the development server:

```bash
npm run dev
# or
yarn dev
```

2. Start the local Amplify sandbox:

```bash
npm run sandbox
# or
yarn sandbox
```

3. Run both together:

```bash
npm run local-dev
# or
yarn local-dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## AWS Amplify Gen 2 Integration

This project uses AWS Amplify Gen 2, which provides a modern, type-safe approach to building cloud applications with AWS services.

### Setup

1. Install the Amplify CLI:

```bash
npm install -g @aws-amplify/cli
```

2. Configure AWS credentials:

```bash
npm run aws:fix
# or
yarn aws:fix
```

3. Initialize Amplify:

```bash
npx ampx init
```

### Deployment

#### Option 1: Using the Secure Deploy Script

This is the recommended approach for deployment:

1. Deploy to development environment:

```bash
npm run secure-deploy:dev
# or
yarn secure-deploy:dev
```

2. Deploy to production environment:

```bash
npm run secure-deploy:prod
# or
yarn secure-deploy:prod
```

3. Seed data:

```bash
npm run seed-data
# or
yarn seed-data
```

#### Option 2: Using Git-Based Deployment

You can also deploy directly from your Git repository:

1. Connect your repository to AWS Amplify in the AWS Console
2. Configure the build settings using the provided `amplify.yml` file
3. Deploy by pushing to your repository

### Server-Side Conduit Pattern

This project implements the server-side conduit pattern for integrating Next.js with AWS Amplify Gen 2:

1. **Centralized Data Access**: All Amplify operations go through a single conduit
2. **Improved Performance**: Server-side caching reduces API calls
3. **Better Error Handling**: Graceful fallbacks ensure the application works even when Amplify is unavailable
4. **Clean Separation of Concerns**: Server actions provide a clean interface for client components

The conduit is implemented in `app/lib/amplify-server-conduit.ts`.

### Required Files for Deployment

The following files are required for successful deployment:

- `required-server-files.json`: Contains Next.js server configuration
- `routes-manifest.json`: Contains Next.js routing information
- `build-manifest.json`: Contains Next.js build information

These files are automatically created by the secure deploy script.

### Troubleshooting

If you encounter issues with deployment:

1. Check that your AWS credentials are properly configured
2. Ensure you're using Node.js 18.19.0 or higher
3. Verify that all required files are present in the build output
4. Check the Amplify build logs for specific errors

Common issues:

- **Missing required-server-files.json**: Run `npm run secure-deploy` to ensure all required files are created
- **Node.js version incompatibility**: Update to Node.js 18.19.0 or higher
- **AWS credential issues**: Run `npm run aws:fix` to fix credential configuration
- **Deployment hanging**: Check the AWS Amplify console for more information
- **DynamoDB tables not created**: Run `npm run amplify:generate-outputs` to generate the necessary outputs

## Data Management

### Data Structure

The application uses a hierarchical data structure for the resume:

```
Resume
├── ContactInfo
├── Summary
├── Education
│   └── Schools
│       └── Degrees
├── Experience
│   └── Positions
└── Skills
```

Each entity has the following properties:

- **Resume**: The main resume entity
  - `id`: Unique identifier
  - `title`: Resume title
  - `createdAt`: Creation timestamp
  - `updatedAt`: Last update timestamp

- **ContactInfo**: Contact information for the resume
  - `id`: Unique identifier
  - `resumeId`: Reference to the resume
  - `name`: Full name
  - `email`: Email address
  - `phone`: Phone number

- **Summary**: Professional summary
  - `id`: Unique identifier
  - `resumeId`: Reference to the resume
  - `persona`: Professional persona
  - `goals`: Professional goals

- **Education**: Education history
  - `id`: Unique identifier
  - `resumeId`: Reference to the resume
  - `summary`: Education summary

- **School**: Educational institution
  - `id`: Unique identifier
  - `educationId`: Reference to the education
  - `name`: School name

- **Degree**: Academic degree
  - `id`: Unique identifier
  - `schoolId`: Reference to the school
  - `major`: Field of study
  - `startYear`: Start year
  - `endYear`: End year

- **Experience**: Work experience
  - `id`: Unique identifier
  - `resumeId`: Reference to the resume

- **Position**: Job position
  - `id`: Unique identifier
  - `experienceId`: Reference to the experience
  - `title`: Job title
  - `company`: Company name
  - `startDate`: Start date
  - `endDate`: End date

- **Skill**: Technical skill
  - `id`: Unique identifier
  - `resumeId`: Reference to the resume
  - `title`: Skill name
  - `link`: URL to learn more about the skill

### Seeding Data

The application includes a data seeding script that populates the database with sample data. This is useful for development and testing.

#### Seed Development Environment

```bash
npm run seed-data:dev
# or
yarn seed-data:dev
```

#### Seed Production Environment

```bash
npm run seed-data:prod
# or
yarn seed-data:prod
```

#### How Seeding Works

The seeding process:

1. Checks if data already exists to avoid duplicates
2. Creates a new resume with a unique ID
3. Creates related entities (contact info, summary, education, etc.)
4. Links all entities together using reference IDs

The seeding script is implemented in `scripts/seed-data.js`.

### Syncing Between Environments

The application includes scripts to sync data between environments. This is useful for maintaining consistency between development and production.

#### Sync from Development to Production

```bash
npm run sync-data:dev-to-prod
# or
yarn sync-data:dev-to-prod
```

#### Sync from Production to Development

```bash
npm run sync-data:prod-to-dev
# or
yarn sync-data:prod-to-dev
```

#### How Syncing Works

The syncing process:

1. Retrieves data from the source environment
2. Transforms the data if necessary
3. Writes the data to the target environment
4. Preserves relationships between entities

This ensures that your development environment matches production, or vice versa.

## Authentication

The application uses AWS Cognito for authentication. Protected routes require authentication.

To access protected routes:

1. Sign up or sign in
2. Use the authentication token to access protected routes

## Testing

The project includes a comprehensive test suite using Jest. Tests are organized by component type and focus on testing the functionality rather than implementation details.

### Running Tests

```bash
# Run all tests
npm run test
# or
yarn test

# Run tests in watch mode
npm run test:watch
# or
yarn test:watch

# Run tests with coverage
npm run test:ci
# or
yarn test:ci
```

### Test Suites

The tests are organized into the following suites:

```bash
# Test components
npm run test:components
# or
yarn test:components

# Test library code
npm run test:lib
# or
yarn test:lib

# Test server actions
npm run test:actions
# or
yarn test:actions

# Test Amplify integration
npm run test:amplify
# or
yarn test:amplify
```

### Test Structure

Tests are located in the `tests` directory and follow this structure:

```
tests/
├── actions/       # Tests for server actions
├── amplify/       # Tests for Amplify integration
├── components/    # Tests for React components
└── lib/           # Tests for library code
```

### Test Coverage

The project aims for at least 70% test coverage. You can view the coverage report after running `npm run test:ci`.

## CI/CD

The project includes a GitHub Actions workflow for CI/CD in `.github/workflows/ci.yml`.

### Workflow Steps

1. **Test**: Runs the test suite and uploads coverage reports
   - Uses Node.js 18.x
   - Installs dependencies with `npm ci`
   - Runs tests with `npm run test:ci`
   - Uploads coverage reports to Codecov

2. **Build**: Builds the application
   - Runs only if tests pass
   - Builds the application with `npm run secure-deploy`
   - Creates required files with `npm run amplify:gen2:fix-files`
   - Tests the build artifacts
   - Uploads the build artifacts for deployment

3. **Deploy**: Deploys to AWS Amplify
   - Runs only on pushes to the main branch
   - Downloads the build artifacts
   - Configures AWS credentials
   - Deploys to Amplify with `npm run amplify:gen2:cicd`

### Environment Variables

The following environment variables are required for the CI/CD workflow:

- `AWS_ACCESS_KEY_ID`: AWS access key ID
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key
- `CODECOV_TOKEN`: Token for uploading coverage reports to Codecov

## Project Structure

```
├── amplify/            # Amplify configuration
├── app/                # Next.js application
│   ├── actions/        # Server actions
│   ├── components/     # React components
│   ├── config/         # Configuration files
│   ├── lib/            # Library code
│   └── resume/         # Resume page
├── public/             # Static assets
├── scripts/            # Deployment and utility scripts
├── tests/              # Test files
├── .env.example        # Example environment variables
├── amplify.yml         # Amplify build configuration
├── jest.config.js      # Jest configuration
├── next.config.js      # Next.js configuration
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
