const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Import Template on Coding Library enforces uniform mandatory fields and provides download options', () => {
  const problemsCatalogFile = fs.readFileSync(path.join(__dirname, '../src/app/sandbox/code/problems/page.tsx'), 'utf8');
  const codingProblemsLib = fs.readFileSync(path.join(__dirname, '../src/lib/coding-problems.ts'), 'utf8');

  // Verify Import Template button is present in the header
  assert.ok(problemsCatalogFile.includes('Import Template'), 'Header has "Import Template" button');
  assert.ok(problemsCatalogFile.includes('showTemplateModal'), 'Has template preview modal state');
  assert.ok(problemsCatalogFile.includes('templateFormat'), 'Supports switching template formats between JSON and CSV');

  // Verify template generator functions exist in library
  assert.ok(codingProblemsLib.includes('export function getCodingProblemImportTemplate'), 'Provides getCodingProblemImportTemplate function');
  assert.ok(codingProblemsLib.includes('export function downloadCodingProblemTemplate'), 'Provides downloadCodingProblemTemplate function');

  // Verify mandatory fields are clearly documented in the template
  assert.ok(codingProblemsLib.includes('Mandatory'), 'Defines mandatory fields indication in template');
  assert.ok(codingProblemsLib.includes('title:'), 'Template field: title');
  assert.ok(codingProblemsLib.includes('difficulty:'), 'Template field: difficulty');
  assert.ok(codingProblemsLib.includes('category:'), 'Template field: category');
  assert.ok(codingProblemsLib.includes('description:'), 'Template field: description');
});

test('Dedicated Concept Guide pages exist for Selenium, Playwright, API Testing with Import Template & Import Guide', () => {
  const guideClientFile = fs.readFileSync(path.join(__dirname, '../src/app/guides/[trackId]/guide-catalog-client.tsx'), 'utf8');
  const guideDynamicRoute = fs.readFileSync(path.join(__dirname, '../src/app/guides/[trackId]/page.tsx'), 'utf8');
  const guidesHomeRoute = fs.readFileSync(path.join(__dirname, '../src/app/guides/page.tsx'), 'utf8');
  const conceptGuidesLib = fs.readFileSync(path.join(__dirname, '../src/lib/concept-guides.ts'), 'utf8');
  const trackOverviewPage = fs.readFileSync(path.join(__dirname, '../src/app/tracks/[trackId]/page.tsx'), 'utf8');

  // Verify dynamic route generates static params for all key tracks
  assert.ok(guideDynamicRoute.includes("{ trackId: 'selenium' }"), 'Generates route for selenium');
  assert.ok(guideDynamicRoute.includes("{ trackId: 'playwright' }"), 'Generates route for playwright');
  assert.ok(guideDynamicRoute.includes("{ trackId: 'api-testing' }"), 'Generates route for api-testing');
  assert.ok(guideDynamicRoute.includes("{ trackId: 'ai-qa' }"), 'Generates route for ai-qa');

  // Verify Concept Guides page features Import Template, Import Guide, and Add Guide
  assert.ok(guideClientFile.includes('Import Template'), 'Guide page has "Import Template" button');
  assert.ok(guideClientFile.includes('Import Guide'), 'Guide page has "Import Guide" button');
  assert.ok(guideClientFile.includes('Add Guide'), 'Guide page has "Add Guide" button');

  // Verify modal handlers exist
  assert.ok(guideClientFile.includes('showTemplateModal'), 'Has template modal state');
  assert.ok(guideClientFile.includes('showImportModal'), 'Has import modal state');
  assert.ok(guideClientFile.includes('showAddModal'), 'Has add guide modal state');

  // Verify URL query action support (?action=template, ?action=import)
  assert.ok(guideClientFile.includes("action === 'template'"), 'Supports ?action=template query param');
  assert.ok(guideClientFile.includes("action === 'import'"), 'Supports ?action=import query param');

  // Verify default concepts for Selenium, Playwright, API Testing
  assert.ok(conceptGuidesLib.includes('Dynamic Synchronization: Explicit vs FluentWait'), 'Includes Selenium default guides');
  assert.ok(conceptGuidesLib.includes('Browser Context Architecture in Playwright'), 'Includes Playwright default guides');
  assert.ok(conceptGuidesLib.includes('Test Fixtures vs Worker Fixtures vs Custom Fixtures'), 'Includes Playwright fixtures guides');
  assert.ok(conceptGuidesLib.includes('RequestSpecification & ResponseSpecification Architecture'), 'Includes Rest Assured default guides');

  // Verify template generator and import parser functions in concept-guides.ts
  assert.ok(conceptGuidesLib.includes('generateConceptGuideTemplate'), 'Provides generateConceptGuideTemplate');
  assert.ok(conceptGuidesLib.includes('downloadConceptGuideTemplate'), 'Provides downloadConceptGuideTemplate');
  assert.ok(conceptGuidesLib.includes('parseImportedGuides'), 'Provides parseImportedGuides');

  // Verify track overview page integrates Concept Guides and Import options
  assert.ok(trackOverviewPage.includes('Concept Guides & Architecture Library'), 'Track page links to Concept Guides library');
  assert.ok(trackOverviewPage.includes('action=template'), 'Track page has direct link to Import Template');
  assert.ok(trackOverviewPage.includes('action=import'), 'Track page has direct link to Import Guide');
});
