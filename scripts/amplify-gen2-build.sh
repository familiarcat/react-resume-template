#!/bin/bash
set -e

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

cleanup() {
  log "Cleaning up previous build artifacts..."
  rm -rf .next
  rm -rf node_modules/.cache
}

setup_env() {
  log "Setting up environment..."
  export NODE_OPTIONS="--max-old-space-size=4096"
  export NODE_ENV=production
  export NEXT_TELEMETRY_DISABLED=1
}

prepare_build() {
  log "Preparing build environment..."
  node scripts/prepare-build.js
}

build() {
  log "Starting build process..."
  npm run build:standalone
}

main() {
  log "=== Starting Amplify Gen 2 Build ==="
  
  cleanup
  setup_env
  prepare_build
  build
  
  log "=== Build completed successfully ==="
}

main
