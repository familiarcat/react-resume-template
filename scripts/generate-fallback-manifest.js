#!/usr/bin/env node

/**
 * This script generates a fallback-build-manifest.json file for Next.js
 * This helps prevent errors during development and deployment
 */

const fs = require('fs');
const path = require('path');

// Define the .next directory path
const nextDir = path.join(process.cwd(), '.next');

// Create the .next directory if it doesn't exist
if (!fs.existsSync(nextDir)) {
  console.log('Creating .next directory...');
  fs.mkdirSync(nextDir, { recursive: true });
}

// Define the fallback manifest path
const fallbackManifestPath = path.join(nextDir, 'fallback-build-manifest.json');

// Create a basic fallback manifest
const fallbackManifest = {
  pages: {
    '/_app': [],
    '/_error': [],
    '/': [],
    '/_document': [],
    '/404': [],
    '/500': []
  },
  devFiles: [],
  ampDevFiles: [],
  polyfillFiles: [],
  lowPriorityFiles: [],
  rootMainFiles: [],
  ampFirstPages: []
};

// Write the fallback manifest to file
try {
  fs.writeFileSync(fallbackManifestPath, JSON.stringify(fallbackManifest, null, 2));
  console.log(`Successfully created fallback manifest at ${fallbackManifestPath}`);
} catch (error) {
  console.error('Error creating fallback manifest:', error);
  process.exit(1);
}

// Check if the file was created successfully
if (fs.existsSync(fallbackManifestPath)) {
  console.log('Fallback manifest file created successfully!');
} else {
  console.error('Failed to create fallback manifest file!');
  process.exit(1);
}

// Exit successfully
process.exit(0);
