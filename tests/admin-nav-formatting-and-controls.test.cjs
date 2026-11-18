const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('1. Interview Question Answer: Formatting preserved with FormattedInterviewAnswer component', () => {
  const compPath = path.join(process.cwd(), 'src/components/ui/formatted-interview-answer.tsx');
  assert.strictEqual(fs.existsSync(compPath), true, 'formatted-interview-answer.tsx must exist');

  const compContent = fs.readFileSync(compPath, 'utf-8');
  assert.strictEqual(
    compContent.includes('whitespace-pre-wrap') && compContent.includes('renderInlineFormatted'),
    true,
    'Component must preserve whitespace, linebreaks, and parse inline markdown'
  );

  const studentPagePath = path.join(process.cwd(), 'src/app/interview-questions/page.tsx');
  const studentPageContent = fs.readFileSync(studentPagePath, 'utf-8');
  assert.strictEqual(
    studentPageContent.includes('FormattedInterviewAnswer') &&
    studentPageContent.includes('<FormattedInterviewAnswer text={item.answerSummary} />'),
    true,
    'Student interview questions page must render answers via FormattedInterviewAnswer'
  );

  const adminPagePath = path.join(process.cwd(), 'src/app/admin/page.tsx');
  const adminPageContent = fs.readFileSync(adminPagePath, 'utf-8');
  assert.strictEqual(
    adminPageContent.includes('FormattedInterviewAnswer') &&
    adminPageContent.includes('whitespace-pre-wrap'),
    true,
    'Admin page must use FormattedInterviewAnswer and whitespace-pre-wrap for interview answers'
  );
});

test('2. Preview Student Portal and Profile details moved from left nav bottom to top right corner', () => {
  const sidebarPath = path.join(process.cwd(), 'src/components/layout/admin-sidebar.tsx');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');

  // Left nav bottom should not have Preview Student Portal or Log Out footer
  assert.strictEqual(
    sidebarContent.includes('Preview Student Portal'),
    false,
    'Left navigation bottom must NOT have Preview Student Portal'
  );
  assert.strictEqual(
    sidebarContent.includes('Exit Admin & Log Out'),
    false,
    'Left navigation bottom must NOT have Exit Admin & Log Out'
  );

  // TopNav must have Preview Student Portal and Profile Details in top right corner
  const topNavPath = path.join(process.cwd(), 'src/components/layout/admin-top-nav.tsx');
  const topNavContent = fs.readFileSync(topNavPath, 'utf-8');

  assert.strictEqual(
    topNavContent.includes('Preview Student Portal'),
    true,
    'AdminTopNav must have Preview Student Portal in top right corner'
  );
  assert.strictEqual(
    topNavContent.includes('admin-profile-menu-container') &&
    topNavContent.includes('ProfileModal') &&
    topNavContent.includes('profileMenuOpen'),
    true,
    'AdminTopNav must contain profile details dropdown matching normal user implementation'
  );
});

test('3. Removed user email and name above Management section in left nav', () => {
  const sidebarPath = path.join(process.cwd(), 'src/components/layout/admin-sidebar.tsx');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');

  assert.strictEqual(
    sidebarContent.includes('Admin Profile Pill'),
    false,
    'Admin user email/name pill above Management Sections must be removed'
  );
  assert.strictEqual(
    sidebarContent.includes('currentUser?.email'),
    false,
    'Sidebar must not render redundant user email'
  );
});

test('4. Removed "Command center" badge and section sub text that was hiding text', () => {
  const sidebarPath = path.join(process.cwd(), 'src/components/layout/admin-sidebar.tsx');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');

  assert.strictEqual(
    sidebarContent.includes('Command Center'),
    false,
    'Sidebar must NOT contain "Command Center" badge that hides Admin Dashboard text'
  );
  assert.strictEqual(
    sidebarContent.includes('Tracks & Docs') || sidebarContent.includes('Coding & Sandboxes'),
    false,
    'Sidebar navigation items must not have squishing badge subtext'
  );
});

test('5. Removed Factory reset and Preview Student Portal buttons from right of Admin Control Center', () => {
  const adminPagePath = path.join(process.cwd(), 'src/app/admin/page.tsx');
  const adminPageContent = fs.readFileSync(adminPagePath, 'utf-8');

  // Verify the header only has the title and no Factory Reset or Preview Student Portal button next to it
  const headerSection = adminPageContent.substring(
    adminPageContent.indexOf('Admin Control Center') - 300,
    adminPageContent.indexOf('Admin Control Center') + 400
  );

  assert.strictEqual(
    headerSection.includes('Factory Reset'),
    false,
    'Header next to Admin Control Center must NOT contain Factory Reset'
  );
  assert.strictEqual(
    headerSection.includes('Preview Student Portal'),
    false,
    'Header next to Admin Control Center must NOT contain Preview Student Portal'
  );
});
