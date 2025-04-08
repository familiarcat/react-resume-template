/* eslint-disable @typescript-eslint/no-require-imports */
const { existsSync, readdirSync, statSync, mkdirSync } = require('fs');
const { join } = require('path');

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function ensureDirectory(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    log(`Created directory: ${dir}`);
  }
  return dir;
}

function verifyDirectory(dir, required = false) {
  if (existsSync(dir)) {
    log(`✓ Directory exists: ${dir}`);
    const stats = statSync(dir);
    if (!stats.isDirectory()) {
      throw new Error(`Path exists but is not a directory: ${dir}`);
    }
    return true;
  } else if (required) {
    // Create the directory instead of throwing an error
    ensureDirectory(dir);
    return true;
  }
  return false;
}

function verifyFile(filepath, required = false) {
  if (existsSync(filepath)) {
    log(`✓ File exists: ${filepath}`);
    const stats = statSync(filepath);
    if (!stats.isFile()) {
      throw new Error(`Path exists but is not a file: ${filepath}`);
    }
    return true;
  } else if (required) {
    throw new Error(`Required file missing: ${filepath}`);
  }
  return false;
}

function verifyBuild() {
  const nextDir = join(process.cwd(), '.next');
  const standaloneDir = join(nextDir, 'standalone');
  const standaloneNextDir = join(standaloneDir, '.next');

  // Verify directory structure
  verifyDirectory(nextDir, true);
  verifyDirectory(standaloneDir, true);
  verifyDirectory(standaloneNextDir, true);

  // Required files
  const requiredFiles = [
    { path: join(nextDir, 'required-server-files.json'), name: 'Required server files' },
    { path: join(nextDir, 'build-manifest.json'), name: 'Build manifest' },
    { path: join(standaloneDir, 'server.js'), name: 'Server entry' },
    { path: join(standaloneNextDir, 'required-server-files.json'), name: 'Standalone required server files' }
  ];

  // Verify each required file
  requiredFiles.forEach(file => {
    verifyFile(file.path, true);
  });

  // List standalone directory contents
  if (verifyDirectory(standaloneDir)) {
    const contents = readdirSync(standaloneDir);
    log('\nStandalone directory contents:');
    contents.forEach(item => {
      const itemPath = join(standaloneDir, item);
      const stats = statSync(itemPath);
      log(`  ${stats.isDirectory() ? 'd' : 'f'} ${item}`);
    });
  }

  log('\nBuild verification completed successfully');
}

try {
  verifyBuild();
} catch (error) {
  console.error(`\nError: ${error.message}`);
  process.exit(1);
}
