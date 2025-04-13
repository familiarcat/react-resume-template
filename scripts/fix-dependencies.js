#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to package-lock.json
const packageLockPath = path.join(__dirname, '..', 'package-lock.json');

// Path to package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');

// Read the package-lock.json file
let packageLock;
try {
  packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
} catch (error) {
  console.error('Error reading package-lock.json:', error);
  // Continue without package-lock.json
}

// Read the package.json file
let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
} catch (error) {
  console.error('Error reading package.json:', error);
  process.exit(1);
}

// Check if we need to modify the execa dependency
let modified = false;

// Function to recursively search and fix execa dependencies
function fixExecaDependencies(dependencies) {
  if (!dependencies) return false;

  let changed = false;

  Object.keys(dependencies).forEach(depName => {
    const dep = dependencies[depName];

    // Check if this is execa with a version that requires Node.js >= 18.19.0
    if (depName === 'execa' && dep.version) {
      // Check if version is 9.x.x or higher
      const versionMatch = dep.version.match(/^([0-9]+)\./);
      if (versionMatch && parseInt(versionMatch[1]) >= 9) {
        console.log(`Found execa@${dep.version}, downgrading to 8.0.1 for Node.js 18.18.2 compatibility`);
        dep.version = '8.0.1';
        if (dep.resolved) {
          dep.resolved = dep.resolved.replace(/execa-[0-9]+\.[0-9]+\.[0-9]+\.tgz/, 'execa-8.0.1.tgz');
        }
        changed = true;
        modified = true;
      }
    }

    // Recursively check nested dependencies
    if (dep.dependencies && fixExecaDependencies(dep.dependencies)) {
      changed = true;
    }
  });

  return changed;
}

// Fix dependencies
fixExecaDependencies(packageLock.packages);

// Save the modified package-lock.json if changes were made
if (modified) {
  console.log('Saving modified package-lock.json');
  fs.writeFileSync(packageLockPath, JSON.stringify(packageLock, null, 2));
  console.log('package-lock.json updated successfully');
} else {
  console.log('No changes needed in package-lock.json');
}

// Now update package.json to pin execa to a compatible version
// Note: packageJson is already loaded at the top of the file

// Function to add optional dependencies for @parcel/watcher
function addParcelWatcherDependencies() {
  if (!packageJson.optionalDependencies) {
    packageJson.optionalDependencies = {};
  }

  // Add all platform-specific watcher packages
  const watcherPackages = [
    '@parcel/watcher-linux-x64-glibc',
    '@parcel/watcher-darwin-x64',
    '@parcel/watcher-darwin-arm64',
    '@parcel/watcher-win32-x64'
  ];

  let watcherModified = false;

  watcherPackages.forEach(pkg => {
    if (!packageJson.optionalDependencies[pkg]) {
      packageJson.optionalDependencies[pkg] = '*';
      watcherModified = true;
    }
  });

  return watcherModified;
}

// Add resolutions field to package.json
if (!packageJson.resolutions) {
  packageJson.resolutions = {};
}

packageJson.resolutions.execa = '8.0.1';

// Add @parcel/watcher dependencies
const parcelModified = addParcelWatcherDependencies();

// Save the modified package.json
console.log('Saving modified package.json');
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('package.json updated successfully');
