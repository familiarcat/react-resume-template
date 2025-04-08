#!/bin/bash

# Enable error handling
set -e

# Function to log with timestamp
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to handle errors
handle_error() {
  log "ERROR: Build failed at line $1"
  exit 1
}

# Set up error trap
trap 'handle_error $LINENO' ERR

# Print current versions
log "Current Node version: $(node --version)"
log "Current NPM version: $(npm --version)"
log "Current directory: $(pwd)"
log "Listing files: $(ls -la)"

# Install and use the required Node.js version
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

# Install the required Node.js version if not already installed
if ! nvm ls 18.19.0 > /dev/null; then
  log "Installing Node.js 18.19.0..."
  nvm install 18.19.0
fi

# Use the required Node.js version
log "Switching to Node.js 18.19.0..."
nvm use 18.19.0

# Print new versions
log "New Node version: $(node --version)"
log "New NPM version: $(npm --version)"

# Check for package.json
if [ ! -f "package.json" ]; then
  log "ERROR: package.json not found in $(pwd)"
  ls -la
  exit 1
fi

# Install dependencies with legacy peer deps
log "Installing dependencies..."
npm ci --legacy-peer-deps

# Check for next.config.js
if [ ! -f "next.config.js" ]; then
  log "ERROR: next.config.js not found in $(pwd)"
  ls -la
  exit 1
fi

# Install any missing dependencies
log "Installing any missing dependencies..."
npm install --no-save @emotion/is-prop-valid react@latest react-dom@latest

# Generate fallback manifest
log "Generating fallback manifest..."
node scripts/generate-fallback-manifest.js

# Run the build with timeout
log "Running build with 10 minute timeout..."
timeout 600 npm run build || {
  log "ERROR: Build timed out after 10 minutes"
  exit 1
}

# Check if .next directory was created
if [ ! -d ".next" ]; then
  log "ERROR: Build completed but .next directory not found"
  ls -la
  exit 1
fi

log "Build completed successfully"
log "Contents of .next directory:"
ls -la .next

# Return success
exit 0
