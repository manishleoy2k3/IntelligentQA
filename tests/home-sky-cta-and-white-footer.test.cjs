const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('1. Home Page: Start Learning on IntelligentQA today Sky Section', () => {
  const homePageFile = fs.readFileSync(path.join(__dirname, '../src/app/page.tsx'), 'utf8');

  // Verify headline
  assert.ok(
    homePageFile.includes('Start Learning on IntelligentQA today'),
    'Home page includes "Start Learning on IntelligentQA today" headline'
  );

  // Verify Get Started button
  assert.ok(
    homePageFile.includes('Get Started') && homePageFile.includes('/signup'),
    'Home page includes Get Started button linking to signup'
  );

  // Verify scenic background image configuration
  assert.ok(
    homePageFile.includes('/images/start-learning-intelligentqa-bg.jpg'),
    'Home page uses generated start-learning-intelligentqa-bg.jpg landscape image'
  );

  // Verify background image file exists on disk and is non-empty
  const imagePath = path.join(__dirname, '../public/images/start-learning-intelligentqa-bg.jpg');
  assert.ok(fs.existsSync(imagePath), 'start-learning-intelligentqa-bg.jpg exists in public/images');
  const imageStats = fs.statSync(imagePath);
  assert.ok(imageStats.size > 100000, 'start-learning-intelligentqa-bg.jpg is a high-resolution image (>100KB)');

  // Verify in-banner top navigation is removed as requested
  assert.ok(
    !homePageFile.includes('Top In-Banner Navigation'),
    'In-banner top navigation bar is cleanly removed from the sky section'
  );
});

test('2. Footer: White background matching Emergent reference design', () => {
  const footerFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/footer.tsx'), 'utf8');

  // Verify white background
  assert.ok(footerFile.includes('bg-white'), 'Footer has white background (bg-white)');
  assert.ok(footerFile.includes('text-neutral-600') || footerFile.includes('text-neutral-500'), 'Footer uses readable neutral dark text');

  // Verify brand and tagline
  assert.ok(footerFile.includes('intelligent') && footerFile.includes('qa'), 'Footer displays intelligentqa brand');
  assert.ok(footerFile.includes('Transform from Manual QA to high-demand SDET'), 'Footer displays descriptive brand tagline');

  // Verify categorized columns
  assert.ok(footerFile.includes('Product'), 'Footer has Product column');
  assert.ok(footerFile.includes('Solutions'), 'Footer has Solutions column');
  assert.ok(footerFile.includes('Resources'), 'Footer has Resources column');
  assert.ok(footerFile.includes('Company'), 'Footer has Company column');

  // Verify copyright and design credit line
  assert.ok(footerFile.includes('COPYRIGHT © INTELLIGENTQA 2026'), 'Footer has uppercase COPYRIGHT © INTELLIGENTQA 2026');
  assert.ok(footerFile.includes('DESIGNED AND BUILT FOR THE AWESOME QA COMMUNITY'), 'Footer has DESIGNED AND BUILT credit line');

  // Verify social links
  assert.ok(footerFile.includes('linkedin.com'), 'Footer includes LinkedIn social link');
  assert.ok(footerFile.includes('x.com'), 'Footer includes X (Twitter) social link');
  assert.ok(footerFile.includes('youtube.com'), 'Footer includes YouTube social link');
  assert.ok(footerFile.includes('instagram.com'), 'Footer includes Instagram social link');
  assert.ok(footerFile.includes('github.com'), 'Footer includes GitHub social link');
});
