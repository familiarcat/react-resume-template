#!/usr/bin/env node

/**
 * Dependency Optimization Script
 *
 * This script optimizes dependencies for AWS Amplify Gen 2 deployment:
 * 1. Uses exact versions for all dependencies
 * 2. Removes unnecessary dependencies
 * 3. Ensures compatibility with Node.js 18.18.2
 * 4. Creates a minimal set of dependencies for production
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Helper functions
const log = (message) => console.log(message);
const success = (message) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);
const warning = (message) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);
const error = (message) => console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);
const info = (message) => console.log(`${colors.blue}[INFO]${colors.reset} ${message}`);

// Function to read package.json
function readPackageJson() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  try {
    return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch (err) {
    error(`Failed to read package.json: ${err.message}`);
    process.exit(1);
  }
}

// Function to write package.json
function writePackageJson(packageJson) {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  try {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    info('Saving modified package.json');
    success('package.json updated successfully');
  } catch (err) {
    error(`Failed to write package.json: ${err.message}`);
    process.exit(1);
  }
}

// Function to check if a package version exists
function checkPackageVersionExists(packageName, version) {
  try {
    const result = execSync(`npm view ${packageName}@${version} version --json`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    return result.trim() === `"${version}"`;
  } catch (err) {
    return false;
  }
}

// Function to get the latest available version of a package
function getLatestAvailableVersion(packageName, fallbackVersion) {
  try {
    // Try to get the latest version
    const latestVersion = execSync(`npm view ${packageName} version --json`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim().replace(/"/g, '');
    info(`Found latest version for ${packageName}: ${latestVersion}`);
    return latestVersion;
  } catch (err) {
    warning(`Could not determine latest version for ${packageName}, using fallback: ${fallbackVersion}`);
    return fallbackVersion;
  }
}

// Function to optimize dependencies
function optimizeDependencies() {
  log('\n=== Optimizing Dependencies for AWS Amplify Gen 2 ===');

  // Read package.json
  const packageJson = readPackageJson();

  // Store original dependencies
  const originalDependencies = { ...packageJson.dependencies };
  const originalDevDependencies = { ...packageJson.devDependencies };

  // Define compatible versions for critical packages
  const compatibleVersions = {
    // Core dependencies
    'next': '14.1.0',
    'react': '18.2.0',
    'react-dom': '18.2.0',
    'aws-amplify': '6.0.17',
    '@aws-amplify/backend-graphql': '0.3.2',
    '@aws-amplify/graphql-model-transformer': '3.2.2',
    '@aws-sdk/client-dynamodb': '3.388.0',
    '@aws-sdk/lib-dynamodb': '3.388.0',
    '@aws-sdk/types': '3.388.0',
    '@aws-sdk/credential-providers': '3.388.0',
    'execa': '7.1.1',

    // Smithy packages
    '@smithy/is-array-buffer': '2.0.0',
    '@smithy/credential-provider-imds': '2.0.12',
    '@smithy/util-hex-encoding': '2.0.0',
    '@smithy/util-uri-escape': '2.0.0',
    '@smithy/util-utf8': '2.0.0',
    '@smithy/util-buffer-from': '2.0.0',

    // Dev dependencies
    'typescript': '5.1.6',
    '@types/react': '18.2.21',
    '@types/react-dom': '18.2.7',
    '@aws-amplify/backend': '1.3.0',
    '@aws-amplify/backend-cli': '1.3.0',
    '@aws-amplify/cli': '12.10.0',
    'ampx': '0.2.2',
    'tailwindcss': '3.3.0',
    'postcss': '8.4.31',
    'autoprefixer': '10.4.16'
  };

  // Update dependencies with compatible versions
  if (packageJson.dependencies) {
    Object.keys(packageJson.dependencies).forEach(dep => {
      if (compatibleVersions[dep]) {
        // Check if the specified version exists
        const versionExists = checkPackageVersionExists(dep, compatibleVersions[dep]);

        if (!versionExists) {
          // If version doesn't exist, get the latest available version
          const currentVersion = packageJson.dependencies[dep].replace(/^[\^~]/, '');
          const latestVersion = getLatestAvailableVersion(dep, currentVersion);

          info(`Specified version ${compatibleVersions[dep]} for ${dep} not found, using ${latestVersion} instead`);
          packageJson.dependencies[dep] = latestVersion;
        } else if (packageJson.dependencies[dep] !== compatibleVersions[dep]) {
          info(`Updating ${dep} from ${packageJson.dependencies[dep]} to ${compatibleVersions[dep]}`);
          packageJson.dependencies[dep] = compatibleVersions[dep];
        }
      } else if (packageJson.dependencies[dep].startsWith('^') ||
                 packageJson.dependencies[dep].startsWith('~')) {
        // Convert to exact version
        const exactVersion = packageJson.dependencies[dep].replace(/^[\^~]/, '');
        info(`Converting ${dep} from ${packageJson.dependencies[dep]} to exact version ${exactVersion}`);
        packageJson.dependencies[dep] = exactVersion;
      }
    });
  }

  // Update devDependencies with compatible versions
  if (packageJson.devDependencies) {
    Object.keys(packageJson.devDependencies).forEach(dep => {
      if (compatibleVersions[dep]) {
        // Check if the specified version exists
        const versionExists = checkPackageVersionExists(dep, compatibleVersions[dep]);

        if (!versionExists) {
          // If version doesn't exist, get the latest available version
          const currentVersion = packageJson.devDependencies[dep].replace(/^[\^~]/, '');
          const latestVersion = getLatestAvailableVersion(dep, currentVersion);

          info(`Specified version ${compatibleVersions[dep]} for ${dep} not found, using ${latestVersion} instead`);
          packageJson.devDependencies[dep] = latestVersion;
        } else if (packageJson.devDependencies[dep] !== compatibleVersions[dep]) {
          info(`Updating ${dep} from ${packageJson.devDependencies[dep]} to ${compatibleVersions[dep]}`);
          packageJson.devDependencies[dep] = compatibleVersions[dep];
        }
      } else if (packageJson.devDependencies[dep].startsWith('^') ||
                 packageJson.devDependencies[dep].startsWith('~')) {
        // Convert to exact version
        const exactVersion = packageJson.devDependencies[dep].replace(/^[\^~]/, '');
        info(`Converting ${dep} from ${packageJson.devDependencies[dep]} to exact version ${exactVersion}`);
        packageJson.devDependencies[dep] = exactVersion;
      }
    });
  }

  // Update resolutions with compatible versions
  if (!packageJson.resolutions) {
    packageJson.resolutions = {};
  }

  // Add critical resolutions
  Object.entries(compatibleVersions).forEach(([dep, version]) => {
    if (dep.startsWith('@aws-') || dep.startsWith('@smithy/') || dep === 'execa') {
      // Check if the specified version exists
      const versionExists = checkPackageVersionExists(dep, version);

      if (!versionExists) {
        // If version doesn't exist, get the latest available version
        const latestVersion = getLatestAvailableVersion(dep, version);

        info(`Specified version ${version} for ${dep} not found in resolutions, using ${latestVersion} instead`);
        packageJson.resolutions[dep] = latestVersion;
      } else {
        packageJson.resolutions[dep] = version;
      }
    }
  });

  // Add specific resolutions for problematic packages
  // Check if TypeScript version exists
  const typescriptVersion = '5.1.6';
  if (!checkPackageVersionExists('typescript', typescriptVersion)) {
    const latestTypescriptVersion = getLatestAvailableVersion('typescript', '5.0.0');
    info(`Specified TypeScript version ${typescriptVersion} not found, using ${latestTypescriptVersion} instead`);
    packageJson.resolutions['typescript'] = latestTypescriptVersion;
  } else {
    packageJson.resolutions['typescript'] = typescriptVersion;
  }

  // Check if execa version exists
  const execaVersion = '7.1.1';
  if (!checkPackageVersionExists('execa', execaVersion)) {
    const latestExecaVersion = getLatestAvailableVersion('execa', '7.0.0');
    info(`Specified execa version ${execaVersion} not found, using ${latestExecaVersion} instead`);
    packageJson.resolutions['execa'] = latestExecaVersion;
  } else {
    packageJson.resolutions['execa'] = execaVersion;
  }

  // Update engines to match AWS Amplify environment
  packageJson.engines = {
    node: '18.18.2',
    npm: '9.8.1'
  };

  // Write updated package.json
  writePackageJson(packageJson);

  // Create a minimal package.json for production
  const minimalPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    private: true,
    engines: packageJson.engines,
    resolutions: packageJson.resolutions,
    scripts: {
      build: 'next build',
      start: 'next start',
      'amplify:fix-files': 'node scripts/fix-amplify-files.js',
      'amplify:generate-outputs': 'npx ampx generate outputs'
    },
    dependencies: {},
    devDependencies: {}
  };

  // Add only essential dependencies
  const essentialDeps = [
    'next', 'react', 'react-dom', 'aws-amplify',
    '@aws-amplify/backend-graphql', '@aws-amplify/graphql-model-transformer',
    '@aws-sdk/client-dynamodb', '@aws-sdk/lib-dynamodb', '@aws-sdk/types',
    '@aws-sdk/credential-providers'
  ];

  essentialDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      minimalPackageJson.dependencies[dep] = packageJson.dependencies[dep];
    }
  });

  // Add only essential dev dependencies
  const essentialDevDeps = [
    '@aws-amplify/backend', '@aws-amplify/backend-cli', '@aws-amplify/cli',
    'ampx', 'typescript', '@types/react', '@types/react-dom',
    'tailwindcss', 'postcss', 'autoprefixer'
  ];

  essentialDevDeps.forEach(dep => {
    if (packageJson.devDependencies[dep]) {
      minimalPackageJson.devDependencies[dep] = packageJson.devDependencies[dep];
    }
  });

  // Save minimal package.json for production
  const minimalPackageJsonPath = path.join(process.cwd(), 'package.json.minimal');
  try {
    fs.writeFileSync(minimalPackageJsonPath, JSON.stringify(minimalPackageJson, null, 2));
    success('Created minimal package.json for production at package.json.minimal');
  } catch (err) {
    error(`Failed to write minimal package.json: ${err.message}`);
  }

  success('Dependency optimization completed successfully');
}

// Run the optimization
optimizeDependencies();
