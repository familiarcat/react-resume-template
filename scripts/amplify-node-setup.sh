#!/bin/bash

# This script sets up Node.js for AWS Amplify builds
# It doesn't rely on nvm, which might not be available in all environments

echo "=== Setting up Node.js for Amplify ==="

# Check if we're already using the right Node.js version
CURRENT_NODE_VERSION=$(node --version 2>/dev/null || echo "none")
TARGET_NODE_VERSION="v18.19.0"

echo "Current Node.js version: $CURRENT_NODE_VERSION"
echo "Target Node.js version: $TARGET_NODE_VERSION"

if [ "$CURRENT_NODE_VERSION" = "$TARGET_NODE_VERSION" ]; then
  echo "Already using the correct Node.js version"
  exit 0
fi

# Try to use nvm if available
if command -v nvm &> /dev/null; then
  echo "nvm is available, using it to install Node.js"
  nvm install 18.19.0
  nvm use 18.19.0
  exit $?
fi

# If nvm is not available, try to install Node.js directly
echo "nvm not available, trying to install Node.js directly"

# Check if we're running on Amazon Linux
if [ -f /etc/os-release ]; then
  . /etc/os-release
  if [[ "$ID" == "amzn" ]]; then
    echo "Running on Amazon Linux, using yum to install Node.js"
    curl -sL https://rpm.nodesource.com/setup_18.x | sudo -E bash -
    sudo yum install -y nodejs
    exit $?
  fi
fi

# For other Linux distributions, try to use the NodeSource repository
if command -v apt-get &> /dev/null; then
  echo "apt-get is available, using it to install Node.js"
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
  exit $?
fi

echo "Could not install Node.js 18.19.0"
exit 1
