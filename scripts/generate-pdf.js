const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('🚀 Starting PDF generation...');
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Go to the local resume page
    console.log('Navigating to local server http://localhost:8080/resume...');
    await page.goto('http://localhost:8080/resume', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });
    
    // Set high-resolution viewport
    await page.setViewport({ width: 1200, height: 1600 });
    
    // Emulate print media layout
    await page.emulateMediaType('print');
    
    const outputPath = path.join(__dirname, '../public/resume.pdf');
    console.log(`Saving PDF to: ${outputPath}...`);
    
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px'
      }
    });
    
    console.log('✅ PDF generated successfully!');
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
