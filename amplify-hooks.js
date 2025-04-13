/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Custom build hooks for AWS Amplify
 *
 * This file contains hooks that will be executed during the build process
 * to help diagnose and fix deployment issues.
 */

// Import required modules
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Helper function to sanitize strings for logging
function sanitize(str) {
  return String(str).replace(/[\n\r]/g, ' ').substring(0, 200);
}

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
      'amplify.yml',
      'scripts/fix-parcel-watcher.js'
    ];

    requiredFiles.forEach(file => {
      const exists = fs.existsSync(path.join(process.cwd(), file));
      console.log(`${file}: ${exists ? 'FOUND' : 'MISSING'}`);
    });

    // Check for @parcel/watcher dependencies
    console.log('\n=== CHECKING PARCEL WATCHER ===');
    try {
      // Check if the package is installed
      const parcelWatcherPath = path.join(process.cwd(), 'node_modules', '@parcel', 'watcher');
      const parcelWatcherExists = fs.existsSync(parcelWatcherPath);
      console.log(`@parcel/watcher installed: ${parcelWatcherExists ? 'YES' : 'NO'}`);

      // Check for platform-specific binaries
      const platforms = [
        'linux-x64-glibc',
        'darwin-x64',
        'darwin-arm64',
        'win32-x64'
      ];

      platforms.forEach(platform => {
        const platformPath = path.join(process.cwd(), 'node_modules', '@parcel', `watcher-${platform}`);
        const platformExists = fs.existsSync(platformPath);
        console.log(`@parcel/watcher-${platform}: ${platformExists ? 'FOUND' : 'MISSING'}`);
      });

      // Try to run the fix-parcel-watcher script
      console.log('Running fix-parcel-watcher.js...');
      try {
        execSync('node scripts/fix-parcel-watcher.js', { stdio: 'inherit' });
        console.log('fix-parcel-watcher.js executed successfully');
      } catch (scriptError) {
        console.error('Error running fix-parcel-watcher.js:', sanitize(scriptError.message));
      }
    } catch (error) {
      console.error('Error checking @parcel/watcher:', sanitize(error.message));
    }

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
      const nextFiles = ['server', 'static', 'build-manifest.json', 'routes-manifest.json', 'required-server-files.json'];
      nextFiles.forEach(file => {
        const filePath = path.join(nextDir, file);
        console.log(`${sanitize(file)}: ${fs.existsSync(filePath) ? 'FOUND' : 'MISSING'}`);
      });

      // Check for server directory contents
      const serverDir = path.join(nextDir, 'server');
      if (fs.existsSync(serverDir)) {
        console.log('\n=== SERVER DIRECTORY CONTENTS ===');
        try {
          const serverFiles = fs.readdirSync(serverDir);
          console.log(`Server directory contains ${serverFiles.length} items`);
          serverFiles.slice(0, 5).forEach(file => {
            console.log(`- ${sanitize(file)}`);
          });
          if (serverFiles.length > 5) {
            console.log(`... and ${serverFiles.length - 5} more items`);
          }
        } catch (dirError) {
          console.error('Error reading server directory:', sanitize(dirError.message));
        }
      }

      // Log directory size
      try {
        const size = execSync(`du -sh ${nextDir}`).toString().trim();
        console.log(`Size of .next directory: ${size}`);
      } catch (sizeError) {
        console.log('Could not determine size of .next directory');
      }
    } else {
      console.error('.next directory is missing!');
    }

    // Check for required-server-files.json in root
    const requiredServerFilesPath = path.join(process.cwd(), 'required-server-files.json');
    console.log(`required-server-files.json in root: ${fs.existsSync(requiredServerFilesPath) ? 'FOUND' : 'MISSING'}`);

    // Check for @parcel/watcher in node_modules
    console.log('\n=== CHECKING PARCEL WATCHER (POST-BUILD) ===');
    const parcelWatcherPath = path.join(process.cwd(), 'node_modules', '@parcel', 'watcher');
    console.log(`@parcel/watcher: ${fs.existsSync(parcelWatcherPath) ? 'FOUND' : 'MISSING'}`);

    // Check for linux-specific watcher
    const linuxWatcherPath = path.join(process.cwd(), 'node_modules', '@parcel', 'watcher-linux-x64-glibc');
    console.log(`@parcel/watcher-linux-x64-glibc: ${fs.existsSync(linuxWatcherPath) ? 'FOUND' : 'MISSING'}`);

    // Try to fix parcel watcher if missing
    if (!fs.existsSync(linuxWatcherPath)) {
      console.log('Attempting to install @parcel/watcher-linux-x64-glibc...');
      try {
        execSync('npm install @parcel/watcher-linux-x64-glibc --no-save', { stdio: 'inherit' });
        console.log('@parcel/watcher-linux-x64-glibc installed successfully');
      } catch (installError) {
        console.error('Error installing @parcel/watcher-linux-x64-glibc:', sanitize(installError.message));
      }
    }

    console.log('\n=== POST-BUILD HOOK COMPLETED ===');
  },

  onBuildFail: ({ appId, branchName, buildId }) => {
    console.log('\n=== POST-BUILD FAILURE HOOK STARTED ===');
    console.log(`Build failed for app ${appId}, branch ${branchName}, build ${buildId}`);

    // Check for common error indicators in logs
    console.log('\n=== CHECKING FOR COMMON ERRORS ===');

    // Check for @parcel/watcher issues
    console.log('\n=== CHECKING FOR PARCEL WATCHER ISSUES ===');
    const parcelWatcherPath = path.join(process.cwd(), 'node_modules', '@parcel', 'watcher');
    console.log(`@parcel/watcher: ${fs.existsSync(parcelWatcherPath) ? 'FOUND' : 'MISSING'}`);

    // Check for linux-specific watcher
    const linuxWatcherPath = path.join(process.cwd(), 'node_modules', '@parcel', 'watcher-linux-x64-glibc');
    console.log(`@parcel/watcher-linux-x64-glibc: ${fs.existsSync(linuxWatcherPath) ? 'FOUND' : 'MISSING'}`);

    // Try to fix parcel watcher if missing
    if (!fs.existsSync(linuxWatcherPath)) {
      console.log('Attempting to install @parcel/watcher-linux-x64-glibc...');
      try {
        execSync('npm install @parcel/watcher-linux-x64-glibc --no-save', { stdio: 'inherit' });
        console.log('@parcel/watcher-linux-x64-glibc installed successfully');
      } catch (installError) {
        console.error('Error installing @parcel/watcher-linux-x64-glibc:', sanitize(installError.message));
      }
    }

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
          console.log(`Checking latest log file: ${sanitize(latestLog)}`);

          const logContent = fs.readFileSync(latestLog, 'utf8');

          // Check for common errors
          const errorPatterns = [
            { pattern: 'ENOSPC', message: 'Disk space issue detected' },
            { pattern: 'ENOMEM', message: 'Out of memory error detected' },
            { pattern: 'timed out', message: 'Timeout error detected' },
            { pattern: 'ERR! code EBADENGINE', message: 'Node.js version compatibility issue detected' },
            { pattern: 'ERR! code ELIFECYCLE', message: 'npm script error detected' },
            { pattern: 'Module not found', message: 'Module not found error detected' },
            { pattern: '@parcel/watcher', message: '@parcel/watcher issue detected' },
            { pattern: 'No prebuild or local build of @parcel/watcher found', message: '@parcel/watcher platform-specific binary missing' }
          ];

          errorPatterns.forEach(({ pattern, message }) => {
            if (logContent.includes(pattern)) {
              console.log(`ERROR: ${message}`);

              // If parcel watcher issue is detected, try to fix it
              if (pattern === '@parcel/watcher' && !fs.existsSync(linuxWatcherPath)) {
                console.log('Attempting to fix @parcel/watcher issue...');
                try {
                  execSync('npm install @parcel/watcher-linux-x64-glibc --no-save', { stdio: 'inherit' });
                  console.log('@parcel/watcher-linux-x64-glibc installed successfully');
                } catch (fixError) {
                  console.error('Error fixing @parcel/watcher:', sanitize(fixError.message));
                }
              }
            }
          });
        } else {
          console.log('No log files found');
        }
      } else {
        console.log('Log directory not found');
      }
    } catch (error) {
      console.error('Error checking logs:', sanitize(error.message));
    }

    console.log('\n=== POST-BUILD FAILURE HOOK COMPLETED ===');
  }
};
