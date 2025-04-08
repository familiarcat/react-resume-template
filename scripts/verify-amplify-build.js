import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

function log(message) {
  console.log(`[Verify Build] ${message}`);
}

function verifyBuild() {
  const nextDir = join(process.cwd(), '.next');
  const standaloneDir = join(nextDir, 'standalone');
  const standaloneNextDir = join(standaloneDir, '.next');

  // Required files to check
  const requiredFiles = [
    { path: join(nextDir, 'required-server-files.json'), name: 'Required server files' },
    { path: join(nextDir, 'build-manifest.json'), name: 'Build manifest' },
    { path: join(standaloneDir, 'server.js'), name: 'Server entry' },
    { path: join(standaloneNextDir, 'required-server-files.json'), name: 'Standalone required server files' },
  ];

  let success = true;

  // Verify each required file
  for (const file of requiredFiles) {
    if (existsSync(file.path)) {
      log(`✓ Found ${file.name}: ${file.path}`);
    } else {
      log(`✗ Missing ${file.name}: ${file.path}`);
      success = false;
    }
  }

  // Verify standalone directory structure
  if (existsSync(standaloneDir)) {
    log('✓ Standalone directory exists');
    
    // List contents of standalone directory
    const contents = readdirSync(standaloneDir);
    log('Standalone directory contents:');
    contents.forEach(item => log(`  - ${item}`));
  } else {
    log('✗ Standalone directory is missing');
    success = false;
  }

  if (!success) {
    throw new Error('Build verification failed');
  }

  log('Build verification completed successfully');
}

try {
  verifyBuild();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}