#!/bin/bash
set -e

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

cleanup() {
  log "Cleaning up previous build artifacts..."
  rm -rf .next
  rm -rf out
  rm -rf node_modules/.cache
}

setup_env() {
  log "Setting up environment..."
  export NODE_OPTIONS="--max-old-space-size=4096"
  export NODE_ENV=production
  export NEXT_TELEMETRY_DISABLED=1
}

build() {
  log "Starting build process..."
  cp next.config.amplify.js next.config.js
  next build
}

main() {
  log "=== Starting Amplify Gen 2 Build ==="
  
  cleanup
  setup_env
  build
  
  if [ -d "out" ]; then
    log "=== Build completed successfully ==="
    exit 0
  else
    log "=== Build failed: 'out' directory not found ==="
    exit 1
  fi
}

main
