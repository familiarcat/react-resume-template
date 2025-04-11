import { execSync } from 'child_process';
import { existsSync, rmSync, statSync, mkdirSync } from 'fs';


function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

async function build() {
  try {
    // Clean previous build
    log('Cleaning previous build...');
    if (existsSync('.next')) {
      rmSync('.next', { recursive: true, force: true });
    }
    if (existsSync('standalone')) {
      rmSync('standalone', { recursive: true, force: true });
    }

    // Set environment variables
    process.env.NODE_ENV = 'production';
    process.env.NEXT_TELEMETRY_DISABLED = '1';
    process.env.NODE_OPTIONS = '--max-old-space-size=4096';

    // Run the build
    log('Running Next.js build...');
    execSync('next build', { stdio: 'inherit' });

    // Verify build output
    const requiredFiles = [
      '.next/required-server-files.json',
      '.next/build-manifest.json',
      '.next/prerender-manifest.json',
      '.next/server/pages-manifest.json',
      '.next/static',
      'standalone'
    ];

    for (const file of requiredFiles) {
      if (!existsSync(file)) {
        throw new Error(`Missing required file/directory: ${file}`);
      }
      const isDirectory = statSync(file).isDirectory();
      log(`✓ Found ${isDirectory ? 'directory' : 'file'}: ${file}`);
    }

    // Copy necessary files to standalone directory
    log('Setting up standalone directory...');
    if (!existsSync('standalone/.next')) {
      mkdirSync('standalone/.next', { recursive: true });
    }
    
    // Copy public directory if it exists
    if (existsSync('public')) {
      execSync('cp -r public standalone/');
    }

    log('Build completed successfully!');
    return 0;
  } catch (error) {
    log(`Build failed: ${error.message}`);
    return 1;
  }
}

build()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
