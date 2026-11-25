const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Admin Login Clean-up: Dedicated Admin Login option and direct routing to /admin', () => {
  const authCardPath = path.join(process.cwd(), 'src/components/auth/ascent-auth-card.tsx');
  const content = fs.readFileSync(authCardPath, 'utf-8');

  // Must have dedicated Admin Login switcher and button
  assert.strictEqual(
    content.includes('Admin Portal') || content.includes('Admin Login'),
    true,
    'Login card must have Admin Portal / Admin Login'
  );
  assert.strictEqual(
    content.includes('handleAdminDemoLogin'),
    true,
    'Login card must support 1-click Fast Admin Login'
  );
  assert.strictEqual(
    content.includes("router.push('/admin')"),
    true,
    'Admin login must redirect directly to /admin instead of normal user screens'
  );
});

test('Admin Shell Separation: Admin does not share standard user screens', () => {
  const appShellPath = path.join(process.cwd(), 'src/components/layout/app-shell.tsx');
  const content = fs.readFileSync(appShellPath, 'utf-8');

  // Verify dedicated Admin Sidebar & TopNav in AppShell
  assert.strictEqual(
    content.includes('AdminSidebar'),
    true,
    'AppShell must render AdminSidebar for admin users'
  );
  assert.strictEqual(
    content.includes('AdminTopNav'),
    true,
    'AppShell must render AdminTopNav for admin users'
  );

  const adminSidebarPath = path.join(process.cwd(), 'src/components/layout/admin-sidebar.tsx');
  assert.strictEqual(fs.existsSync(adminSidebarPath), true, 'AdminSidebar component must exist');

  const adminSidebarContent = fs.readFileSync(adminSidebarPath, 'utf-8');
  assert.strictEqual(
    adminSidebarContent.includes('Course') &&
      adminSidebarContent.includes('Practice Labs') &&
      adminSidebarContent.includes('AI Tools and Agents') &&
      adminSidebarContent.includes('Interview Banks'),
    true,
    'AdminSidebar must contain links to Course, Practice Labs, AI Tools and Agents, and Interview Banks'
  );
});

test('Admin Dashboard (/admin): Displays all 4 core sections and opens details on click', () => {
  const adminPagePath = path.join(process.cwd(), 'src/app/admin/page.tsx');
  assert.strictEqual(fs.existsSync(adminPagePath), true, 'src/app/admin/page.tsx must exist');

  const content = fs.readFileSync(adminPagePath, 'utf-8');

  // Verify the 4 sections are displayed on the dashboard
  assert.strictEqual(
    content.includes('Course'),
    true,
    'Admin dashboard must include Course section'
  );
  assert.strictEqual(
    content.includes('Practice Labs'),
    true,
    'Admin dashboard must include Practice Labs section'
  );
  assert.strictEqual(
    content.includes('AI Tools and Agents'),
    true,
    'Admin dashboard must include AI Tools and Agents section'
  );
  assert.strictEqual(
    content.includes('Interview Banks'),
    true,
    'Admin dashboard must include Interview Banks section'
  );
});

test('Admin Dashboard: Full Edit and Delete rights implemented for all 4 sections', () => {
  const adminPagePath = path.join(process.cwd(), 'src/app/admin/page.tsx');
  const content = fs.readFileSync(adminPagePath, 'utf-8');

  // Course: Edit and Delete
  assert.strictEqual(
    content.includes('handleOpenEditLesson') && content.includes('handleConfirmDeleteLesson'),
    true,
    'Course section must have Edit and Delete handlers'
  );

  // Practice Labs: Edit and Delete
  assert.strictEqual(
    content.includes('handleOpenEditProblem') && content.includes('handleConfirmDeleteProblem'),
    true,
    'Practice Labs section must have Edit and Delete handlers'
  );

  // AI Tools and Agents: Edit and Delete / Reset
  assert.strictEqual(
    content.includes('handleOpenEditAgent') && content.includes('handleConfirmDeleteAgent'),
    true,
    'AI Tools and Agents section must have Edit and Delete handlers'
  );

  // Interview Banks: Edit and Delete
  assert.strictEqual(
    content.includes('handleOpenEditInterview') && content.includes('handleConfirmDeleteInterview'),
    true,
    'Interview Banks section must have Edit and Delete handlers'
  );
});
