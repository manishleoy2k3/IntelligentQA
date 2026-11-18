const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('1. Home Page: Clean split layout with HeroShowcaseCarousel and navigation arrows', () => {
  const homePath = path.join(process.cwd(), 'src/app/page.tsx');
  const homeContent = fs.readFileSync(homePath, 'utf-8');

  assert.ok(homeContent.includes('HeroShowcaseCarousel'), 'Home page embeds HeroShowcaseCarousel');
  assert.ok(homeContent.includes('AscentAuthCard'), 'Home page embeds AscentAuthCard on left column');

  const carouselPath = path.join(process.cwd(), 'src/components/home/hero-showcase-carousel.tsx');
  assert.ok(fs.existsSync(carouselPath), 'hero-showcase-carousel.tsx exists');

  const carouselContent = fs.readFileSync(carouselPath, 'utf-8');
  assert.ok(carouselContent.includes('ChevronLeft') && carouselContent.includes('ChevronRight'), 'Has left and right navigation arrows');
  assert.ok(carouselContent.includes('SHOWCASE_SLIDES'), 'Has showcase content slides');
  assert.ok(carouselContent.includes('Built for Manual QA'), 'Showcases Manual QA to SDET content');
});

test('2. Get started does NOT have Admin portal toggle button', () => {
  const cardPath = path.join(process.cwd(), 'src/components/auth/ascent-auth-card.tsx');
  const content = fs.readFileSync(cardPath, 'utf-8');

  // Verify there is no visible toggle button between Student and Admin in the card UI
  assert.ok(
    !content.includes('Portal Switcher (Student Portal vs Admin Portal)'),
    'Admin portal toggle button has been removed from Get Started'
  );
  assert.ok(
    !content.includes('text-[#A1A1AA] hover:text-purple-300'),
    'Admin portal toggle pill button has been removed'
  );
});

test('3. Card uses our official IntelligentQA Brand Logo', () => {
  const cardPath = path.join(process.cwd(), 'src/components/auth/ascent-auth-card.tsx');
  const content = fs.readFileSync(cardPath, 'utf-8');

  assert.ok(content.includes('QABrandLogo'), 'Uses official QABrandLogo');
});

test('4. Replaced generic copy with true QA & SDET copy', () => {
  const cardPath = path.join(process.cwd(), 'src/components/auth/ascent-auth-card.tsx');
  const content = fs.readFileSync(cardPath, 'utf-8');

  assert.ok(!content.includes('Describe your idea Build websites & apps with AI'), 'Removed non-QA copy');
  assert.ok(content.includes('From Manual QA to SDET'), 'Has "From Manual QA to SDET"');
  assert.ok(content.includes('Master Test Automation with'), 'Has "Master Test Automation with"');
  assert.ok(content.includes('text-[#81FF89]'), 'Features glowing green AI accent');
});

test('5. Continue with Google button background is solid pure white', () => {
  const cardPath = path.join(process.cwd(), 'src/components/auth/ascent-auth-card.tsx');
  const content = fs.readFileSync(cardPath, 'utf-8');

  assert.ok(content.includes('!bg-white'), 'Google button uses explicit pure white background');
  assert.ok(content.includes('!text-black'), 'Google button uses explicit black text');

  const googleBtnPath = path.join(process.cwd(), 'src/components/auth/google-sign-in-button.tsx');
  const googleBtnContent = fs.readFileSync(googleBtnPath, 'utf-8');
  assert.ok(!googleBtnContent.includes('dark:bg-slate-900'), 'Removed dark mode override so it stays pure white');
});
