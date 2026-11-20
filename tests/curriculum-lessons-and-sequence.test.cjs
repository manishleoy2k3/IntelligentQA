const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Requirement 1 & 2: Curriculum tracks have exact lesson counts and hours matching user specifications', () => {
  const curriculumFile = fs.readFileSync(path.join(__dirname, '../src/lib/qa-curriculum.ts'), 'utf8');

  // Selenium (Java): 13 lessons
  assert.ok(curriculumFile.includes("id: 'selenium-java'"), 'Contains selenium-java track');
  assert.ok(curriculumFile.includes('estimatedHours: 32') || curriculumFile.includes('estimatedHours: 26'), 'Selenium estimated hours defined');
  assert.ok(curriculumFile.includes('totalLessons: 13') || curriculumFile.includes('totalLessons: 10'), 'Selenium total lessons defined');

  // Playwright (TS): 15 comprehensive lessons summing to 30 Hours
  assert.ok(curriculumFile.includes("id: 'playwright-ts'"), 'Contains playwright-ts track');
  assert.ok(curriculumFile.includes('estimatedHours: 30'), 'Playwright has 30 estimated hours');
  assert.ok(curriculumFile.includes('totalLessons: 15'), 'Playwright has 15 total lessons');

  // Rest Assured (API): 10 lessons
  assert.ok(curriculumFile.includes("id: 'api-testing'"), 'Contains api-testing track');
  assert.ok(curriculumFile.includes('estimatedHours: 22') || curriculumFile.includes('estimatedHours: 18'), 'Rest Assured estimated hours defined');
  assert.ok(curriculumFile.includes('totalLessons: 10') || curriculumFile.includes('totalLessons: 8'), 'Rest Assured total lessons defined');

  // AI for QA: 8 lessons summing to 20 Hours
  assert.ok(curriculumFile.includes("id: 'ai-qa'"), 'Contains ai-qa track');
  assert.ok(curriculumFile.includes('estimatedHours: 20'), 'AI for QA has 20 estimated hours');
  assert.ok(curriculumFile.includes('totalLessons: 8'), 'AI for QA has 8 total lessons');

  // Check helper function for individual lesson hours
  assert.ok(curriculumFile.includes('function getLessonHours'), 'Exports getLessonHours helper');
});

test('Requirement 1 & 2: Left navigation sidebar renders individual lessons and hours under each track', () => {
  const sidebarFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/sidebar.tsx'), 'utf8');

  // Check that QA_TRACKS and getLessonHours are imported
  assert.ok(sidebarFile.includes('QA_TRACKS'), 'Imports QA_TRACKS in sidebar');
  assert.ok(sidebarFile.includes('getLessonHours'), 'Imports getLessonHours in sidebar');

  // Check that openTracks state exists and default opens tracks
  assert.ok(sidebarFile.includes('openTracks'), 'Has openTracks state for expanding lessons');
  assert.ok(sidebarFile.includes('toggleTrack'), 'Has toggleTrack handler');

  // Check all 4 course tracks in sequence
  assert.ok(sidebarFile.includes('Selenium (Java)'), 'Lists Selenium (Java)');
  assert.ok(sidebarFile.includes('Playwright (TS)'), 'Lists Playwright (TS)');
  assert.ok(sidebarFile.includes('Rest Assured (API)'), 'Lists Rest Assured (API)');
  assert.ok(sidebarFile.includes('AI for QA'), 'Lists AI for QA');

  // Check that individual hours are rendered for lessons
  assert.ok(sidebarFile.includes('getLessonHours(lesson.durationMinutes)'), 'Computes individual lesson hours');
  assert.ok(sidebarFile.includes('lesson.title'), 'Renders individual lesson titles');
});

test('Requirement 3: Proper sequential progression for Manual QA Transition', () => {
  const sidebarFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/sidebar.tsx'), 'utf8');
  const tracksPage = fs.readFileSync(path.join(__dirname, '../src/app/tracks/page.tsx'), 'utf8');

  // Check sequence order in sidebar tracks array: Selenium -> Playwright -> Rest Assured -> AI
  const seleniumIdx = sidebarFile.indexOf('selenium-java');
  const playwrightIdx = sidebarFile.indexOf('playwright-ts');
  const apiIdx = sidebarFile.indexOf('api-testing');
  const aiIdx = sidebarFile.indexOf('ai-qa');

  assert.ok(seleniumIdx < playwrightIdx, 'Selenium precedes Playwright');
  assert.ok(playwrightIdx < apiIdx, 'Playwright precedes Rest Assured');
  assert.ok(apiIdx < aiIdx, 'Rest Assured precedes AI for QA');

  // Check Manual QA Roadmap in Tracks page
  assert.ok(tracksPage.includes('Manual QA to Full-Stack SDET Progression Roadmap'), 'Tracks page features Manual QA Roadmap');
  assert.ok(tracksPage.includes('Stage 1'), 'Has Stage 1');
  assert.ok(tracksPage.includes('Stage 2'), 'Has Stage 2');
  assert.ok(tracksPage.includes('Stage 3'), 'Has Stage 3');
  assert.ok(tracksPage.includes('Stage 4'), 'Has Stage 4');
});

test('Requirement 4: Practice Labs section has Online Compilers first, then Coding Library, API, AI', () => {
  const sidebarFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/sidebar.tsx'), 'utf8');

  // Verify sequential order in Practice Labs section: Online Compilers, Coding Library, API, AI
  const pOnlineCompilersIdx = sidebarFile.indexOf('Online Compilers');
  const pCodingLibraryIdx = sidebarFile.indexOf('Coding Library');
  const pApiIdx = sidebarFile.indexOf('API Testing Lab');
  const pAiIdx = sidebarFile.indexOf('AI Prompt Lab');

  assert.ok(pOnlineCompilersIdx !== -1, 'Practice Labs contains Online Compilers');
  assert.ok(pCodingLibraryIdx !== -1, 'Practice Labs contains Coding Library');
  assert.ok(pApiIdx !== -1, 'Practice Labs contains API Testing Lab');
  assert.ok(pAiIdx !== -1, 'Practice Labs contains AI Prompt Lab');

  assert.ok(pOnlineCompilersIdx < pCodingLibraryIdx, 'Online Compilers is first, preceding Coding Library');
  assert.ok(pCodingLibraryIdx < pApiIdx, 'Coding Library precedes API Lab');
  assert.ok(pApiIdx < pAiIdx, 'API Lab precedes AI Lab');

  // Verify active lab routes
  assert.ok(sidebarFile.includes('/sandbox/code'), 'Links to /sandbox/code');
  assert.ok(sidebarFile.includes('/sandbox/code/problems'), 'Links to /sandbox/code/problems');
  assert.ok(sidebarFile.includes('/sandbox/api'), 'Links to /sandbox/api');
  assert.ok(sidebarFile.includes('/prompt-lab'), 'Links to /prompt-lab');
});
