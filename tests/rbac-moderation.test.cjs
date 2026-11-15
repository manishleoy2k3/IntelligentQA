const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Admin security: No public client-side toggle to become Admin in TopNav', () => {
  const topNavPath = path.join(process.cwd(), 'src/components/layout/top-nav.tsx');
  const content = fs.readFileSync(topNavPath, 'utf-8');

  // Must not have the open simulator toggle that allows anyone to click become admin
  assert.strictEqual(
    content.includes('Activate Admin Role →'),
    false,
    'TopNav should not contain public Activate Admin Role button'
  );

  // Must contain secure Admin Access Gateway and passcode modal
  assert.strictEqual(
    content.includes('Admin Access Gateway'),
    true,
    'TopNav must contain Admin Access Gateway for authorized personnel'
  );
  assert.strictEqual(
    content.includes('verifyAndElevateAdmin'),
    true,
    'TopNav must call verifyAndElevateAdmin with passcode'
  );
});

test('RBAC & Moderation in QADatabase: Admin allowlist and content approval queue exist', () => {
  const dbPath = path.join(process.cwd(), 'src/lib/qa-db.ts');
  const content = fs.readFileSync(dbPath, 'utf-8');

  // Verify Admin allowlist methods
  assert.strictEqual(content.includes('getAdminEmails'), true, 'QADatabase must implement getAdminEmails');
  assert.strictEqual(content.includes('addAdminEmail'), true, 'QADatabase must implement addAdminEmail');
  assert.strictEqual(content.includes('removeAdminEmail'), true, 'QADatabase must implement removeAdminEmail');
  assert.strictEqual(content.includes('verifyAndElevateAdmin'), true, 'QADatabase must implement verifyAndElevateAdmin');

  // Verify Moderation Queue methods
  assert.strictEqual(content.includes('submitContentForReview'), true, 'QADatabase must implement submitContentForReview');
  assert.strictEqual(content.includes('getPendingSubmissions'), true, 'QADatabase must implement getPendingSubmissions');
  assert.strictEqual(content.includes('approveSubmission'), true, 'QADatabase must implement approveSubmission');
  assert.strictEqual(content.includes('rejectSubmission'), true, 'QADatabase must implement rejectSubmission');
});

test('Course CMS Portal: Approvals Queue and Admin Team & RBAC management are implemented', () => {
  const cmsPath = path.join(process.cwd(), 'src/app/admin/cms/page.tsx');
  const content = fs.readFileSync(cmsPath, 'utf-8');

  assert.strictEqual(content.includes('Approvals Queue'), true, 'CMS must have Approvals Queue tab');
  assert.strictEqual(content.includes('Admin Team &amp; RBAC') || content.includes('Admin Team'), true, 'CMS must have Admin Team & RBAC tab');
  assert.strictEqual(content.includes('Authorized Administrator Accounts'), true, 'CMS must display Authorized Administrators');
  assert.strictEqual(content.includes('Master Admin Security Passcode'), true, 'CMS must support Master Admin Passcode');
  assert.strictEqual(content.includes('approveSubmission'), true, 'CMS must support approving submissions');
  assert.strictEqual(content.includes('rejectSubmission'), true, 'CMS must support rejecting submissions');
});

test('Normal users submit guides and coding problems for Admin review instead of direct publish', () => {
  const guidesPath = path.join(process.cwd(), 'src/app/guides/[trackId]/guide-catalog-client.tsx');
  const guidesContent = fs.readFileSync(guidesPath, 'utf-8');
  assert.strictEqual(
    guidesContent.includes('submitContentForReview'),
    true,
    'Guides catalog must submit community guides for review if not admin'
  );

  const problemsPath = path.join(process.cwd(), 'src/app/sandbox/code/problems/page.tsx');
  const problemsContent = fs.readFileSync(problemsPath, 'utf-8');
  assert.strictEqual(
    problemsContent.includes('submitContentForReview'),
    true,
    'Problems page must submit community problems for review if not admin'
  );
  assert.strictEqual(
    problemsContent.includes('isAdmin && prob.isCustom'),
    true,
    'Only admins should be able to delete problems'
  );
});
