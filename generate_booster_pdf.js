const { chromium } = require('playwright');
const path = require('path');

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const templatePath = 'file://' + path.join(__dirname, 'booster_template.html');
  await page.goto(templatePath, { waitUntil: 'networkidle' });
  
  const outputPath = path.join(__dirname, 'print_exports', 'Booster_Pack_Template_72x125mm.pdf');
  
  await page.pdf({
    path: outputPath,
    printBackground: true,
    width: '72mm',
    height: '125mm',
    pageRanges: '1',
    margin: { top: 0, bottom: 0, left: 0, right: 0 }
  });
  
  await browser.close();
  console.log(`Generated Booster Pack Wrapper: ${outputPath}`);
}
run();
