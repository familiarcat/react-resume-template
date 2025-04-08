import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';

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
      '.next/server/pages-manifest.json'
    ];

    for (const file of requiredFiles) {
      if (!existsSync(file)) {
        throw new Error(`Missing required file: ${file}`);
      }
      log(`✓ Found ${file}`);
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