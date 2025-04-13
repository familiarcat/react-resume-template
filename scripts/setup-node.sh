#!/bin/bash

# Print current Node.js version
echo "Current Node.js version: $(node -v)"
echo "Current npm version: $(npm -v)"

# Install n (Node.js version manager)
echo "Installing n..."
npm install -g n

# Install Node.js 18.19.0
echo "Installing Node.js 18.19.0..."
n 18.19.0

# Add n to PATH
export PATH="$PATH:/usr/local/bin"

# Verify Node.js version
echo "New Node.js version: $(node -v)"
echo "New npm version: $(npm -v)"

# Make the script executable
chmod +x scripts/setup-node.sh
