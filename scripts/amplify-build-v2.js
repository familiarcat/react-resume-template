#!/usr/bin/env node

/**
 * This script is a simplified build script for AWS Amplify Gen 2
 * It handles the build process with better error handling and logging
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper functions
const log = (message) => {
  console.log(`[Amplify Build] ${message}`);
};

const error = (message) => {
  console.error(`[Amplify Build Error] ${message}`);
};

// Main build function
async function build() {
  try {
    log('Starting build process for Amplify Gen 2...');

    // Check Node.js version
    const nodeVersion = process.version;
    log(`Using Node.js ${nodeVersion}`);

    // Install Amplify Gen 2 dependencies
    log('Installing Amplify Gen 2 dependencies...');
    execSync('npm run amplify:gen2:install-deps', { stdio: 'inherit' });
    log('Amplify Gen 2 dependencies installed successfully.');

    // Run the fast deployment
    log('Running fast deployment...');
    execSync('npm run amplify:gen2:fast', { stdio: 'inherit' });
    log('Fast deployment completed successfully.');

    // Create DynamoDB tables
    log('Creating DynamoDB tables...');
    execSync('npm run amplify:gen2:create-tables', { stdio: 'inherit' });
    log('DynamoDB tables created successfully.');

    // Check if .next directory exists and clean it if it does
    const nextDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(nextDir)) {
      log('Cleaning .next directory...');
      fs.rmSync(nextDir, { recursive: true, force: true });
    }

    // Create .next directory
    log('Creating .next directory...');
    fs.mkdirSync(nextDir, { recursive: true });

    // Set environment variables
    process.env.NODE_ENV = 'production';
    process.env.NEXT_TELEMETRY_DISABLED = '1';

    // Run the build
    log('Running Next.js build...');
    execSync('node scripts/amplify-static-build.js', {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=4096'
      }
    });

    // Check if build was successful
    if (!fs.existsSync(path.join(nextDir, 'build-manifest.json'))) {
      throw new Error('Build failed: build-manifest.json not found');
    }

    // List the contents of the .next directory
    log('Contents of .next directory:');
    const files = fs.readdirSync(nextDir);
    files.forEach(file => {
      const stats = fs.statSync(path.join(nextDir, file));
      log(`- ${file} (${stats.isDirectory() ? 'directory' : 'file'})`);
    });

    log('Build completed successfully!');
    return 0;
  } catch (err) {
    error(`Build failed: ${err.message}`);
    return 1;
  }
}

// Function to create required files for Amplify
function createRequiredFiles() {
  // Create required-server-files.json
  const requiredServerFilesPath = path.join(process.cwd(), '.next', 'required-server-files.json');
  if (!fs.existsSync(requiredServerFilesPath)) {
    log('Creating required-server-files.json...');
    const requiredServerFiles = {
      version: 1,
      config: {
        env: {},
        webpack: {},
        webpackDevMiddleware: {},
        eslint: {},
        typescript: {},
        headers: [],
        rewrites: [],
        redirects: [],
        regions: [],
        staticRoutes: [],
        dynamicRoutes: [],
        version: 'latest',
        configFileName: 'next.config.js',
        target: 'server',
        compress: true,
        reactStrictMode: true,
        poweredByHeader: false,
        generateEtags: true,
        pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
        trailingSlash: false,
        i18n: null,
        output: 'export',
        images: {
          unoptimized: true
        }
      },
      files: [],
      ignore: []
    };
    fs.writeFileSync(requiredServerFilesPath, JSON.stringify(requiredServerFiles, null, 2));
  }

  // Create routes-manifest.json
  const routesManifestPath = path.join(process.cwd(), '.next', 'routes-manifest.json');
  if (!fs.existsSync(routesManifestPath)) {
    log('Creating routes-manifest.json...');
    const routesManifest = {
      version: 3,
      pages404: true,
      basePath: "",
      redirects: [],
      headers: [],
      dynamicRoutes: [],
      staticRoutes: [],
      dataRoutes: [],
      rewrites: []
    };
    fs.writeFileSync(routesManifestPath, JSON.stringify(routesManifest, null, 2));
  }

  // Copy files to out directory if it exists
  const outDir = path.join(process.cwd(), 'out');
  if (fs.existsSync(outDir)) {
    // Create .next directory in out directory if it doesn't exist
    const outNextDir = path.join(outDir, '.next');
    if (!fs.existsSync(outNextDir)) {
      fs.mkdirSync(outNextDir, { recursive: true });
    }

    // Copy required-server-files.json
    if (fs.existsSync(requiredServerFilesPath)) {
      fs.copyFileSync(
        requiredServerFilesPath,
        path.join(outNextDir, 'required-server-files.json')
      );
    }

    // Copy routes-manifest.json
    if (fs.existsSync(routesManifestPath)) {
      fs.copyFileSync(
        routesManifestPath,
        path.join(outNextDir, 'routes-manifest.json')
      );
    }
  }
}

// Run the build
build()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((err) => {
    error(`Unhandled error: ${err.message}`);
    process.exit(1);
  });
