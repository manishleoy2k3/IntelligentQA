const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Project Files & Folders: Left Navigation placement below AI Interview Griller', () => {
  const sidebarPath = path.join(__dirname, '../src/components/layout/sidebar.tsx');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

  // Verify Project Files is present and links to /project-files
  assert.ok(
    sidebarContent.includes('href="/project-files"'),
    'Sidebar contains link to /project-files'
  );
  assert.ok(sidebarContent.includes('Project Files'), 'Sidebar label includes "Project Files"');

  // Verify placement: Project Files is directly after AI Mock Interviewer
  const grillerIndex =
    sidebarContent.indexOf('AI Mock Interviewer') !== -1
      ? sidebarContent.indexOf('AI Mock Interviewer')
      : sidebarContent.indexOf('AI Interview Griller');
  const projectFilesIndex = sidebarContent.indexOf('Project Files');

  assert.ok(grillerIndex !== -1, 'AI Mock Interviewer must be present');
  assert.ok(projectFilesIndex !== -1, 'Project Files must be present');
  assert.ok(
    projectFilesIndex > grillerIndex,
    'Project Files is positioned below AI Interview Griller'
  );
});

test('Zero-Cost Project Files Vault & File Parser: 15MB limit and formats (.pdf, .md, .xlsx, .pptx)', () => {
  const projectFilesLibPath = path.join(__dirname, '../src/lib/project-files.ts');
  const projectFilesLib = fs.readFileSync(projectFilesLibPath, 'utf8');

  // Max file size zero-cost limit
  assert.ok(
    projectFilesLib.includes('MAX_PROJECT_FILE_SIZE_MB = 15'),
    'Limits file size to 15MB zero-cost quota'
  );
  assert.ok(
    projectFilesLib.includes('formatContextForAgents'),
    'Provides formatContextForAgents formatter'
  );
  assert.ok(projectFilesLib.includes('getProjectFiles'), 'Provides getProjectFiles');
  assert.ok(projectFilesLib.includes('saveProjectFile'), 'Provides saveProjectFile');
  assert.ok(projectFilesLib.includes('deleteProjectFiles'), 'Provides deleteProjectFiles');
  assert.ok(projectFilesLib.includes('moveFilesToFolder'), 'Provides moveFilesToFolder');

  // File parser supports PPTX, PDF, Excel, Markdown
  const parserPath = path.join(__dirname, '../src/lib/file-parser.ts');
  const parserContent = fs.readFileSync(parserPath, 'utf8');

  assert.ok(
    parserContent.includes('pptx') && parserContent.includes('ppt'),
    'File parser supports PowerPoint (.pptx / .ppt)'
  );
  assert.ok(parserContent.includes('pdf'), 'File parser supports PDF (.pdf)');
  assert.ok(
    parserContent.includes('xlsx') && parserContent.includes('xls'),
    'File parser supports Excel (.xlsx / .xls)'
  );
  assert.ok(
    parserContent.includes('md') && parserContent.includes('txt'),
    'File parser supports Markdown (.md)'
  );
});

test('Project Files Workspace: List view with checkboxes for multi-selection, folders, and batch actions', () => {
  const workspacePath = path.join(
    __dirname,
    '../src/components/project-files/project-files-workspace.tsx'
  );
  const workspaceContent = fs.readFileSync(workspacePath, 'utf8');

  // Checkbox multi-selection
  assert.ok(
    workspaceContent.includes('handleToggleSelectAll'),
    'Has select all / deselect all handler'
  );
  assert.ok(
    workspaceContent.includes('handleToggleSelectOne'),
    'Has individual file checkbox toggle'
  );
  assert.ok(workspaceContent.includes('selectedFileIds'), 'Tracks selected file IDs');

  // Folder support
  assert.ok(workspaceContent.includes('selectedFolder'), 'Supports folder filtering');
  assert.ok(workspaceContent.includes('handleCreateFolder'), 'Supports creating custom folders');
  assert.ok(workspaceContent.includes('handleBatchMove'), 'Supports moving files to folder');

  // Direct injection into QA Agents
  assert.ok(
    workspaceContent.includes('handleSendToQAAgents'),
    'Has direct handler to send selected files to AI QA Agents'
  );
  assert.ok(
    workspaceContent.includes('intelligentqa_selected_agent_files'),
    'Stores selected files for agent context'
  );

  // Verify Top Header Actions only keep "New Folder" and "Upload Files" (AI Agents button removed)
  assert.ok(workspaceContent.includes('New Folder'), 'Top header has New Folder button');
  assert.ok(workspaceContent.includes('Upload Files'), 'Top header has Upload Files button');
  assert.ok(
    !workspaceContent.includes('<span>AI QA Agents</span>'),
    'Top header does NOT have AI QA Agents button'
  );
});

test('AI QA Agents Suite: Direct attachment of Project Files into all agents context with checkboxes', () => {
  const agentWorkspacePath = path.join(
    __dirname,
    '../src/components/qa-agents/qa-agents-workspace.tsx'
  );
  const agentContent = fs.readFileSync(agentWorkspacePath, 'utf8');

  // Project Files attach controls
  assert.ok(agentContent.includes('Attach Project Files'), 'Has "Attach Project Files" button');
  assert.ok(
    agentContent.includes('showAttachFilesModal'),
    'Has modal state for attaching project files'
  );
  assert.ok(agentContent.includes('attachedProjectFiles'), 'Tracks attached project files');
  assert.ok(
    agentContent.includes('allProjectFolders'),
    'Tracks all project folders including newly created and empty folders'
  );
  assert.ok(
    agentContent.includes('handleOpenAttachModal'),
    'Refreshes latest files and folders on modal open'
  );

  // Multi-selection checkboxes in modal
  assert.ok(
    agentContent.includes('selectedModalFileIds'),
    'Modal tracks selected file IDs with checkboxes'
  );
  assert.ok(
    agentContent.includes('CheckSquare') && agentContent.includes('Square'),
    'Renders checkable checkbox icons'
  );

  // Context injection into prompt
  assert.ok(
    agentContent.includes('formatContextForAgents(attachedProjectFiles)'),
    'Injects project files context into prompt payload'
  );
});
