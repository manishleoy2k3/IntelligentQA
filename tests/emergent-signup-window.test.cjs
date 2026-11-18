const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Emergent Sign-Up Window: Visual & Structural Match with Target Design', () => {
  const cardPath = path.join(process.cwd(), 'src/components/auth/ascent-auth-card.tsx');
  const content = fs.readFileSync(cardPath, 'utf-8');

  // 1. Top Emblem & Close Button
  assert.ok(content.includes('chrome-grad-1'), 'Has 3D chrome/metallic emblem gradient');
  assert.ok(content.includes('aria-label="Close"'), 'Has top-right close X button');

  // 2. Both Admin and Student Portal Switcher
  assert.ok(content.includes('Student Portal'), 'Has Student Portal option');
  assert.ok(content.includes('Admin Portal'), 'Has Admin Portal option');
  assert.ok(content.includes('accountType'), 'Has accountType state for dual portal support');

  // 3. Emergent Big Typography
  assert.ok(content.includes('Describe your idea'), 'Features Emergent primary headline');
  assert.ok(content.includes('Build websites & apps with'), 'Features Emergent secondary headline');
  assert.ok(content.includes('text-[#81FF89]') || content.includes('text-emerald'), 'Features glowing green AI accent');

  // 4. Primary White Pill Google Button
  assert.ok(content.includes('Continue with Google'), 'Features primary Continue with Google CTA');

  // 5. Social Icons Row (GitHub, Apple, Facebook)
  assert.ok(content.includes('handleSocialSignIn(\'github\')'), 'Has GitHub social button');
  assert.ok(content.includes('handleSocialSignIn(\'apple\')'), 'Has Apple social button');
  assert.ok(content.includes('handleSocialSignIn(\'facebook\')'), 'Has Facebook social button');

  // 6. Dashed OR Divider
  assert.ok(content.includes('border-dashed') && content.includes('OR'), 'Features dashed OR divider');

  // 7. Secondary Action Pills
  assert.ok(content.includes('Continue with Email'), 'Features Continue with Email button');
  assert.ok(content.includes('Continue with Phone'), 'Features Continue with Phone button');

  // 8. Footer Disclaimer
  assert.ok(
    content.includes('Terms of Service') && content.includes('Privacy Policy'),
    'Features Terms of Service and Privacy Policy disclaimer at bottom'
  );
});

test('Emergent Sign-Up Window: Dual-mode routing for Student and Admin', () => {
  const cardPath = path.join(process.cwd(), 'src/components/auth/ascent-auth-card.tsx');
  const content = fs.readFileSync(cardPath, 'utf-8');

  assert.ok(content.includes("router.push('/admin')"), 'Admin selection routes directly to /admin');
  assert.ok(content.includes('router.push(redirectTo)'), 'Student selection routes to destination / dashboard');
});

test('AuthModal exists for modal trigger anywhere across the application', () => {
  const modalPath = path.join(process.cwd(), 'src/components/auth/auth-modal.tsx');
  assert.ok(fs.existsSync(modalPath), 'auth-modal.tsx component must exist');

  const content = fs.readFileSync(modalPath, 'utf-8');
  assert.ok(content.includes('AscentAuthCard'), 'Embeds AscentAuthCard');
  assert.ok(content.includes('intelligentqa_open_auth_modal'), 'Listens for global open event');
});
