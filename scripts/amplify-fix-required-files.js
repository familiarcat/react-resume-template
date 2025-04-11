#!/usr/bin/env node

/**
 * Amplify Fix Required Files
 * 
 * This script ensures that all required files for Amplify Gen 2 deployment
 * are in the correct locations.
 */

const fs = require('fs');
const path = require('path');

console.log('Fixing required files for Amplify Gen 2 deployment...');

// Create required-server-files.json
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

// Create routes-manifest.json
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

// Create build-manifest.json
const buildManifest = {
  polyfillFiles: [],
  devFiles: [],
  ampDevFiles: [],
  lowPriorityFiles: [],
  rootMainFiles: [],
  pages: {
    "/_app": [],
    "/": []
  },
  ampFirstPages: []
};

// List of all possible locations where Amplify might look for required files
const locations = [
  '.next',
  '.next/server',
  'out',
  'out/.next',
  'out/.next/server',
  '.',
  'server',
  '.amplify-hosting'
];

// Create directories if they don't exist
locations.forEach(location => {
  const dirPath = path.join(process.cwd(), location);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${location}`);
  }
});

// Write required-server-files.json to all locations
locations.forEach(location => {
  const filePath = path.join(process.cwd(), location, 'required-server-files.json');
  fs.writeFileSync(filePath, JSON.stringify(requiredServerFiles, null, 2));
  console.log(`Created required-server-files.json in ${location}`);
});

// Write routes-manifest.json to all locations
locations.forEach(location => {
  const filePath = path.join(process.cwd(), location, 'routes-manifest.json');
  fs.writeFileSync(filePath, JSON.stringify(routesManifest, null, 2));
  console.log(`Created routes-manifest.json in ${location}`);
});

// Write build-manifest.json to all locations
locations.forEach(location => {
  const filePath = path.join(process.cwd(), location, 'build-manifest.json');
  fs.writeFileSync(filePath, JSON.stringify(buildManifest, null, 2));
  console.log(`Created build-manifest.json in ${location}`);
});

console.log('All required files have been created in all possible locations.');
