/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function verifyBuild() {
  const nextDir = path.join(process.cwd(), '.next');
  const standaloneDir = path.join(nextDir, 'standalone');
  
  // Required files to check
  const requiredFiles = [
    '.next/required-server-files.json',
    '.next/build-manifest.json',
    '.next/server/pages-manifest.json'
  ];

  // Verify each required file
  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing required file: ${file}`);
    }
    log(`✓ Found ${file}`);
  }

  // Ensure standalone directory exists
  if (!fs.existsSync(standaloneDir)) {
    fs.mkdirSync(standaloneDir, { recursive: true });
  }

  // Copy necessary files to standalone
  fs.cpSync(path.join(nextDir, 'required-server-files.json'), 
           path.join(standaloneDir, '.next', 'required-server-files.json'), 
           { recursive: true });

  log('Build verification completed successfully');
}

try {
  verifyBuild();
} catch (error) {
  console.error(`Build verification failed: ${error.message}`);
  process.exit(1);
}
