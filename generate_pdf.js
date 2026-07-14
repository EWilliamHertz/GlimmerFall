const { chromium } = require('playwright');
const path = require('path');

// Accept a deck name from CLI args, otherwise default to a starter deck
const deckName = process.argv[2] || 'Nature Wrath';

async function generatePDF() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log("Navigating to Glimmerfall Print Page...");
  // Connect directly to your live production build
  await page.goto('https://glimmer-fall.vercel.app/print-decks', { waitUntil: 'networkidle', timeout: 60000 });
  
  console.log(`Selecting deck: '${deckName}'...`);
  try {
    await page.selectOption('select', { value: deckName });
  } catch (e) {
    console.error(`Error: Could not find deck '${deckName}'. Please check the exact name.`);
    await browser.close();
    return;
  }
  
  console.log("Waiting for high-resolution images to load...");
  // Give it 8 seconds to ensure all Cloudinary images have downloaded perfectly
  await page.waitForTimeout(8000); 
  
  const outputPath = path.join(__dirname, `${deckName.replace(/ /g, '_')}_Proxies.pdf`);
  console.log(`Generating strict A4 PDF with absolute positioning...`);
  
  // Natively capture the HTML as a pure PDF vector/raster format
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true, // Forces background colors and gradients to render
    margin: { top: 0, bottom: 0, left: 0, right: 0 } // Overrides all browser margins
  });
  
  await browser.close();
  console.log("Success! PDF static file generated at:");
  console.log(`-> ${outputPath}`);
}

generatePDF();
