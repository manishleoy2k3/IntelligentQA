const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');

const jiti = require('jiti')(path.resolve(process.cwd(), 'tests/interview-griller.test.cjs'), {
  alias: { '@': path.resolve(process.cwd(), 'src') }
});

const {
  getAllInterviewQuestions,
} = jiti('../src/lib/interview-questions-bank.ts');

test('Requirement 1: Junior QA / SDET gets questions in Easy, Medium, and Hard for Playwright & Selenium', () => {
  const allQuestions = getAllInterviewQuestions();

  // Playwright Junior (0-2 Years)
  const pwJunior = allQuestions.filter(
    q => q.technology === 'Playwright' && q.experienceLevel === '0-2 Years'
  );
  assert.ok(pwJunior.length >= 6, `Expected at least 6 Playwright Junior questions, got ${pwJunior.length}`);
  const pwJuniorEasy = pwJunior.filter(q => q.difficulty === 'Easy');
  const pwJuniorMedium = pwJunior.filter(q => q.difficulty === 'Medium');
  const pwJuniorHard = pwJunior.filter(q => q.difficulty === 'Hard');

  assert.ok(pwJuniorEasy.length >= 2, `Expected Easy Playwright Junior questions, got ${pwJuniorEasy.length}`);
  assert.ok(pwJuniorMedium.length >= 2, `Expected Medium Playwright Junior questions, got ${pwJuniorMedium.length}`);
  assert.ok(pwJuniorHard.length >= 2, `Expected Hard Playwright Junior questions, got ${pwJuniorHard.length}`);

  // Selenium Junior (0-2 Years)
  const selJunior = allQuestions.filter(
    q => q.technology === 'Selenium' && q.experienceLevel === '0-2 Years'
  );
  assert.ok(selJunior.length >= 6, `Expected at least 6 Selenium Junior questions, got ${selJunior.length}`);
  const selJuniorEasy = selJunior.filter(q => q.difficulty === 'Easy');
  const selJuniorMedium = selJunior.filter(q => q.difficulty === 'Medium');
  const selJuniorHard = selJunior.filter(q => q.difficulty === 'Hard');

  assert.ok(selJuniorEasy.length >= 2, `Expected Easy Selenium Junior questions, got ${selJuniorEasy.length}`);
  assert.ok(selJuniorMedium.length >= 2, `Expected Medium Selenium Junior questions, got ${selJuniorMedium.length}`);
  assert.ok(selJuniorHard.length >= 2, `Expected Hard Selenium Junior questions, got ${selJuniorHard.length}`);
});

test('Requirement 2: Mid SDET gets questions in Easy, Medium, and Hard for Playwright & Selenium', () => {
  const allQuestions = getAllInterviewQuestions();

  // Playwright Mid (3-5 Years)
  const pwMid = allQuestions.filter(
    q => q.technology === 'Playwright' && q.experienceLevel === '3-5 Years'
  );
  assert.ok(pwMid.length >= 6, `Expected at least 6 Playwright Mid questions, got ${pwMid.length}`);
  const pwMidEasy = pwMid.filter(q => q.difficulty === 'Easy');
  const pwMidMedium = pwMid.filter(q => q.difficulty === 'Medium');
  const pwMidHard = pwMid.filter(q => q.difficulty === 'Hard');

  assert.ok(pwMidEasy.length >= 2, `Expected Easy Playwright Mid questions, got ${pwMidEasy.length}`);
  assert.ok(pwMidMedium.length >= 2, `Expected Medium Playwright Mid questions, got ${pwMidMedium.length}`);
  assert.ok(pwMidHard.length >= 2, `Expected Hard Playwright Mid questions, got ${pwMidHard.length}`);

  // Selenium Mid (3-5 Years)
  const selMid = allQuestions.filter(
    q => q.technology === 'Selenium' && q.experienceLevel === '3-5 Years'
  );
  assert.ok(selMid.length >= 6, `Expected at least 6 Selenium Mid questions, got ${selMid.length}`);
  const selMidEasy = selMid.filter(q => q.difficulty === 'Easy');
  const selMidMedium = selMid.filter(q => q.difficulty === 'Medium');
  const selMidHard = selMid.filter(q => q.difficulty === 'Hard');

  assert.ok(selMidEasy.length >= 2, `Expected Easy Selenium Mid questions, got ${selMidEasy.length}`);
  assert.ok(selMidMedium.length >= 2, `Expected Medium Selenium Mid questions, got ${selMidMedium.length}`);
  assert.ok(selMidHard.length >= 2, `Expected Hard Selenium Mid questions, got ${selMidHard.length}`);
});

