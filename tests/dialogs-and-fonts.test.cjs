const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Dialogues implement explicit Cancel button, backdrop dismissal, and Escape key handling', () => {
  // 1. WhatsApp Daily Modal
  const whatsappFile = fs.readFileSync(path.join(__dirname, '../src/components/whatsapp/whatsapp-daily-modal.tsx'), 'utf8');
  assert.ok(whatsappFile.includes('Cancel'), 'WhatsApp modal has explicit Cancel button');
  assert.ok(whatsappFile.includes('handleClose'), 'WhatsApp modal has close handler');
  assert.ok(whatsappFile.includes('Escape'), 'WhatsApp modal listens for Escape key');
  assert.ok(whatsappFile.includes('e.target === e.currentTarget'), 'WhatsApp modal dismisses on backdrop click');

  // 2. Gemini Key Modal
  const geminiModalFile = fs.readFileSync(path.join(__dirname, '../src/components/auth/gemini-key-modal.tsx'), 'utf8');
  assert.ok(geminiModalFile.includes('Cancel'), 'Gemini Key modal has explicit Cancel button');
  assert.ok(geminiModalFile.includes('onClose'), 'Gemini Key modal has onClose prop invoked on Cancel');
  assert.ok(geminiModalFile.includes('Escape'), 'Gemini Key modal listens for Escape key');
  assert.ok(geminiModalFile.includes('e.target === e.currentTarget'), 'Gemini Key modal dismisses on backdrop click');

  // 3. Profile Modal
  const profileModalFile = fs.readFileSync(path.join(__dirname, '../src/components/profile/profile-modal.tsx'), 'utf8');
  assert.ok(profileModalFile.includes('Cancel'), 'Profile modal has explicit Cancel button');
  assert.ok(profileModalFile.includes('Escape'), 'Profile modal listens for Escape key');
  assert.ok(profileModalFile.includes('e.target === e.currentTarget'), 'Profile modal dismisses on backdrop click');
});

test('Font sizes across site are upgraded to readable baseline', () => {
  const homePageFile = fs.readFileSync(path.join(__dirname, '../src/app/page.tsx'), 'utf8');

  // FAQ Questions are increased and Answers are at least text-base
  assert.ok(
    homePageFile.includes('text-base sm:text-lg font-medium') ||
    homePageFile.includes('text-lg sm:text-xl font-bold text-slate-900'),
    'FAQ questions have readable font size'
  );
  assert.ok(
    homePageFile.includes('leading-relaxed') && (homePageFile.includes('text-sm sm:text-base') || homePageFile.includes('leading-relaxed text-base')),
    'FAQ answers have upgraded font size'
  );

  // Headings have larger typography
  assert.ok(
    homePageFile.includes('text-3xl sm:text-4xl') || homePageFile.includes('text-4xl sm:text-5xl') || homePageFile.includes('text-xl sm:text-2xl font-bold text-slate-900'),
    'Section titles have enlarged font sizes'
  );
  assert.ok(
    homePageFile.includes('leading-relaxed'),
    'Body text uses readable leading-relaxed'
  );

  // Interview Questions Page has larger questions and answers
  const interviewFile = fs.readFileSync(path.join(__dirname, '../src/app/interview-questions/page.tsx'), 'utf8');
  assert.ok(interviewFile.includes('text-lg sm:text-xl leading-snug'), 'Interview questions have enlarged text');
  assert.ok(interviewFile.includes('text-base text-slate-700 dark:text-slate-300 leading-relaxed'), 'Interview answers are text-base');

  // Header navigation has upgraded text-sm font size (not tiny text-xs)
  const headerFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/header.tsx'), 'utf8');
  assert.ok(headerFile.includes('text-sm font-semibold text-slate-600'), 'Header nav links are text-sm');

  // Footer has upgraded text-sm font size
  const footerFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/footer.tsx'), 'utf8');
  assert.ok(footerFile.includes('text-sm py-12'), 'Footer base text is text-sm');
});
