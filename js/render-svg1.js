const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const svgContent = fs.readFileSync('input.svg', 'utf8');
    await page.setContent(`
        <html>
        <body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;">
            <div id="container" style="transform:scale(2); transform-origin: top left;">
                ${svgContent}
            </div>
        </body>
        </html>
    `, { waitUntil: 'load' });

    // Render at a safe size
    await page.setViewport({ width: 1600, height: 1200 });

    // Screenshot the container with scaled content
    const container = await page.$('#container');
    await container.screenshot({ path: 'output.png' });

    await browser.close();
    console.log(`✅ Rendered safely with scaling`);
})();