test('Requirement 3: Senior SDET gets questions in Easy, Medium, and Hard for Playwright & Selenium', () => {
  const allQuestions = getAllInterviewQuestions();

  // Playwright Senior (6-9 Years)
  const pwSenior = allQuestions.filter(
    q => q.technology === 'Playwright' && q.experienceLevel === '6-9 Years'
  );
  assert.ok(pwSenior.length >= 6, `Expected at least 6 Playwright Senior questions, got ${pwSenior.length}`);
  assert.ok(pwSenior.some(q => q.difficulty === 'Easy'), 'Has Easy Playwright Senior questions');
  assert.ok(pwSenior.some(q => q.difficulty === 'Medium'), 'Has Medium Playwright Senior questions');
  assert.ok(pwSenior.some(q => q.difficulty === 'Hard'), 'Has Hard Playwright Senior questions');

  // Selenium Senior (6-9 Years)
  const selSenior = allQuestions.filter(
    q => q.technology === 'Selenium' && q.experienceLevel === '6-9 Years'
  );
  assert.ok(selSenior.length >= 6, `Expected at least 6 Selenium Senior questions, got ${selSenior.length}`);
  assert.ok(selSenior.some(q => q.difficulty === 'Easy'), 'Has Easy Selenium Senior questions');
  assert.ok(selSenior.some(q => q.difficulty === 'Medium'), 'Has Medium Selenium Senior questions');
  assert.ok(selSenior.some(q => q.difficulty === 'Hard'), 'Has Hard Selenium Senior questions');
});

test('Requirement 4: UI supports multi-tier filtering (Tech Stack, Experience Level, Difficulty Mode) and progressive sorting', () => {
  const uiFile = fs.readFileSync(path.join(__dirname, '../src/app/interview-questions/page.tsx'), 'utf8');

  // Check state and selectors for Tech Stack, Experience Level, and Difficulty Mode
  assert.ok(uiFile.includes('selectedTech'), 'Has selectedTech filter');
  assert.ok(uiFile.includes('selectedExpLevel'), 'Has selectedExpLevel filter');
  assert.ok(uiFile.includes('selectedDifficulty'), 'Has selectedDifficulty filter');

  // Check Experience Level options
  assert.ok(uiFile.includes('Junior QA / SDET (0-2 Yrs)'), 'Has Junior option');
  assert.ok(uiFile.includes('Mid SDET (2-5 Yrs)'), 'Has Mid SDET option');
  assert.ok(uiFile.includes('Senior SDET (5-8 Yrs)'), 'Has Senior SDET option');

  // Check Difficulty mode options and pills
  assert.ok(uiFile.includes('Easy Mode'), 'Has Easy Mode');
  assert.ok(uiFile.includes('Medium Mode'), 'Has Medium Mode');
  assert.ok(uiFile.includes('Hard Mode'), 'Has Hard Mode');

  // Check progressive sorting (Easy -> Medium -> Hard -> Architect)
  assert.ok(uiFile.includes('difficultyRank'), 'Has difficultyRank sorting map');
  assert.ok(uiFile.includes('rankA - rankB'), 'Sorts questions progressively by difficulty');
});
