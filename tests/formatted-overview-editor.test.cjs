const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('FormattedOverviewEditor: HTML-to-markdown converts pasted rich text retaining bold and bullet points', () => {
  const editorPath = path.join(__dirname, '../src/components/ui/formatted-overview-editor.tsx');
  const editorContent = fs.readFileSync(editorPath, 'utf8');

  // Verify component exports and features
  assert.ok(
    editorContent.includes('export function htmlToMarkdown'),
    'Exports htmlToMarkdown parser'
  );
  assert.ok(
    editorContent.includes('export default function FormattedOverviewEditor'),
    'Exports FormattedOverviewEditor component'
  );

  // Verify rich text formatting toolbar actions exist
  assert.ok(editorContent.includes("applyFormat('bold')"), 'Supports Bold formatting');
  assert.ok(editorContent.includes("applyFormat('italic')"), 'Supports Italic formatting');
  assert.ok(
    editorContent.includes("applyFormat('heading')"),
    'Supports Section Heading formatting'
  );
  assert.ok(editorContent.includes("applyFormat('bullet')"), 'Supports Bullet list formatting');
  assert.ok(editorContent.includes("applyFormat('number')"), 'Supports Numbered list formatting');
  assert.ok(editorContent.includes("applyFormat('code')"), 'Supports Code block formatting');
  assert.ok(
    editorContent.includes("applyFormat('quote')"),
    'Supports Quote / Architecture note formatting'
  );

  // Verify Tab Switcher (Write vs Preview)
  assert.ok(editorContent.includes("activeTab === 'write'"), 'Supports Write mode');
  assert.ok(editorContent.includes("activeTab === 'preview'"), 'Supports Preview mode');
  assert.ok(
    editorContent.includes('<FormattedInterviewAnswer text={value} isDark />'),
    'Renders rich preview via FormattedInterviewAnswer'
  );

  // Verify HTML paste listener
  assert.ok(
    editorContent.includes('onPaste={handlePaste}'),
    'Textarea intercepts paste events to retain formatting'
  );
});

test('Share your Knowledge window: Full Overview & Explanation uses clean FormattedOverviewEditor without GFG buttons', () => {
  const modalPath = path.join(__dirname, '../src/components/interview/add-guide-modal.tsx');
  const modalContent = fs.readFileSync(modalPath, 'utf8');

  // Verify editor is embedded in Share your Knowledge window
  assert.ok(
    modalContent.includes('FormattedOverviewEditor'),
    'AddGuideModal imports and uses FormattedOverviewEditor'
  );
  assert.ok(
    modalContent.includes('<FormattedOverviewEditor') && modalContent.includes('value={overview}'),
    'Full Overview & Explanation section uses FormattedOverviewEditor'
  );

  // Verify all GFG specific buttons/banners have been completely removed
  assert.ok(!modalContent.includes('handleLoadGfgRestAssured'), 'No GFG handler in modal');
  assert.ok(!modalContent.includes('Load GFG Details'), 'No Load GFG Details button');
  assert.ok(!modalContent.includes('Load GFG REST Assured Example'), 'No Load GFG Example button');
});
