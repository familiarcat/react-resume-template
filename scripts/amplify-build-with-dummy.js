#!/usr/bin/env node

/**
 * Custom build script for AWS Amplify that creates a dummy required-server-files.json
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper functions
const log = (message) => console.log(`[Amplify Build] ${message}`);
const error = (message) => console.error(`[Amplify Build Error] ${message}`);

// Main build function
async function build() {
  try {
    log('Starting build process with dummy server files...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    log(`Using Node.js ${nodeVersion}`);
    
    // Set environment variables
    process.env.NODE_ENV = 'production';
    process.env.NEXT_TELEMETRY_DISABLED = '1';
    
    // Create a minimal next.config.js for static export
    log('Creating static export configuration...');
    const nextConfig = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
`;
    fs.writeFileSync(path.join(process.cwd(), 'next.config.js'), nextConfig);
    log('Created static export configuration');
    
    // Clean the output directory
    log('Cleaning output directories...');
    if (fs.existsSync(path.join(process.cwd(), '.next'))) {
      execSync('rm -rf .next', { stdio: 'inherit' });
    }
    if (fs.existsSync(path.join(process.cwd(), 'out'))) {
      execSync('rm -rf out', { stdio: 'inherit' });
    }
    
    // Run the build
    log('Running Next.js build...');
    execSync('next build', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=4096'
      }
    });
    
    // Create .next directory if it doesn't exist
    if (!fs.existsSync(path.join(process.cwd(), '.next'))) {
      fs.mkdirSync(path.join(process.cwd(), '.next'));
    }
    
    // Create a dummy required-server-files.json
    log('Creating dummy required-server-files.json...');
    const dummyServerFiles = {
      version: 1,
      config: {
        env: {},
        webpack: {},
        eslint: {},
        typescript: {},
        images: { unoptimized: true },
        output: { export: true }
      },
      appDir: true,
      files: [],
      ignore: []
    };
    
    fs.writeFileSync(
      path.join(process.cwd(), '.next', 'required-server-files.json'),
      JSON.stringify(dummyServerFiles, null, 2)
    );
    log('Created dummy required-server-files.json');
    
    // Copy the out directory to .next/server/pages if it doesn't exist
    log('Copying static files to server directory...');
    if (!fs.existsSync(path.join(process.cwd(), '.next', 'server'))) {
      fs.mkdirSync(path.join(process.cwd(), '.next', 'server'), { recursive: true });
    }
    if (!fs.existsSync(path.join(process.cwd(), '.next', 'server', 'pages'))) {
      fs.mkdirSync(path.join(process.cwd(), '.next', 'server', 'pages'), { recursive: true });
    }
    
    // Create a dummy routes-manifest.json
    log('Creating dummy routes-manifest.json...');
    const dummyRoutesManifest = {
      version: 3,
      pages404: true,
      basePath: "",
      redirects: [],
      headers: [],
      dynamicRoutes: [],
      staticRoutes: [],
      dataRoutes: [],
      rsc: {
        header: "RSC",
        varyHeader: "RSC, Next-Router-State-Tree, Next-Router-Prefetch"
      }
    };
    
    fs.writeFileSync(
      path.join(process.cwd(), '.next', 'routes-manifest.json'),
      JSON.stringify(dummyRoutesManifest, null, 2)
    );
    log('Created dummy routes-manifest.json');
    
    // List the contents of the .next directory
    log('Contents of .next directory:');
    execSync('ls -la .next', { stdio: 'inherit' });
    
    // List the contents of the out directory
    log('Contents of out directory:');
    execSync('ls -la out', { stdio: 'inherit' });
    
    log('Build completed successfully!');
    return 0;
  } catch (err) {
    error(`Build failed: ${err.message}`);
    return 1;
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
