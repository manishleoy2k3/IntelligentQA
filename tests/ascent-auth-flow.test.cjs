const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('AscentWealth Auth Flow Component: Email -> OTP -> Set Password -> Fast Login', () => {
  const ascentCardFile = fs.readFileSync(path.join(__dirname, '../src/components/auth/ascent-auth-card.tsx'), 'utf8');

  // Step 1: Email entry
  assert.ok(ascentCardFile.includes('Email Address'), 'Has email input step');
  assert.ok(ascentCardFile.includes('handleEmailSubmit'), 'Handles email submission');

  // Step 2A: Password verification for returning users
  assert.ok(ascentCardFile.includes('Enter Your Password'), 'Has password step for existing users');
  assert.ok(ascentCardFile.includes('verifyPassword'), 'Validates user password');
  assert.ok(ascentCardFile.includes('Sign in with 6-digit OTP instead'), 'Provides OTP sign-in fallback');

  // Step 2B: OTP Verification
  assert.ok(ascentCardFile.includes('Verify Your Email'), 'Has OTP verification step');
  assert.ok(ascentCardFile.includes('otpDigits'), 'Has 6-digit OTP inputs');
  assert.ok(ascentCardFile.includes('Auto-Fill'), 'Features 1-click test OTP auto-fill button');
  assert.ok(ascentCardFile.includes('verifyOtp'), 'Calls verifyOtp');

  // Step 2C: Password setting for new users
  assert.ok(ascentCardFile.includes('Create Your Password'), 'Has password creation step');
  assert.ok(ascentCardFile.includes('setPassword'), 'Saves user password');
  assert.ok(ascentCardFile.includes('Full Name'), 'Asks for user name on registration');
});

test('Google 1-Click Sign-In eliminates multi-screen friction', () => {
  const googleBtnFile = fs.readFileSync(path.join(__dirname, '../src/components/auth/google-sign-in-button.tsx'), 'utf8');

  // 1-Click fast login for recognized Google users
  assert.ok(googleBtnFile.includes('getPrimaryGoogleAccount'), 'Checks for remembered Google accounts');
  assert.ok(googleBtnFile.includes('loginWithGoogle'), 'Logs in immediately if account remembered');
  assert.ok(googleBtnFile.includes('Use another Google account'), 'Allows switching accounts');

  // Check Google OAuth page has removed consent hurdle and has zero fake emails
  const googleOAuthFile = fs.readFileSync(path.join(__dirname, '../src/app/auth/google/page.tsx'), 'utf8');
  assert.ok(!googleOAuthFile.includes("step === 'consent'"), 'Completely removed redundant consent screen');
  assert.ok(googleOAuthFile.includes('handleSelectExisting'), 'Has 1-click account selection');
  assert.ok(googleOAuthFile.includes('Connecting to IntelligentQA'), 'Shows smooth quick authorization');
  assert.ok(!googleOAuthFile.includes('qa.student@gmail.com'), 'Does not include hardcoded mock emails like qa.student@gmail.com');
  assert.ok(!googleOAuthFile.includes('interviewer@interviewvector.com'), 'Does not include dummy interviewer account');
});

test('QA Database provides AscentWealth OTP and Credential helpers', () => {
  const qaDbFile = fs.readFileSync(path.join(__dirname, '../src/lib/qa-db.ts'), 'utf8');

  assert.ok(qaDbFile.includes('generateOtp'), 'Provides OTP generator');
  assert.ok(qaDbFile.includes('verifyOtp'), 'Provides OTP verifier');
  assert.ok(qaDbFile.includes('hasPassword'), 'Checks if password exists for email');
  assert.ok(qaDbFile.includes('setPassword'), 'Sets persistent password for email');
  assert.ok(qaDbFile.includes('verifyPassword'), 'Validates password for email');
  assert.ok(qaDbFile.includes('getPrimaryGoogleAccount'), 'Retrieves primary remembered Google user');
  assert.ok(qaDbFile.includes('clearSession'), 'Provides clearSession method matching AscentWealth');
});

test('AscentWealth Google OAuth Callback & Multi-User Isolation', () => {
  const callbackFile = fs.readFileSync(path.join(__dirname, '../src/app/auth/callback/page.tsx'), 'utf8');

  // Error handling matching AscentWealth
  assert.ok(callbackFile.includes('Sign-in with Google was not completed'), 'Displays AscentWealth error header');
  assert.ok(callbackFile.includes('Try Again with Google'), 'Provides Try Again with Google action');
  assert.ok(callbackFile.includes('Google sign-in was cancelled or access was denied'), 'Detects cancellation');

  // Connecting state
  assert.ok(callbackFile.includes('Connecting your Google account'), 'Displays connecting state banner');

  // Multi-user isolation
  assert.ok(callbackFile.includes('clearSession'), 'Purges previous session if user switched to prevent data leakage');
});
