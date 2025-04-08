#!/bin/bash

# This script tests the Amplify build process locally
# It simulates the Amplify build environment as closely as possible

echo "=== TESTING AMPLIFY BUILD ==="

# Clean up
echo "Cleaning up..."
rm -rf .next
rm -f next.config.js.backup

# Set up environment
echo "Setting up environment..."
export NODE_OPTIONS="--max-old-space-size=4096"
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# Copy the Amplify config
echo "Copying Amplify config..."
cp next.config.amplify.js next.config.js.amplify
cp next.config.js next.config.js.original
cp next.config.amplify.js next.config.js

# Run the build
echo "Running build..."
npm run build

# Check if build was successful
if [ -f ".next/build-manifest.json" ]; then
  echo "Build successful!"
  # List the .next directory to verify contents
  echo "Contents of .next directory:"
  ls -la .next
else
  echo "Build failed!"
  # Restore original config
  cp next.config.js.original next.config.js
  rm next.config.js.amplify next.config.js.original
  exit 1
fi

# Restore original config
cp next.config.js.original next.config.js
rm next.config.js.amplify next.config.js.original

echo "=== TEST COMPLETED ==="
