#!/usr/bin/env node

/**
 * Update Next.js Configuration for Static Export
 * 
 * This script updates the Next.js configuration to be compatible with static exports,
 * addressing middleware issues.
 */

const fs = require('fs');
const path = require('path');

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

// Function to check if middleware exists
function checkForMiddleware() {
  const middlewarePaths = [
    path.join(process.cwd(), 'middleware.js'),
    path.join(process.cwd(), 'middleware.ts'),
    path.join(process.cwd(), 'src', 'middleware.js'),
    path.join(process.cwd(), 'src', 'middleware.ts'),
    path.join(process.cwd(), 'app', 'middleware.js'),
    path.join(process.cwd(), 'app', 'middleware.ts'),
  ];
  
  const foundMiddleware = middlewarePaths.filter(p => fs.existsSync(p));
  
  if (foundMiddleware.length > 0) {
    warning('Middleware files found:');
    foundMiddleware.forEach(p => warning(`- ${p}`));
    warning('Middleware cannot be used with static exports. Consider removing or adapting these files.');
  } else {
    success('No middleware files found.');
  }
}

// Function to update Next.js config
function updateNextConfig() {
  const configPaths = [
    path.join(process.cwd(), 'next.config.js'),
    path.join(process.cwd(), 'next.config.mjs'),
  ];
  
  const configPath = configPaths.find(p => fs.existsSync(p));
  
  if (!configPath) {
    error('Next.js config file not found.');
    return false;
  }
  
  info(`Found Next.js config at: ${configPath}`);
  
  // Read the config file
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  // Check if it already has static export
  if (configContent.includes('output: \'export\'') || configContent.includes('output: "export"')) {
    info('Config already has static export enabled.');
  } else {
    // Create a backup
    const backupPath = `${configPath}.backup`;
    fs.writeFileSync(backupPath, configContent);
    success(`Created backup at: ${backupPath}`);
    
    // Update the config
    const staticConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export configuration
  output: 'export',
  
  // Disable features not compatible with static export
  images: {
    unoptimized: true,
  },
  
  // Other optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Specify the build directory
  distDir: '.next',
};

module.exports = nextConfig;
`;
    
    fs.writeFileSync(configPath, staticConfigContent);
    success('Updated Next.js config for static export.');
  }
  
  return true;
}

// Function to check for and rename middleware files
function handleMiddlewareFiles() {
  const middlewarePaths = [
    path.join(process.cwd(), 'middleware.js'),
    path.join(process.cwd(), 'middleware.ts'),
    path.join(process.cwd(), 'src', 'middleware.js'),
    path.join(process.cwd(), 'src', 'middleware.ts'),
    path.join(process.cwd(), 'app', 'middleware.js'),
    path.join(process.cwd(), 'app', 'middleware.ts'),
  ];
  
  const foundMiddleware = middlewarePaths.filter(p => fs.existsSync(p));
  
  if (foundMiddleware.length > 0) {
    info('Handling middleware files...');
    
    foundMiddleware.forEach(p => {
      const backupPath = `${p}.backup`;
      fs.copyFileSync(p, backupPath);
      success(`Created backup of middleware at: ${backupPath}`);
      
      // Rename the middleware file to disable it
      const disabledPath = `${p}.disabled`;
      fs.renameSync(p, disabledPath);
      success(`Renamed middleware to: ${disabledPath}`);
    });
    
    success('Middleware files handled successfully.');
  }
}

// Main function
async function main() {
  log('\n=== Updating Next.js Configuration for Static Export ===');
  
  // Check for middleware
  checkForMiddleware();
  
  // Update Next.js config
  const configUpdated = updateNextConfig();
  if (!configUpdated) {
    error('Failed to update Next.js config.');
    return false;
  }
  
  // Handle middleware files
  handleMiddlewareFiles();
  
  success('\nNext.js configuration updated for static export.');
  info('You can now run "npm run dev:static" to start the static development server.');
  
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
  updateNextConfig,
  handleMiddlewareFiles
};
