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
  cp next.config.amplify.js next.config.js
}

build() {
  log "Starting build process..."
  next build --no-lint
  
  # Immediate verification after build
  log "Verifying build output..."
  node scripts/verify-next-output.js
}

prepare_standalone() {
  log "Preparing standalone build..."
  mkdir -p .next/standalone/.next/static
  cp -r .next/static/* .next/standalone/.next/static/
  cp -r .next/required-server-files.json .next/standalone/.next/
  cp -r .next/build-manifest.json .next/standalone/.next/
  cp -r .next/server .next/standalone/.next/
  cp -r public .next/standalone/ || true
  cp package.json .next/standalone/
}

verify_final() {
  log "Performing final verification..."
  node scripts/verify-amplify-build.js
}

main() {
  log "=== Starting Amplify Gen 2 Build ==="
  
  cleanup
  setup_env
  prepare_build
  build
  prepare_standalone
  verify_final
  
  log "=== Build completed successfully ==="
}

main
