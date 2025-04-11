#!/usr/bin/env node

/**
 * Static Export Build Script for AWS Amplify
 * This script builds the Next.js application as a static site
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper functions
const log = (message) => console.log(`[Static Build] ${message}`);
const error = (message) => console.error(`[Static Build Error] ${message}`);

// Main build function
async function build() {
  try {
    log('Starting static export build process...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    log(`Using Node.js ${nodeVersion}`);
    
    // Set environment variables
    process.env.NODE_ENV = 'production';
    process.env.NEXT_TELEMETRY_DISABLED = '1';
    
    // Copy the static config
    log('Using static export configuration...');
    if (fs.existsSync(path.join(process.cwd(), 'next.config.static.js'))) {
      fs.copyFileSync(
        path.join(process.cwd(), 'next.config.static.js'),
        path.join(process.cwd(), 'next.config.js')
      );
      log('Copied next.config.static.js to next.config.js');
    } else {
      log('next.config.static.js not found, using existing configuration');
    }
    
    // Clean the output directory
    log('Cleaning output directories...');
    if (fs.existsSync(path.join(process.cwd(), '.next'))) {
      execSync('rm -rf .next', { stdio: 'inherit' });
    }
    if (fs.existsSync(path.join(process.cwd(), 'out'))) {
      execSync('rm -rf out', { stdio: 'inherit' });
    }
    
    // Run the build
    log('Running Next.js build and export...');
    execSync('next build', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=4096'
      }
    });
    
    // Check if the out directory exists
    if (fs.existsSync(path.join(process.cwd(), 'out'))) {
      log('Static export completed successfully!');
      
      // List the contents of the out directory
      log('Contents of out directory:');
      execSync('ls -la out', { stdio: 'inherit' });
      
      return 0;
    } else {
      error('Static export failed: out directory not found');
      return 1;
    }
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
