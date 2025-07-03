const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const svgContent = fs.readFileSync('input.svg', 'utf8');
    await page.setContent(`
        <html>
        <body style="margin:0; overflow:scroll;">
            <div id="container">${svgContent}</div>
        </body>
        </html>
    `, { waitUntil: 'load' });

    // Get real SVG dimensions
    const svgSize = await page.evaluate(() => {
        const svg = document.querySelector('svg');
        const bbox = svg.getBBox();
        return {
            width: Math.floor(bbox.x + bbox.width),
            height: Math.floor(bbox.y + bbox.height)
        };
    });

    const tileSize = 4000;
    let tileCount = 0;

    for (let y = 0; y < svgSize.height; y += tileSize) {
        for (let x = 0; x < svgSize.width; x += tileSize) {
            const width = Math.min(tileSize, svgSize.width - x);
            const height = Math.min(tileSize, svgSize.height - y);

            if (width <= 0 || height <= 0) {
                console.warn(`⚠️ Skipped invalid tile: ${x},${y}`);
                continue;
            }

            const tileName = `tile-${x}-${y}.png`;
            console.log(`🖼️ Rendering ${tileName} (${width}x${height})...`);

            await page.setViewport({ width, height });

            // Scroll to position to bring the correct SVG area into view
            await page.evaluate((scrollX, scrollY) => {
                window.scrollTo(scrollX, scrollY);
            }, x, y);

            try {
                await page.screenshot({
                    path: tileName,
                    captureBeyondViewport: false,
                    omitBackground: false
                });
                tileCount++;
            } catch (err) {
                console.error(`❌ Failed at ${tileName} (x=${x}, y=${y}, w=${width}, h=${height})`);
                throw err;
            }
        }
    }

    await browser.close();
    console.log(`✅ Done! Rendered ${tileCount} tile(s).`);
})();
