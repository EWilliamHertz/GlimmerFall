const { chromium } = require('playwright');
const { PDFDocument, blendMode } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log("Launching Playwright...");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const templatePath = 'file://' + path.join(__dirname, 'booster_wrapper_full.html');
  await page.goto(templatePath, { waitUntil: 'networkidle' });
  
  const tempPdfPath = path.join(__dirname, 'temp_wrapper.pdf');
  await page.pdf({
    path: tempPdfPath,
    printBackground: true,
    width: '164mm',
    height: '125mm',
    pageRanges: '1',
    margin: { top: 0, bottom: 0, left: 0, right: 0 }
  });
  
  await browser.close();
  console.log("Rendered base design to PDF.");

  console.log("Compositing with Printer Template...");
  const templateBytes = fs.readFileSync('Booster Pack 72x125.pdf');
  const myDesignBytes = fs.readFileSync(tempPdfPath);
  
  const pdfDoc = await PDFDocument.create();
  
  const printerTemplateDoc = await PDFDocument.load(templateBytes);
  const myDesignDoc = await PDFDocument.load(myDesignBytes);
  
  const [printerPage] = await pdfDoc.embedPdf(printerTemplateDoc);
  const [myDesignPage] = await pdfDoc.embedPdf(myDesignDoc);
  
  const { width, height } = printerPage.scale(1.0);
  
  // Create a page of the exact size of the printer's template (743.412 x 574.176)
  const pageComposite = pdfDoc.addPage([width, height]);
  
  // Dimensions of our design (164mm x 125mm in points is roughly 464.88 x 354.33)
  const myDesignDims = myDesignPage.scale(1.0);
  
  // Center our design on the printer's template, shifted slightly left
  const x = ((width - myDesignDims.width) / 2) - 15;
  const y = (height - myDesignDims.height) / 2;
  
  // Draw our design first
  pageComposite.drawPage(myDesignPage, {
    x: x,
    y: y,
    width: myDesignDims.width,
    height: myDesignDims.height,
  });
  
  // Draw the printer's template on top with Multiply blend mode so the white background vanishes and lines stay
  pageComposite.drawPage(printerPage, {
    x: 0,
    y: 0,
    width: width,
    height: height,
    blendMode: 'Multiply'
  });
  
  const finalPdfBytes = await pdfDoc.save();
  const outputPath = path.join(__dirname, 'print_exports', 'Final_Booster_With_Template_Lines.pdf');
  fs.writeFileSync(outputPath, finalPdfBytes);
  
  console.log(`Generated perfect composite PDF: ${outputPath}`);
}

run().catch(console.error);
