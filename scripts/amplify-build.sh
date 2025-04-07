#!/bin/bash

# Print current versions
echo "Current Node version: $(node --version)"
echo "Current NPM version: $(npm --version)"

# Install and use the required Node.js version
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

# Install the required Node.js version if not already installed
if ! nvm ls 18.19.0 > /dev/null; then
  echo "Installing Node.js 18.19.0..."
  nvm install 18.19.0
fi

# Use the required Node.js version
echo "Switching to Node.js 18.19.0..."
nvm use 18.19.0

# Print new versions
echo "New Node version: $(node --version)"
echo "New NPM version: $(npm --version)"

# Install dependencies with legacy peer deps
echo "Installing dependencies..."
npm ci --legacy-peer-deps

# Run the build
echo "Running build..."
npm run build

# Return success
exit 0
