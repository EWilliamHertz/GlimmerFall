const { chromium } = require('playwright');
const path = require('path');

async function generateProPDF(deckName) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log(`Loading Vercel Print Page for deck: ${deckName}...`);
  await page.goto('http://localhost:5173/print-decks', { waitUntil: 'networkidle', timeout: 60000 });
  
  await page.waitForSelector('select option', { state: 'attached' });
  // also wait for options length to be > 1 to ensure fetch is complete
  await page.waitForFunction(() => document.querySelectorAll('select option').length > 1);
  
  const options = await page.$$eval('select option', opts => opts.map(o => o.value));
  console.log('Available decks:', options);
  
  const exactMatch = options.find(o => o.toLowerCase().includes(deckName.toLowerCase()));
  if (!exactMatch) {
    console.log(`Could not find a deck matching ${deckName}. Attempting to select by text...`);
    await page.selectOption('select', { label: deckName });
  } else {
    await page.selectOption('select', { value: exactMatch });
  }
  
  await page.waitForTimeout(8000);
  
  await page.evaluate(() => {
    // Extract all card elements from the DOM
    const cards = Array.from(document.querySelectorAll('.print-card-wrap > div'));
    
    // Nuke the body
    document.body.innerHTML = '';
    
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    cards.forEach(card => {
        // Front Page (Card centered in 69x94 black bleed box)
        const frontPage = document.createElement('div');
        frontPage.style.width = '69mm';
        frontPage.style.height = '94mm';
        frontPage.style.display = 'flex';
        frontPage.style.justifyContent = 'center';
        frontPage.style.alignItems = 'center';
        frontPage.style.pageBreakAfter = 'always';
        frontPage.style.background = '#000000';
        
        card.style.float = 'none';
        card.style.margin = '0';
        frontPage.appendChild(card);
        container.appendChild(frontPage);
        
        // Back Page
        const backPage = document.createElement('div');
        backPage.style.width = '69mm';
        backPage.style.height = '94mm';
        backPage.style.display = 'flex';
        backPage.style.justifyContent = 'center';
        backPage.style.alignItems = 'center';
        backPage.style.pageBreakAfter = 'always';
        backPage.style.background = '#000000';
        
        const backImg = document.createElement('img');
        backImg.src = '/baked_cardback.png';
        backImg.style.width = '63mm';
        backImg.style.height = '88mm';
        backImg.style.objectFit = 'contain';
        
        backPage.appendChild(backImg);
        container.appendChild(backPage);
    });
    
    // Return a promise that resolves when all injected images are fully loaded
    return Promise.all(Array.from(document.images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
    }));
  });
  
  await page.addStyleTag({ content: `
    @page { size: 69mm 94mm; margin: 0; }
    body, html { margin: 0 !important; padding: 0 !important; background: black !important; }
  `});
  
  const outputPath = path.join(__dirname, 'print_exports', `${deckName.replace(/ /g, '_')}_Professional.pdf`);
  
  await page.pdf({
    path: outputPath,
    printBackground: true,
    width: '69mm',
    height: '94mm',
    pageRanges: '', // all pages
    margin: { top: 0, bottom: 0, left: 0, right: 0 }
  });
  
  await browser.close();
  console.log(`Generated: ${outputPath}`);
}

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/print-decks', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('select option', { state: 'attached' });
  await page.waitForFunction(() => document.querySelectorAll('select option').length > 1);
  
  const options = await page.$$eval('select option', opts => opts.map(o => o.value).filter(v => v !== ''));
  console.log('Available decks to generate:', options);
  await browser.close();
  
  for (const deckName of options) {
      await generateProPDF(deckName);
  }
}

run();
