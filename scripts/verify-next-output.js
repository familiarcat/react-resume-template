/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function verifyNextOutput() {
  const nextDir = path.join(process.cwd(), '.next');
  const standaloneDir = path.join(nextDir, 'standalone');
  const requiredFiles = [
    {
      path: 'required-server-files.json',
      directory: nextDir,
      critical: true
    },
    {
      path: 'build-manifest.json',
      directory: nextDir,
      critical: true
    },
    {
      path: 'server/pages-manifest.json',
      directory: nextDir,
      critical: true
    }
  ];

  log('=== Verifying Next.js Build Output ===');
  log(`Checking .next directory: ${nextDir}`);
  
  if (!fs.existsSync(nextDir)) {
    throw new Error('.next directory does not exist');
  }

  // List all files in .next directory
  log('\nContents of .next directory:');
  const files = fs.readdirSync(nextDir);
  files.forEach(file => {
    const stats = fs.statSync(path.join(nextDir, file));
    log(`- ${file} (${stats.isDirectory() ? 'directory' : 'file'})`);
  });

  // Verify each required file
  log('\nChecking required files:');
  const missing = [];
  requiredFiles.forEach(({ path: filePath, directory, critical }) => {
    const fullPath = path.join(directory, filePath);
    if (!fs.existsSync(fullPath)) {
      const message = `${critical ? 'CRITICAL' : 'WARNING'}: Missing ${filePath}`;
      log(`❌ ${message}`);
      if (critical) {
        missing.push(filePath);
      }
    } else {
      log(`✓ Found ${filePath}`);
    }
  });

  if (missing.length > 0) {
    throw new Error(`Missing critical files: ${missing.join(', ')}`);
  }

  // Ensure standalone directory structure
  if (!fs.existsSync(standaloneDir)) {
    log('\nCreating standalone directory structure...');
    fs.mkdirSync(path.join(standaloneDir, '.next'), { recursive: true });
  }

  // Copy required files to standalone
  log('\nCopying files to standalone directory...');
  requiredFiles.forEach(({ path: filePath }) => {
    const source = path.join(nextDir, filePath);
    const dest = path.join(standaloneDir, '.next', filePath);
    if (fs.existsSync(source)) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(source, dest);
      log(`✓ Copied ${filePath} to standalone`);
    }
  });

  log('\n=== Verification completed successfully ===');
}

try {
  verifyNextOutput();
} catch (error) {
  console.error(`\n❌ Verification failed: ${error.message}`);
  process.exit(1);
}