#!/usr/bin/env node

/**
 * Static Development Server
 * 
 * This script builds the Next.js app as a static export and serves it,
 * avoiding middleware issues with static exports.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const handler = require('serve-handler');

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
const success = (message) => console.log(`${colors.green}✓ ${message}${colors.reset}`);
const warning = (message) => console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
const error = (message) => console.log(`${colors.red}✗ ${message}${colors.reset}`);
const info = (message) => console.log(`${colors.blue}ℹ ${message}${colors.reset}`);

// Function to execute shell commands
function runCommand(command, options = {}) {
  const { silent = false, ignoreError = false } = options;
  
  try {
    if (!silent) {
      info(`Executing: ${command}`);
    }
    
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit'
    });
    
    return { success: true, output };
  } catch (err) {
    if (!ignoreError) {
      error(`Command failed: ${command}`);
      error(err.message);
    }
    
    return { success: false, error: err, output: err.stdout };
  }
}

// Function to check if a package is installed
function isPackageInstalled(packageName) {
  try {
    require.resolve(packageName);
    return true;
  } catch (err) {
    return false;
  }
}

// Function to install serve if not already installed
async function installServe() {
  if (!isPackageInstalled('serve')) {
    info('Installing serve package...');
    const result = runCommand('npm install --save-dev serve');
    
    if (!result.success) {
      error('Failed to install serve package');
      return false;
    }
    
    success('Serve package installed');
  }
  
  return true;
}

// Function to build the static site
async function buildStaticSite() {
  log('\n=== Building Static Site ===');
  
  // Build the Next.js app
  info('Building Next.js app...');
  const buildResult = runCommand('next build');
  
  if (!buildResult.success) {
    error('Failed to build Next.js app');
    return false;
  }
  
  success('Next.js app built successfully');
  
  return true;
}

// Function to serve the static site
async function serveStaticSite() {
  log('\n=== Serving Static Site ===');
  
  const port = process.env.PORT || 3000;
  const outDir = path.join(process.cwd(), 'out');
  
  // Check if out directory exists
  if (!fs.existsSync(outDir)) {
    error('Output directory not found. Build failed or not run.');
    return false;
  }
  
  // Create server
  const server = http.createServer((request, response) => {
    return handler(request, response, {
      public: outDir,
      rewrites: [
        { source: '/**', destination: '/index.html' }
      ]
    });
  });
  
  // Start server
  server.listen(port, () => {
    success(`Static site server running at http://localhost:${port}`);
    info('Press Ctrl+C to stop');
  });
  
  // Handle server errors
  server.on('error', (err) => {
    error(`Server error: ${err.message}`);
    process.exit(1);
  });
  
  return true;
}

// Main function
async function main() {
  log('\n=== Static Development Server ===');
  
  // Install serve if needed
  const serveInstalled = await installServe();
  if (!serveInstalled) {
    error('Failed to install required packages');
    return false;
  }
  
  // Build static site
  const buildSuccess = await buildStaticSite();
  if (!buildSuccess) {
    error('Failed to build static site');
    return false;
  }
  
  // Serve static site
  const serveSuccess = await serveStaticSite();
  if (!serveSuccess) {
    error('Failed to serve static site');
    return false;
  }
  
  return true;
}

// Run the main function
if (require.main === module) {
  main().catch(err => {
    error(`Script failed: ${err.message}`);
    process.exit(1);
  });
}

// Export functions for use in other scripts
module.exports = {
  buildStaticSite,
  serveStaticSite
};
