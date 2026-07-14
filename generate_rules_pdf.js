const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const htmlPath = 'file://' + path.resolve(__dirname, 'rules.html');
  await page.goto(htmlPath, { waitUntil: 'networkidle' });
  
  const outPath = path.resolve(__dirname, 'print_exports', 'Glimmerfall_Rules_And_Keywords.pdf');
  await page.pdf({
    path: outPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      bottom: '20mm',
      left: '20mm',
      right: '20mm'
    }
  });
  
  console.log('Generated rules PDF at:', outPath);
  await browser.close();
})();
