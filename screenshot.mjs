import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const screenshotDir = './temporary screenshots';
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

// Auto-increment filename
const existing = fs.readdirSync(screenshotDir).filter(f => f.startsWith('screenshot-') && f.endsWith('.png'));
const nums = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] || '0')).filter(n => !isNaN(n));
const next = nums.length ? Math.max(...nums) + 1 : 1;
const filename = label ? `screenshot-${next}-${label}.png` : `screenshot-${next}.png`;
const outPath = path.join(screenshotDir, filename);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
});
const page = await browser.newPage();

// Load at normal viewport first
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
// Extra wait for external fonts/images to settle
await new Promise(r => setTimeout(r, 2000));

// Scroll through page to trigger IntersectionObserver reveal animations
await page.evaluate(async () => {
  await new Promise(resolve => {
    const distance = 200;
    const delay = 60;
    const scroll = () => {
      window.scrollBy(0, distance);
      if (window.scrollY + window.innerHeight < document.body.scrollHeight) {
        setTimeout(scroll, delay);
      } else {
        window.scrollTo(0, 0);
        setTimeout(resolve, 400);
      }
    };
    scroll();
  });
});

// Measure full page height, then expand viewport to match
// This avoids the Chromium compositor bug that blanks large canvases
// when using fullPage:true at deviceScaleFactor:2
const pageHeight = await page.evaluate(() => document.body.scrollHeight);
await page.setViewport({ width: 1440, height: pageHeight, deviceScaleFactor: 1 });
await new Promise(r => setTimeout(r, 600));

await page.screenshot({ path: outPath, fullPage: false });
await browser.close();

console.log(`Screenshot saved: ${outPath}`);
