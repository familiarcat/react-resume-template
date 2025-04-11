import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function verifyImage(filepath) {
  try {
    const stats = await fs.stat(filepath);
    if (stats.size === 0) {
      return `❌ Empty file: ${filepath}`;
    }
    return `✅ Found: ${filepath} (${(stats.size / 1024).toFixed(2)} KB)`;
  } catch {
    return `❌ Missing: ${filepath}`;
  }
}

async function main() {
  const rootDir = path.join(__dirname, '..');
  const publicImagesDir = path.join(rootDir, 'public', 'images');

  console.log('Verifying image structure...\n');

  const requiredPaths = [
    path.join(publicImagesDir, 'profile.jpg'),
    path.join(publicImagesDir, 'testimonial.webp'),
    ...Array.from({length: 10}, (_, i) => 
      path.join(publicImagesDir, 'portfolio', `portfolio-${i + 1}.jpg`)
    )
  ];

  for (const imagePath of requiredPaths) {
    const result = await verifyImage(imagePath);
    console.log(result);
  }
}

main().catch(console.error);