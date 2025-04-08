/**
 * Custom build hooks for AWS Amplify
 * 
 * This file contains hooks that will be executed during the build process
 * to help diagnose and fix deployment issues.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Pre-build hook - runs before the build starts
 */
exports.preBuild = {
  onBuildStart: ({ appId, branchName, buildId }) => {
    console.log('=== PRE-BUILD HOOK STARTED ===');
    console.log(`App ID: ${appId}`);
    console.log(`Branch: ${branchName}`);
    console.log(`Build ID: ${buildId}`);
    
    // Log system information
    console.log('\n=== SYSTEM INFO ===');
    console.log(`Node version: ${process.version}`);
    console.log(`NPM version: ${execSync('npm --version').toString().trim()}`);
    console.log(`Operating system: ${process.platform}`);
    console.log(`Architecture: ${process.arch}`);
    console.log(`Current directory: ${process.cwd()}`);
    
    // Check for required files
    console.log('\n=== CHECKING REQUIRED FILES ===');
    const requiredFiles = [
      'package.json',
      'next.config.js',
      '.npmrc',
      '.nvmrc',
      'amplify.yml'
    ];
    
    requiredFiles.forEach(file => {
      const exists = fs.existsSync(path.join(process.cwd(), file));
      console.log(`${file}: ${exists ? 'FOUND' : 'MISSING'}`);
    });
    
    // Check package.json
    try {
      const packageJson = require('./package.json');
      console.log('\n=== PACKAGE.JSON INFO ===');
      console.log(`Name: ${packageJson.name}`);
      console.log(`Version: ${packageJson.version}`);
      console.log(`Node engine: ${packageJson.engines?.node || 'Not specified'}`);
      console.log(`Has build script: ${!!packageJson.scripts?.build}`);
      console.log(`Has amplify-build script: ${!!packageJson.scripts?.['amplify-build']}`);
      console.log(`Dependencies count: ${Object.keys(packageJson.dependencies || {}).length}`);
      console.log(`DevDependencies count: ${Object.keys(packageJson.devDependencies || {}).length}`);
    } catch (error) {
      console.error('Error reading package.json:', error);
    }
    
    console.log('\n=== PRE-BUILD HOOK COMPLETED ===');
  }
};

/**
 * Post-build hook - runs after the build completes
 */
exports.postBuild = {
  onBuildSuccess: ({ appId, branchName, buildId }) => {
    console.log('\n=== POST-BUILD HOOK STARTED ===');
    console.log(`Build successful for app ${appId}, branch ${branchName}, build ${buildId}`);
    
    // Check the .next directory
    console.log('\n=== CHECKING BUILD OUTPUT ===');
    const nextDir = path.join(process.cwd(), '.next');
    
    if (fs.existsSync(nextDir)) {
      console.log('.next directory exists');
      
      // Check for key files in .next
      const nextFiles = ['server', 'static', 'build-manifest.json'];
      nextFiles.forEach(file => {
        const filePath = path.join(nextDir, file);
        console.log(`${file}: ${fs.existsSync(filePath) ? 'FOUND' : 'MISSING'}`);
      });
      
      // Log directory size
      try {
        const size = execSync(`du -sh ${nextDir}`).toString().trim();
        console.log(`Size of .next directory: ${size}`);
      } catch (error) {
        console.log('Could not determine size of .next directory');
      }
    } else {
      console.error('.next directory is missing!');
    }
    
    console.log('\n=== POST-BUILD HOOK COMPLETED ===');
  },
  
  onBuildFail: ({ appId, branchName, buildId }) => {
    console.log('\n=== POST-BUILD FAILURE HOOK STARTED ===');
    console.log(`Build failed for app ${appId}, branch ${branchName}, build ${buildId}`);
    
    // Check for common error indicators in logs
    console.log('\n=== CHECKING FOR COMMON ERRORS ===');
    
    try {
      // Look for error logs
      const logDir = '/var/log/amplify';
      if (fs.existsSync(logDir)) {
        const logFiles = fs.readdirSync(logDir)
          .filter(file => file.endsWith('.log'))
          .sort((a, b) => fs.statSync(path.join(logDir, b)).mtime.getTime() - 
                          fs.statSync(path.join(logDir, a)).mtime.getTime());
        
        if (logFiles.length > 0) {
          const latestLog = path.join(logDir, logFiles[0]);
          console.log(`Checking latest log file: ${latestLog}`);
          
          const logContent = fs.readFileSync(latestLog, 'utf8');
          
          // Check for common errors
          const errorPatterns = [
            { pattern: 'ENOSPC', message: 'Disk space issue detected' },
            { pattern: 'ENOMEM', message: 'Out of memory error detected' },
            { pattern: 'timed out', message: 'Timeout error detected' },
            { pattern: 'ERR! code EBADENGINE', message: 'Node.js version compatibility issue detected' },
            { pattern: 'ERR! code ELIFECYCLE', message: 'npm script error detected' },
            { pattern: 'Module not found', message: 'Module not found error detected' }
          ];
          
          errorPatterns.forEach(({ pattern, message }) => {
            if (logContent.includes(pattern)) {
              console.log(`ERROR: ${message}`);
            }
          });
        } else {
          console.log('No log files found');
        }
      } else {
        console.log('Log directory not found');
      }
    } catch (error) {
      console.error('Error checking logs:', error);
    }
    
    console.log('\n=== POST-BUILD FAILURE HOOK COMPLETED ===');
  }
};
