import { promises as fs } from 'fs';
import path from 'path';

async function checkDirectory(dir) {
  console.log(`Checking directory: ${dir}`);
  
  try {
    const exists = await fs.access(dir).then(() => true).catch(() => false);
    if (!exists) {
      console.log(`❌ Directory does not exist: ${dir}`);
      return false;
    }

    const items = await fs.readdir(dir);
    console.log(`Found ${items.length} items in ${dir}:`);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = await fs.stat(fullPath);
      console.log(`- ${item} (${stats.isDirectory() ? 'directory' : 'file'}) - ${stats.size} bytes`);
    }
    return true;
  } catch (error) {
    console.error(`Error checking directory ${dir}:`, error);
    return false;
  }
}

async function main() {
  const rootDir = path.join(__dirname, '..');
  console.log('Checking image directories...\n');

  const srcImagesDir = path.join(rootDir, 'src', 'images');
  const publicImagesDir = path.join(rootDir, 'public', 'images');

  const srcExists = await checkDirectory(srcImagesDir);
  console.log('');
  const publicExists = await checkDirectory(publicImagesDir);

  if (!srcExists || !publicExists) {
    console.error('\n⚠️ One or more image directories are missing!');
    process.exit(1);
  }
}

main().catch(console.error);
