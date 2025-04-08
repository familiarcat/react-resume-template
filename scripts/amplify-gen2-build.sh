#!/bin/bash

# This script is a simplified build script for AWS Amplify Gen 2
# It handles the build process with better error handling and logging

set -e # Exit on error

echo "=== AWS Amplify Gen 2 Build Script ==="

# Check Node.js version
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Clean up
echo "Cleaning up..."
rm -rf .next

# Install dependencies
echo "Installing dependencies..."
npm ci --legacy-peer-deps
npm install sharp --no-save

# Set up environment
echo "Setting up environment..."
export NODE_OPTIONS="--max-old-space-size=4096"
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# Copy the Amplify config
echo "Copying Amplify config..."
cp next.config.amplify.js next.config.js

# Run the build
echo "Running build..."
npm run build

# Check if build was successful
if [ -f ".next/build-manifest.json" ]; then
  echo "Build successful!"
  echo "Contents of .next directory:"
  ls -la .next
else
  echo "Build failed!"
  exit 1
fi

echo "=== Build completed successfully ==="
