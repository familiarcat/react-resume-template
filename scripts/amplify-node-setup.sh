#!/bin/bash
set -e

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

REQUIRED_NODE_VERSION="18.19.0"
REQUIRED_NPM_VERSION="9.8.1"

# Install specific npm version
install_npm_version() {
    log "Installing npm version $REQUIRED_NPM_VERSION..."
    npm install -g npm@$REQUIRED_NPM_VERSION
    hash -r
    log "Installed npm version: $(npm --version)"
}

main() {
    log "Starting Node.js setup..."
    log "Required Node.js version: $REQUIRED_NODE_VERSION"
    log "Required npm version: $REQUIRED_NPM_VERSION"

    # Check current versions
    CURRENT_NODE_VERSION=$(node --version)
    CURRENT_NPM_VERSION=$(npm --version)
    
    log "Current Node.js version: $CURRENT_NODE_VERSION"
    log "Current npm version: $CURRENT_NPM_VERSION"

    # Install specific npm version if needed
    if [ "$CURRENT_NPM_VERSION" != "$REQUIRED_NPM_VERSION" ]; then
        log "npm version mismatch. Installing required version..."
        install_npm_version
    fi

    # Final verification
    FINAL_NPM_VERSION=$(npm --version)
    if [ "$FINAL_NPM_VERSION" != "$REQUIRED_NPM_VERSION" ]; then
        log "ERROR: npm version mismatch after installation"
        log "Expected: $REQUIRED_NPM_VERSION"
        log "Got: $FINAL_NPM_VERSION"
        exit 1
    fi

    log "Node.js setup completed successfully"
    log "Node.js version: $(node --version)"
    log "npm version: $(npm --version)"
}

main
