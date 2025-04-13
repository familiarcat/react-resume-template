#!/usr/bin/env node

/**
 * Apply Clean Configuration Script
 * 
 * This script applies clean configuration files based on the official AWS Amplify Gen 2 template.
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

// Function to apply clean configuration
function applyCleanConfig() {
  log('\n=== Applying Clean Configuration ===');
  
  try {
    // Apply amplify.yml
    const amplifyYmlPath = path.join(process.cwd(), 'amplify.yml');
    const amplifyYmlNewPath = path.join(process.cwd(), 'amplify.yml.new');
    
    if (fs.existsSync(amplifyYmlNewPath)) {
      // Backup existing file
      if (fs.existsSync(amplifyYmlPath)) {
        fs.copyFileSync(amplifyYmlPath, `${amplifyYmlPath}.backup`);
        info(`Backed up existing amplify.yml to amplify.yml.backup`);
      }
      
      // Apply new file
      fs.copyFileSync(amplifyYmlNewPath, amplifyYmlPath);
      success(`Applied clean amplify.yml configuration`);
    } else {
      warning(`amplify.yml.new not found, skipping`);
    }
    
    // Apply next.config.js
    const nextConfigPath = path.join(process.cwd(), 'next.config.js');
    const nextConfigNewPath = path.join(process.cwd(), 'next.config.js.new');
    
    if (fs.existsSync(nextConfigNewPath)) {
      // Backup existing file
      if (fs.existsSync(nextConfigPath)) {
        fs.copyFileSync(nextConfigPath, `${nextConfigPath}.backup`);
        info(`Backed up existing next.config.js to next.config.js.backup`);
      }
      
      // Apply new file
      fs.copyFileSync(nextConfigNewPath, nextConfigPath);
      success(`Applied clean next.config.js configuration`);
    } else {
      warning(`next.config.js.new not found, skipping`);
    }
    
    // Apply package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJsonNewPath = path.join(process.cwd(), 'package.json.new');
    
    if (fs.existsSync(packageJsonNewPath)) {
      // Backup existing file
      if (fs.existsSync(packageJsonPath)) {
        fs.copyFileSync(packageJsonPath, `${packageJsonPath}.backup`);
        info(`Backed up existing package.json to package.json.backup`);
      }
      
      // Apply new file
      fs.copyFileSync(packageJsonNewPath, packageJsonPath);
      success(`Applied clean package.json configuration`);
    } else {
      warning(`package.json.new not found, skipping`);
    }
    
    // Clean up temporary files
    if (fs.existsSync(amplifyYmlNewPath)) {
      fs.unlinkSync(amplifyYmlNewPath);
    }
    
    if (fs.existsSync(nextConfigNewPath)) {
      fs.unlinkSync(nextConfigNewPath);
    }
    
    if (fs.existsSync(packageJsonNewPath)) {
      fs.unlinkSync(packageJsonNewPath);
    }
    
    success(`Cleaned up temporary files`);
    
    // Install dependencies
    info(`Installing dependencies...`);
    execSync('npm install', { stdio: 'inherit' });
    
    success(`Successfully applied clean configuration`);
    return true;
  } catch (err) {
    error(`Failed to apply clean configuration: ${err.message}`);
    return false;
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  const result = applyCleanConfig();
  process.exit(result ? 0 : 1);
}

module.exports = { applyCleanConfig };
