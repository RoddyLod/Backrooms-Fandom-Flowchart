const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const svgContent = fs.readFileSync('input.svg', 'utf8');
    await page.setContent(`<html><body style="margin:0;display:flex;justify-content:center;align-items:center;">${svgContent}</body></html>`, {
        waitUntil: 'load'
    });

    // Wait for SVG to load and measure its size in the browser context
    const svgDimensions = await page.evaluate(() => {
        const svg = document.querySelector('svg');
        const bbox = svg.getBBox();
        return {
            width: Math.ceil(bbox.width + bbox.x),
            height: Math.ceil(bbox.height + bbox.y)
        };
    });

    await page.setViewport({
        width: svgDimensions.width,
        height: svgDimensions.height
    });

    // Screenshot the exact SVG
    const svgElement = await page.$('svg');
    await svgElement.screenshot({ path: 'output.png' });

    await browser.close();
    console.log(`✅ COMPLETE! Saved output.png at ${svgDimensions.width}×${svgDimensions.height}`);
})();