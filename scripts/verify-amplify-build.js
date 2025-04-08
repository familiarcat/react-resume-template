/* eslint-disable @typescript-eslint/no-require-imports */
const { existsSync, readdirSync, statSync, mkdirSync, copyFileSync } = require('fs');
const { join } = require('path');

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function verifyAndCopyFile(src, dest) {
  if (!existsSync(src)) {
    throw new Error(`Missing required file: ${src}`);
  }
  const destDir = dest.split('/').slice(0, -1).join('/');
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }
  copyFileSync(src, dest);
  log(`✓ Verified and copied: ${src} -> ${dest}`);
}

function verifyDirectory(dir, create = false) {
  if (!existsSync(dir)) {
    if (create) {
      mkdirSync(dir, { recursive: true });
      log(`Created directory: ${dir}`);
    } else {
      throw new Error(`Required directory missing: ${dir}`);
    }
  }
  log(`✓ Directory exists: ${dir}`);
}

function verifyBuild() {
  const nextDir = join(process.cwd(), '.next');
  const standaloneDir = join(nextDir, 'standalone');
  const standaloneNextDir = join(standaloneDir, '.next');

  // Verify directory structure
  verifyDirectory(nextDir);
  verifyDirectory(standaloneDir, true);
  verifyDirectory(standaloneNextDir, true);

  // Required files and their destinations
  const filesToCopy = [
    {
      src: join(nextDir, 'required-server-files.json'),
      dest: join(standaloneNextDir, 'required-server-files.json')
    },
    {
      src: join(nextDir, 'build-manifest.json'),
      dest: join(standaloneNextDir, 'build-manifest.json')
    },
    {
      src: join(process.cwd(), 'package.json'),
      dest: join(standaloneDir, 'package.json')
    }
  ];

  // Verify and copy each required file
  filesToCopy.forEach(({ src, dest }) => {
    verifyAndCopyFile(src, dest);
  });

  // Copy static files
  const staticDir = join(nextDir, 'static');
  const standaloneStaticDir = join(standaloneNextDir, 'static');
  if (existsSync(staticDir)) {
    verifyDirectory(standaloneStaticDir, true);
    // Copy static files recursively
    copyDir(staticDir, standaloneStaticDir);
  }

  // Copy public directory if it exists
  const publicDir = join(process.cwd(), 'public');
  if (existsSync(publicDir)) {
    const standalonePublicDir = join(standaloneDir, 'public');
    verifyDirectory(standalonePublicDir, true);
    copyDir(publicDir, standalonePublicDir);
  }

  log('\nStandalone directory contents:');
  listDirectoryContents(standaloneDir);
  
  log('\nBuild verification completed successfully');
}

function copyDir(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  const entries = readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

function listDirectoryContents(dir, indent = '') {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    log(`${indent}${entry.isDirectory() ? 'd' : 'f'} ${entry.name}`);
    if (entry.isDirectory()) {
      listDirectoryContents(join(dir, entry.name), `${indent}  `);
    }
  }
}

try {
  verifyBuild();
} catch (error) {
  console.error(`\nError: ${error.message}`);
  process.exit(1);
}
