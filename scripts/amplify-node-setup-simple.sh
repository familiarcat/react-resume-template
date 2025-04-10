#!/bin/bash

# This script sets up Node.js for AWS Amplify builds
# It uses the pre-installed Node.js version in the Amplify environment

echo "=== Setting up Node.js for Amplify ==="

# Check the current Node.js version
CURRENT_NODE_VERSION=$(node --version 2>/dev/null || echo "none")
echo "Current Node.js version: $CURRENT_NODE_VERSION"

# Check npm version
NPM_VERSION=$(npm --version 2>/dev/null || echo "none")
echo "Current npm version: $NPM_VERSION"

# Print environment information
echo "Environment information:"
echo "OS: $(uname -a)"
echo "PATH: $PATH"
echo "PWD: $(pwd)"

# List available Node.js versions
echo "Available Node.js versions:"
ls -la /usr/local/bin/node* 2>/dev/null || echo "No Node.js versions found in /usr/local/bin"
ls -la /usr/bin/node* 2>/dev/null || echo "No Node.js versions found in /usr/bin"

# Check if nvm is available without using command -v
if [ -f "$HOME/.nvm/nvm.sh" ]; then
  echo "nvm script found, sourcing it"
  source "$HOME/.nvm/nvm.sh"
  
  # Try to use nvm to install Node.js
  echo "Attempting to install Node.js 18.19.0 with nvm"
  nvm install 18.19.0
  nvm use 18.19.0
  
  # Check if it worked
  NEW_NODE_VERSION=$(node --version 2>/dev/null || echo "none")
  echo "Node.js version after nvm: $NEW_NODE_VERSION"
  
  if [ "$NEW_NODE_VERSION" = "v18.19.0" ]; then
    echo "Successfully installed Node.js 18.19.0 with nvm"
    exit 0
  else
    echo "Failed to install Node.js 18.19.0 with nvm"
  fi
else
  echo "nvm script not found"
fi

# If we get here, we couldn't install Node.js 18.19.0
# Just use whatever version is available
echo "Using the default Node.js version"
node --version
npm --version

# Exit successfully to continue the build
exit 0
