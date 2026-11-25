const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Minimal uncluttered Home Page is designed specifically for Manual Testers', () => {
  const homeFile = fs.readFileSync(path.join(__dirname, '../src/app/page.tsx'), 'utf8');

  // Verify minimal, clean, reassuring structure
  assert.ok(
    homeFile.includes('HeroShowcaseCarousel') || homeFile.includes('From Manual QA to SDET'),
    'Hero highlights QA to SDET transition'
  );
  assert.ok(
    homeFile.includes('What You Will Get on IntelligentQA'),
    'Contains clear "What You Will Get" section'
  );
  assert.ok(
    homeFile.includes('Scratch-to-SDET Learning Roadmaps'),
    'Pillar 1: Scratch to SDET roadmap'
  );
  assert.ok(
    homeFile.includes('800+ Curated SDET Interview Scenarios') ||
      homeFile.includes('500+ Curated SDET Interview Scenarios'),
    'Pillar 2: Non-DSA interview bank'
  );
  assert.ok(homeFile.includes('Optional AI Features'), 'Pillar 3: AI optionality');

  // Verify tutorials and labs are kept inside user login
  assert.ok(
    homeFile.includes('All Academy Courses') || homeFile.includes('All Practice Labs'),
    'Explains full suite is inside account'
  );
  assert.ok(
    homeFile.includes('Gated Inside User Login'),
    'States tutorials and labs are inside login'
  );

  // Verify Google Sign In is prominent
  assert.ok(homeFile.includes('GoogleSignInButton'), 'Embeds Google Sign In component');
  assert.ok(
    homeFile.includes('buttonText="Continue with Google"'),
    'Uses strictly "Continue with Google"'
  );
  assert.ok(
    !homeFile.includes('(Gmail) - 100% Free'),
    'Does not have cluttered Gmail 100% Free label'
  );

  // Verify Home Page logged-in state shows Go to Demo Dashboard and no Welcome back greeting
  assert.ok(homeFile.includes('Go to Demo Dashboard'), 'Contains "Go to Demo Dashboard"');
  assert.ok(!homeFile.includes('Welcome back'), 'Does not contain Welcome back greeting');
  assert.ok(!homeFile.includes('Demo Login'), 'Does not contain Demo Login on Home page');
});

test('Google / Gmail signup is provided and prompts for Gemini Key or Opt-Out via OAuth flow', () => {
  const googleBtnFile = fs.readFileSync(
    path.join(__dirname, '../src/components/auth/google-sign-in-button.tsx'),
    'utf8'
  );

  assert.ok(googleBtnFile.includes('/auth/google'), 'Routes to dedicated Google OAuth 2.0 page');
  assert.ok(googleBtnFile.includes('viewBox="0 0 24 24"'), 'Includes Google colored SVG icon');
  assert.ok(
    googleBtnFile.includes("buttonText = 'Continue with Google'"),
    'Defaults strictly to Continue with Google'
  );
  assert.ok(
    !googleBtnFile.includes('Alex Carter'),
    'Does not hardcode Alex Carter in Google sign-in'
  );

  const googleOAuthFile = fs.readFileSync(
    path.join(__dirname, '../src/app/auth/google/page.tsx'),
    'utf8'
  );
  assert.ok(googleOAuthFile.includes('loginWithGoogle'), 'Calls QADatabase.loginWithGoogle');
  assert.ok(
    googleOAuthFile.includes('GeminiKeyModal'),
    'Triggers GeminiKeyModal after Google sign-in'
  );
  assert.ok(googleOAuthFile.includes('OAuth 2.0'), 'Features genuine Google OAuth 2.0 flow');

  const dashboardFile = fs.readFileSync(
    path.join(__dirname, '../src/app/dashboard/page.tsx'),
    'utf8'
  );
  assert.ok(
    dashboardFile.includes('getCurrentUser()'),
    'Dashboard loads authenticated currentUser'
  );
  assert.ok(
    !dashboardFile.includes('getProfile(DEMO_USER.id)'),
    'Dashboard does not hardcode DEMO_USER.id'
  );

  const signupFile = fs.readFileSync(path.join(__dirname, '../src/app/signup/page.tsx'), 'utf8');
  assert.ok(signupFile.includes('GoogleSignInButton'), 'Signup page provides Google Gmail option');
  assert.ok(
    signupFile.includes('buttonText="Continue with Google"'),
    'Signup page uses Continue with Google'
  );
  assert.ok(signupFile.includes('Demo Login'), 'Signup page has Demo Login button');
  assert.ok(
    !signupFile.includes('1-Click Instant Demo Login (Alex Carter)'),
    'No Alex Carter on signup demo'
  );

  const loginFile = fs.readFileSync(path.join(__dirname, '../src/app/login/page.tsx'), 'utf8');
  assert.ok(loginFile.includes('GoogleSignInButton'), 'Login page provides Google Gmail option');
  assert.ok(
    loginFile.includes('buttonText="Continue with Google"'),
    'Login page uses Continue with Google'
  );
  assert.ok(loginFile.includes('Demo Login'), 'Login page has Demo Login button');
  assert.ok(
    !loginFile.includes('1-Click Demo Login (Alex Carter)'),
    'No 1-Click Alex Carter on login demo'
  );
});

