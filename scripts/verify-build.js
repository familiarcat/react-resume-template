import { existsSync } from 'fs';
import { join } from 'path';

function verifyBuild() {
  const nextDir = join(process.cwd(), '.next');
  const requiredFiles = [
    'required-server-files.json',
    'build-manifest.json',
    'prerender-manifest.json',
    'server/pages-manifest.json'
  ];

  console.log('Verifying build output...');
  
  for (const file of requiredFiles) {
    const filePath = join(nextDir, file);
    if (!existsSync(filePath)) {
      throw new Error(`Missing required file: ${file}`);
    }
    console.log(`✓ Found ${file}`);
  }

  console.log('Build verification completed successfully');
}

verifyBuild();