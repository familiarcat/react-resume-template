/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log(`Created directory: ${dir}`);
  }
}

function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
  log(`Copied ${src} to ${dest}`);
}

try {
  // Ensure we're using the Amplify config
  const amplifyConfig = path.join(process.cwd(), 'next.config.amplify.js');
  const nextConfig = path.join(process.cwd(), 'next.config.js');
  
  if (fs.existsSync(amplifyConfig)) {
    copyFile(amplifyConfig, nextConfig);
  }

  // Ensure .next directory exists
  ensureDirectory(path.join(process.cwd(), '.next'));
  
  // Ensure standalone directory exists
  ensureDirectory(path.join(process.cwd(), '.next', 'standalone'));
  
  log('Build preparation completed successfully');
} catch (error) {
  console.error('Build preparation failed:', error);
  process.exit(1);
}