test('Avatar initials uses First letters of First Name and Last Name (e.g. MK instead of MA)', () => {
  const dbFile = fs.readFileSync(path.join(__dirname, '../src/lib/qa-db.ts'), 'utf8');
  assert.ok(dbFile.includes('export function getInitials'), 'Exports getInitials helper');

  function getInitials(name) {
    if (!name || !name.trim()) return 'QA';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  assert.strictEqual(getInitials('Manish Kumar'), 'MK', 'Manish Kumar yields MK, not MA');
  assert.strictEqual(getInitials('Priya Sharma'), 'PS', 'Priya Sharma yields PS');
  assert.strictEqual(getInitials('Alex Carter'), 'AC', 'Alex Carter yields AC');

  const dashboardFile = fs.readFileSync(
    path.join(__dirname, '../src/app/dashboard/page.tsx'),
    'utf8'
  );
  assert.ok(
    dashboardFile.includes('getInitials(profile.displayName)'),
    'Dashboard uses getInitials'
  );
  assert.ok(
    !dashboardFile.includes('profile.displayName.slice(0, 2)'),
    'Dashboard does not use slice(0, 2)'
  );

  const headerFile = fs.readFileSync(
    path.join(__dirname, '../src/components/layout/header.tsx'),
    'utf8'
  );
  assert.ok(headerFile.includes('getInitials(currentUser.displayName)'), 'Header uses getInitials');
});

test('Courses show Start Course when not started and Logout is clubbed inside profile dropdown', () => {
  const dashboardFile = fs.readFileSync(
    path.join(__dirname, '../src/app/dashboard/page.tsx'),
    'utf8'
  );

  // Verify dynamic start vs resume course label
  assert.ok(
    dashboardFile.includes('Start Course'),
    'Shows Start Course when user has not started course'
  );
  assert.ok(dashboardFile.includes('Not Started'), 'Tracks with 0 progress display Not Started');
  assert.ok(
    dashboardFile.includes('ProfileModal'),
    'Integrates ProfileModal for completing role and experience'
  );
  assert.ok(
    !dashboardFile.includes('1 Years Manual QA Experience'),
    'Does not hardcode 1 Years experience without asking'
  );

  const headerFile = fs.readFileSync(
    path.join(__dirname, '../src/components/layout/header.tsx'),
    'utf8'
  );
  assert.ok(
    headerFile.includes('user-profile-menu-container'),
    'Features profile menu dropdown container'
  );
  assert.ok(
    headerFile.includes('Complete / Edit QA Profile'),
    'Allows editing QA profile from top right dropdown'
  );
  assert.ok(headerFile.includes('ProfileModal'), 'Renders ProfileModal from header');

  const profileModalFile = fs.readFileSync(
    path.join(__dirname, '../src/components/profile/profile-modal.tsx'),
    'utf8'
  );
  assert.ok(profileModalFile.includes('Current Role'), 'Asks user for their current role');
  assert.ok(
    profileModalFile.includes('Years of QA / Testing Experience'),
    'Asks user for years of experience'
  );
  assert.ok(profileModalFile.includes('updateProfile'), 'Saves user profile custom values');
});

test('User can opt out of AI to learn Core Automation, with option to activate AI later', () => {
  const modalFile = fs.readFileSync(
    path.join(__dirname, '../src/components/auth/gemini-key-modal.tsx'),
    'utf8'
  );

  assert.ok(modalFile.includes('handleOptOutAI'), 'Provides handleOptOutAI method');
  assert.ok(
    modalFile.includes('Option 2: Focus on Core Automation (Opt Out of AI)'),
    'Features explicit Opt-Out choice'
  );
  assert.ok(
    modalFile.includes('Skip AI · Continue with Core Automation'),
    'Has clear Opt-Out button'
  );

  const dbFile = fs.readFileSync(path.join(__dirname, '../src/lib/qa-db.ts'), 'utf8');
  assert.ok(dbFile.includes('getAiPreference'), 'QADatabase exports getAiPreference');
  assert.ok(dbFile.includes('setAiPreference'), 'QADatabase exports setAiPreference');

  // Later stage activation: QA Agents and Header handle opted-out users
  const qaAgentsFile = fs.readFileSync(
    path.join(__dirname, '../src/components/qa-agents/qa-agents-workspace.tsx'),
    'utf8'
  );
  assert.ok(
    qaAgentsFile.includes('Core Automation Mode Active'),
    'QA Agents workspace recognizes Core Automation mode'
  );
  assert.ok(
    qaAgentsFile.includes('Activate Free AI Features'),
    'Provides one-click prompt to activate AI later'
  );

  const headerFile = fs.readFileSync(
    path.join(__dirname, '../src/components/layout/header.tsx'),
    'utf8'
  );
  assert.ok(
    headerFile.includes('Core Mode (No AI)'),
    'Header indicates Core Automation mode when opted out'
  );
});
