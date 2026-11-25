const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('1. Home Page: Clean split layout with HeroShowcaseCarousel and navigation arrows', () => {
  const homePath = path.join(process.cwd(), 'src/app/page.tsx');
  const homeContent = fs.readFileSync(homePath, 'utf-8');

  assert.ok(homeContent.includes('HeroShowcaseCarousel'), 'Home page embeds HeroShowcaseCarousel');
  assert.ok(
    homeContent.includes('AscentAuthCard'),
    'Home page embeds AscentAuthCard on left column'
  );

  const carouselPath = path.join(process.cwd(), 'src/components/home/hero-showcase-carousel.tsx');
  assert.ok(fs.existsSync(carouselPath), 'hero-showcase-carousel.tsx exists');

  const carouselContent = fs.readFileSync(carouselPath, 'utf-8');
  assert.ok(
    carouselContent.includes('ChevronLeft') && carouselContent.includes('ChevronRight'),
    'Has left and right navigation arrows'
  );
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

test('4. Headline removed "Master Test Automation" and shows "From Manual QA to SDET with AI"', () => {
  const cardPath = path.join(process.cwd(), 'src/components/auth/ascent-auth-card.tsx');
  const content = fs.readFileSync(cardPath, 'utf-8');

  assert.ok(
    !content.includes('Describe your idea Build websites & apps with AI'),
    'Removed non-QA copy'
  );
  assert.ok(content.includes('From Manual QA to SDET'), 'Has "From Manual QA to SDET"');
  assert.ok(
    !content.includes('Master Test Automation with'),
    'Removed "Master Test Automation with"'
  );
  assert.ok(content.includes('with AI'), 'Displays "with AI"');
  assert.ok(content.includes('text-[#81FF89]'), 'Features glowing green AI accent');
});

test('5. Continue with Google button background is solid pure white', () => {
  const cardPath = path.join(process.cwd(), 'src/components/auth/ascent-auth-card.tsx');
  const content = fs.readFileSync(cardPath, 'utf-8');

  assert.ok(content.includes('!bg-white'), 'Google button uses explicit pure white background');
  assert.ok(content.includes('!text-black'), 'Google button uses explicit black text');

  const googleBtnPath = path.join(process.cwd(), 'src/components/auth/google-sign-in-button.tsx');
  const googleBtnContent = fs.readFileSync(googleBtnPath, 'utf-8');
  assert.ok(
    !googleBtnContent.includes('dark:bg-slate-900'),
    'Removed dark mode override so it stays pure white'
  );
});

test('6. Social icons (GitHub, Apple, Facebook) do not directly log in and show OAuth authorization modal', () => {
  const cardPath = path.join(process.cwd(), 'src/components/auth/ascent-auth-card.tsx');
  const cardContent = fs.readFileSync(cardPath, 'utf-8');

  assert.ok(
    cardContent.includes('SocialOAuthModal'),
    'AscentAuthCard imports and renders SocialOAuthModal'
  );
  assert.ok(cardContent.includes('activeSocialProvider'), 'Manages activeSocialProvider state');
  assert.ok(
    cardContent.includes('setActiveSocialProvider'),
    'Sets activeSocialProvider on social button click'
  );

  const modalPath = path.join(process.cwd(), 'src/components/auth/social-oauth-modal.tsx');
  assert.ok(fs.existsSync(modalPath), 'social-oauth-modal.tsx component exists');

  const modalContent = fs.readFileSync(modalPath, 'utf-8');
  assert.ok(
    modalContent.includes('wants access to your'),
    'Contains authorization header matching OAuth spec'
  );
  assert.ok(modalContent.includes('Authorize'), 'Contains Authorize action button');
  assert.ok(modalContent.includes('Cancel'), 'Contains Cancel dismiss action');
  assert.ok(modalContent.includes('Verify your'), 'Shows permission items to user');
});

test('7. 1-Click Fast Student Demo Login button and its code are completely removed', () => {
  const cardPath = path.join(process.cwd(), 'src/components/auth/ascent-auth-card.tsx');
  const cardContent = fs.readFileSync(cardPath, 'utf-8');

  assert.ok(
    !cardContent.includes('1-Click Fast Student Demo Login'),
    'Student demo button text is removed'
  );
  assert.ok(!cardContent.includes('handleDemoLogin'), 'handleDemoLogin function is removed');
});

test('8. In-Browser Practice Sandboxes removed from What You Will Get section', () => {
  const homePath = path.join(process.cwd(), 'src/app/page.tsx');
  const homeContent = fs.readFileSync(homePath, 'utf-8');

  assert.ok(
    !homeContent.includes('In-Browser Practice Sandboxes'),
    'Removed "In-Browser Practice Sandboxes" from home page'
  );
  assert.ok(!homeContent.includes('Zero Setup'), 'Removed unrealistic "Zero Setup" claims');
  assert.ok(homeContent.includes('1. Scratch-to-SDET Learning Roadmaps'), 'Retains Roadmaps');
  assert.ok(
    homeContent.includes('2. 800+ Curated SDET Interview Scenarios') ||
      homeContent.includes('2. 500+ Curated SDET Interview Scenarios'),
    'Retains Interview Scenarios'
  );
  assert.ok(homeContent.includes('3. Optional AI Features'), 'Retains Optional AI Features');
});

test('9. FAQs has all sections collapsed by default and matches Emergent design', () => {
  const homePath = path.join(process.cwd(), 'src/app/page.tsx');
  const homeContent = fs.readFileSync(homePath, 'utf-8');

  assert.ok(homeContent.includes('id="faq"'), 'Home page contains section id="faq"');
  assert.ok(
    homeContent.includes('FREQUENTLY ASKED QUESTIONS'),
    'Contains Emergent uppercase tracking label'
  );
  assert.ok(
    homeContent.includes('Curious about IntelligentQA?'),
    'Contains Emergent reference heading'
  );
  assert.ok(
    homeContent.includes('openFaqIndices, setOpenFaqIndices] = useState<number[]>([])'),
    'Initial state is empty array so all sections are collapsed by default'
  );
  assert.ok(
    homeContent.includes('ChevronDown'),
    'Uses chevron indicator for accordion expand/collapse'
  );

  const headerPath = path.join(process.cwd(), 'src/components/layout/header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf-8');
  assert.ok(headerContent.includes("label: 'FAQs'"), 'Nav label is updated to FAQs');
});
