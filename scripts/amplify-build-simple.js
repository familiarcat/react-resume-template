#!/usr/bin/env node

/**
 * This script is a simplified build script for AWS Amplify
 * It handles the build process with better error handling and logging
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper functions
const log = (message) => {
  console.log(`[Amplify Build] ${message}`);
};

const error = (message) => {
  console.error(`[Amplify Build Error] ${message}`);
};

// Main build function
async function build() {
  try {
    log('Starting build process...');

    // Check Node.js version
    const nodeVersion = process.version;
    log(`Using Node.js ${nodeVersion}`);

    // Check if .next directory exists and clean it if it does
    const nextDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(nextDir)) {
      log('Cleaning .next directory...');
      fs.rmSync(nextDir, { recursive: true, force: true });
    }

    // Create .next directory
    log('Creating .next directory...');
    fs.mkdirSync(nextDir, { recursive: true });

    // Set environment variables
    process.env.NODE_ENV = 'production';
    process.env.NEXT_TELEMETRY_DISABLED = '1';

    // Copy the Amplify-specific next.config.js
    log('Using Amplify-specific Next.js config...');
    const amplifyConfig = fs.readFileSync(path.join(process.cwd(), 'next.config.amplify.js'), 'utf8');
    const originalConfig = fs.existsSync(path.join(process.cwd(), 'next.config.js'))
      ? fs.readFileSync(path.join(process.cwd(), 'next.config.js'), 'utf8')
      : '';
    fs.writeFileSync(path.join(process.cwd(), 'next.config.js.backup'), originalConfig);
    fs.writeFileSync(path.join(process.cwd(), 'next.config.js'), amplifyConfig);

    // Run the build
    log('Running Next.js build...');
    execSync('next build', {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=4096'
      }
    });

    // Restore the original next.config.js
    log('Restoring original Next.js config...');
    fs.writeFileSync(path.join(process.cwd(), 'next.config.js'), originalConfig);

    // Check if build was successful
    if (!fs.existsSync(path.join(nextDir, 'build-manifest.json'))) {
      throw new Error('Build failed: build-manifest.json not found');
    }

    log('Build completed successfully!');
    return 0;
  } catch (err) {
    error(`Build failed: ${err.message}`);
    return 1;
  }
}

// Run the build
build()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((err) => {
    error(`Unhandled error: ${err.message}`);
    process.exit(1);
  });
