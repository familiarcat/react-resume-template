/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function verifyStaticBuild() {
  const outDir = path.join(process.cwd(), 'out');
  
  // Check if out directory exists
  if (!fs.existsSync(outDir)) {
    throw new Error('Static export directory "out" not found');
  }

  // Check for critical files
  const requiredFiles = [
    'index.html',
    '_next/static',
  ];

  log('Verifying static export...');
  
  for (const file of requiredFiles) {
    const filePath = path.join(outDir, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing required file/directory: ${file}`);
    }
    const isDirectory = fs.statSync(filePath).isDirectory();
    log(`✓ Found ${isDirectory ? 'directory' : 'file'}: ${file}`);
  }

  // List contents of out directory
  log('\nContents of out directory:');
  const files = fs.readdirSync(outDir);
  files.forEach(file => {
    const stats = fs.statSync(path.join(outDir, file));
    log(`- ${file} (${stats.isDirectory() ? 'directory' : 'file'})`);
  });

  log('Static export verification completed successfully');
}

try {
  verifyStaticBuild();
} catch (error) {
  console.error(`Build verification failed: ${error.message}`);
  process.exit(1);
}