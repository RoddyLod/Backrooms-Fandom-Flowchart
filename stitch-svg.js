const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Pattern: tile-x-y.png
const tilePrefix = 'tile-';
const tileExt = '.png';

(async () => {
  // Read files matching tile-*.png
  const files = fs.readdirSync('.').filter(f => f.startsWith(tilePrefix) && f.endsWith(tileExt));

  if (files.length === 0) {
    console.error('No tile files found in current folder');
    process.exit(1);
  }

  // Parse tile positions and get their sizes
  const tiles = [];
  let maxRight = 0;
  let maxBottom = 0;

  for (const file of files) {
    // filename like tile-4000-0.png
    const match = file.match(/^tile-(\d+)-(\d+)\.png$/);
    if (!match) {
      console.warn(`Skipping unexpected filename: ${file}`);
      continue;
    }
    const x = parseInt(match[1], 10);
    const y = parseInt(match[2], 10);

    // Get tile dimensions
    const meta = await sharp(file).metadata();

    tiles.push({ file, x, y, width: meta.width, height: meta.height });

    if (x + meta.width > maxRight) maxRight = x + meta.width;
    if (y + meta.height > maxBottom) maxBottom = y + meta.height;
  }

  // Create blank canvas to fit all tiles
  const canvas = sharp({
    create: {
      width: maxRight,
      height: maxBottom,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  });

  // Prepare composites
  const composites = tiles.map(({ file, x, y }) => ({
    input: file,
    left: x,
    top: y
  }));

  // Composite all tiles
  await canvas.composite(composites).toFile('stitched.png');

  console.log(`✅ Stitched ${tiles.length} tiles into stitched.png (${maxRight}x${maxBottom})`);
})();
