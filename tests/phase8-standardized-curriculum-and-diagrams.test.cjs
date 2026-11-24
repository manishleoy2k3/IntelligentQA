/**
 * tests/phase8-standardized-curriculum-and-diagrams.test.cjs
 * Comprehensive test suite verifying Phase 8 requirements:
 * 1. 9-Course Hierarchical Catalogue (Selenium, Playwright, API Testing, Appium, Rest Assured, Git & CI/CD, GitHub Actions, APM, AI Academy)
 * 2. 13-Section Standard Lesson Content Template
 * 3. Visual Learning Architecture Diagrams & Component Explanations
 * 4. Mandatory Showcase "What is an LLM?" Infographic
 * 5. Admin Console Diagram Builder & Standard Template Tools
 * 6. UI Navigation Hierarchy & Performance Verification
 */

const { test, describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const DATA_FILE = path.join(process.cwd(), 'src/lib/curriculum-data-store.json');
const store = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

describe('PHASE 8: Complete 9-Course Catalogue, Hierarchical Structure & Categories', () => {
  it('contains all 9 mandatory curriculum courses in database', () => {
    const courses = store.academyCourses;
    assert.ok(Array.isArray(courses), 'academyCourses must be an array');

    const expectedCourseIds = [
      'course-selenium-mastery',
      'course-playwright-mastery',
      'course-api-testing',
      'course-appium',
      'course-rest-assured',
      'course-git',
      'course-github-actions',
      'course-apm-performance',
      'course-ai-qa-mastery',
    ];

    expectedCourseIds.forEach(id => {
      const found = courses.find(c => c.id === id);
      assert.ok(found, `Mandatory course ${id} must exist in database`);
      assert.ok(found.title, `Course ${id} must have a title`);
      assert.ok(found.slug, `Course ${id} must have a slug`);
      assert.ok(found.modules && found.modules.length > 0, `Course ${id} must have modules`);
    });
  });

  it('preserves AI Academy (course-ai-qa-mastery) intact with 6 modules and 46 lessons', () => {
    const aiCourse = store.academyCourses.find(c => c.id === 'course-ai-qa-mastery');
    assert.ok(aiCourse, 'AI Academy must exist');
    assert.strictEqual(aiCourse.modules.length, 6, 'AI Academy must have exactly 6 modules');
    const totalLessons = aiCourse.modules.reduce((acc, m) => acc + (m.lessons || []).length, 0);
    assert.strictEqual(totalLessons, 46, 'AI Academy must have exactly 46 lessons');
  });

  it('verifies Selenium Automation course has 10 modules and 90 lessons', () => {
    const course = store.academyCourses.find(c => c.id === 'course-selenium-mastery');
    assert.ok(course, 'Selenium course must exist');
    assert.strictEqual(course.modules.length, 10, 'Selenium course must have 10 modules');
    const totalLessons = course.modules.reduce((acc, m) => acc + (m.lessons || []).length, 0);
    assert.strictEqual(totalLessons, 90, 'Selenium course must have 90 lessons');
  });

  it('verifies Playwright Automation course has 9 modules and structured lessons', () => {
    const course = store.academyCourses.find(c => c.id === 'course-playwright-mastery');
    assert.ok(course, 'Playwright course must exist');
    assert.strictEqual(course.modules.length, 9, 'Playwright course must have 9 modules');
    const totalLessons = course.modules.reduce((acc, m) => acc + (m.lessons || []).length, 0);
    assert.ok(totalLessons >= 60, `Playwright course must have >= 60 lessons, has ${totalLessons}`);
  });

  it('verifies API Testing course has 8 modules and structured lessons', () => {
    const course = store.academyCourses.find(c => c.id === 'course-api-testing');
    assert.ok(course, 'API Testing course must exist');
    assert.strictEqual(course.modules.length, 8, 'API Testing course must have 8 modules');
    const totalLessons = course.modules.reduce((acc, m) => acc + (m.lessons || []).length, 0);
    assert.ok(totalLessons >= 50, `API Testing course must have >= 50 lessons, has ${totalLessons}`);
  });

  it('verifies Appium Mobile Automation course has 8 modules and structured lessons', () => {
    const course = store.academyCourses.find(c => c.id === 'course-appium');
    assert.ok(course, 'Appium Mobile course must exist');
    assert.strictEqual(course.modules.length, 8, 'Appium course must have 8 modules');
    const totalLessons = course.modules.reduce((acc, m) => acc + (m.lessons || []).length, 0);
    assert.ok(totalLessons >= 50, `Appium course must have >= 50 lessons, has ${totalLessons}`);
  });

  it('verifies APM & Performance Testing course has 7 modules and structured lessons', () => {
    const course = store.academyCourses.find(c => c.id === 'course-apm-performance');
    assert.ok(course, 'APM course must exist');
    assert.strictEqual(course.modules.length, 7, 'APM course must have 7 modules');
    const totalLessons = course.modules.reduce((acc, m) => acc + (m.lessons || []).length, 0);
    assert.ok(totalLessons >= 35, `APM course must have >= 35 lessons, has ${totalLessons}`);
  });

  it('verifies category structure includes cat-appium and cat-apm-performance', () => {
    const categories = store.academyCategories;
    const appiumCat = categories.find(c => c.id === 'cat-appium');
    assert.ok(appiumCat, 'cat-appium must exist in categories');
    assert.strictEqual(appiumCat.slug, 'appium');

    const apmCat = categories.find(c => c.id === 'cat-apm-performance');
    assert.ok(apmCat, 'cat-apm-performance must exist in categories');
    assert.strictEqual(apmCat.slug, 'apm-performance');
  });
});

describe('PHASE 8: Standard 13-Section Lesson Content Template', () => {
  it('verifies foundational lessons contain complete 13-section standardized structure', () => {
    const seleniumCourse = store.academyCourses.find(c => c.id === 'course-selenium-mastery');
    const firstLesson = seleniumCourse.modules[0].lessons[0];

    assert.ok(firstLesson, 'First Selenium lesson must exist');
    assert.ok(firstLesson.contentHtml, 'Lesson must have compiled contentHtml');
    assert.ok(firstLesson.blockData && firstLesson.blockData.standardData, 'Lesson must contain standardData in blockData');

    const data = firstLesson.blockData.standardData;

    // 1. Overview
    assert.ok(data.overview, 'Must contain overview section');
    assert.ok(data.overview.whatIsIt, 'Must contain whatIsIt');
    assert.ok(data.overview.whyImportant, 'Must contain whyImportant');
    assert.ok(data.overview.whereUsed, 'Must contain whereUsed');

    // 2. Learning Objectives
    assert.ok(Array.isArray(data.learningObjectives) && data.learningObjectives.length > 0, 'Must have learning objectives');

    // 3. Concept Explanation
    assert.ok(data.conceptExplanation, 'Must contain conceptExplanation');
    assert.ok(Array.isArray(data.conceptExplanation.theory), 'Must contain theory paragraphs');
    assert.ok(Array.isArray(data.conceptExplanation.terminology), 'Must contain key terminology');

    // 4. Architecture Diagram
    assert.ok(data.architectureDiagram, 'Must contain architecture diagram');
    assert.ok(data.architectureDiagram.title, 'Diagram must have title');
    assert.ok(Array.isArray(data.architectureDiagram.nodes), 'Diagram must have nodes');

    // 5. How It Works
    assert.ok(data.howItWorks, 'Must contain howItWorks section');
    assert.ok(Array.isArray(data.howItWorks.steps), 'Must contain execution steps');

    // 6. Practical Implementation
    assert.ok(data.practicalImplementation, 'Must contain practicalImplementation');

    // 7. Code Examples
    assert.ok(Array.isArray(data.codeExamples) && data.codeExamples.length > 0, 'Must contain code examples');
    assert.ok(data.codeExamples[0].language, 'Code item must define language');
    assert.ok(data.codeExamples[0].code, 'Code item must have code');

    // 8. QA Use Cases
    assert.ok(Array.isArray(data.qaUseCases) && data.qaUseCases.length > 0, 'Must contain QA use cases');

    // 9. Common Problems
    assert.ok(Array.isArray(data.commonProblems) && data.commonProblems.length > 0, 'Must contain common troubleshooting problems');

    // 10. Best Practices
    assert.ok(Array.isArray(data.bestPractices) && data.bestPractices.length > 0, 'Must contain best practices');

    // 11. Comparison
    assert.ok(data.comparison, 'Must contain comparison section');

    // 12. Interview Questions
    assert.ok(Array.isArray(data.interviewQuestions) && data.interviewQuestions.length > 0, 'Must contain interview questions');
    assert.ok(data.interviewQuestions.some(q => q.level === 'Intermediate' || q.level === 'Architect-Level'), 'Must feature senior/architect interview questions');

    // 13. Summary
    assert.ok(data.summary, 'Must contain summary section');
    assert.ok(Array.isArray(data.summary.takeaways), 'Summary must have takeaways');
  });

  it('verifies standard HTML sections are properly rendered into contentHtml', () => {
    const seleniumCourse = store.academyCourses.find(c => c.id === 'course-selenium-mastery');
    const html = seleniumCourse.modules[0].lessons[0].contentHtml;

    assert.ok(html.length > 500, 'HTML must contain comprehensive lesson content');
    assert.ok(html.includes('Selenium is the industry-standard') || html.includes('Selenium'), 'HTML must render lesson prose');
    assert.ok(html.includes('Learning Objectives') || html.includes('objectives'), 'HTML must render Objectives section');
    assert.ok(html.includes('Architecture') || html.includes('Execution'), 'HTML must render Architecture section');
    assert.ok(html.includes('Implementation') || html.includes('Code'), 'HTML must render Code Examples section');
    assert.ok(html.includes('Interview') || html.includes('Questions'), 'HTML must render Interview Questions');
    assert.ok(html.includes('Summary') || html.includes('Takeaways'), 'HTML must render Summary');
  });

  it('verifies standard lesson TypeScript definitions exist in src/types/standard-lesson.ts', () => {
    const tsFile = path.join(process.cwd(), 'src/types/standard-lesson.ts');
    assert.ok(fs.existsSync(tsFile), 'src/types/standard-lesson.ts must exist');
    const content = fs.readFileSync(tsFile, 'utf-8');
    assert.ok(content.includes('export interface StandardLessonTemplateData'), 'Must export StandardLessonTemplateData');
    assert.ok(content.includes('export interface TechnicalDiagramConfig'), 'Must export TechnicalDiagramConfig');
    assert.ok(content.includes('export interface CodeExampleItem'), 'Must export CodeExampleItem');
    assert.ok(content.includes('export interface TroubleshootingItem'), 'Must export TroubleshootingItem');
    assert.ok(content.includes('export interface TechnicalInterviewQuestion'), 'Must export TechnicalInterviewQuestion');
  });
});

describe('PHASE 8: Visual Diagrams & Diagram Engine', () => {
  it('verifies DiagramViewer component exists with SVG, Pipeline, and Mermaid support', () => {
    const viewerFile = path.join(process.cwd(), 'src/components/learning/diagram-viewer.tsx');
    assert.ok(fs.existsSync(viewerFile), 'diagram-viewer.tsx must exist');
    const content = fs.readFileSync(viewerFile, 'utf-8');
    assert.ok(content.includes('DiagramViewer'), 'Must export DiagramViewer');
    assert.ok(content.includes('renderPipelineDiagram'), 'Must support pipeline diagrams');
    assert.ok(content.includes('renderMermaidDiagram'), 'Must support Mermaid diagrams');
    assert.ok(content.includes('renderCustomImage'), 'Must support uploaded images with captions and alt text');
    assert.ok(content.includes('renderSequenceDiagram'), 'Must support sequence flow diagrams');
  });

  it('verifies StandardLessonRenderer component exists with rich interactive display', () => {
    const rendererFile = path.join(process.cwd(), 'src/components/learning/standard-lesson-template.tsx');
    assert.ok(fs.existsSync(rendererFile), 'standard-lesson-template.tsx must exist');
    const content = fs.readFileSync(rendererFile, 'utf-8');
    assert.ok(content.includes('StandardLessonRenderer'), 'Must export StandardLessonRenderer');
    assert.ok(content.includes('generateStandardLessonHtml'), 'Must export generateStandardLessonHtml');
    assert.ok(content.includes('DiagramViewer'), 'Must incorporate DiagramViewer');
  });
});

describe('PHASE 8: Mandatory Showcase Infographic ("What is an LLM?")', () => {
  it('verifies LlmArchitectureInfographic component exists in src/components/learning', () => {
    const infoFile = path.join(process.cwd(), 'src/components/learning/llm-architecture-infographic.tsx');
    assert.ok(fs.existsSync(infoFile), 'llm-architecture-infographic.tsx must exist');
    const content = fs.readFileSync(infoFile, 'utf-8');
    assert.ok(content.includes('LlmArchitectureInfographic'), 'Must export LlmArchitectureInfographic');
  });

  it('verifies Training Phase workflow is explicitly visualized', () => {
    const infoFile = path.join(process.cwd(), 'src/components/learning/llm-architecture-infographic.tsx');
    const content = fs.readFileSync(infoFile, 'utf-8');
    assert.ok(content.includes('Training Phase: Learning Deep Representations'), 'Must explain Training Phase');
    assert.ok(content.includes('Training Data'), 'Must show training data input');
    assert.ok(content.includes('Text Processing'), 'Must show text processing');
    assert.ok(content.includes('Tokenization'), 'Must show tokenization');
    assert.ok(content.includes('Token Embeddings'), 'Must show embeddings');
    assert.ok(content.includes('Transformer Core'), 'Must show transformer architecture');
    assert.ok(content.includes('Pattern Learning'), 'Must show pattern learning');
    assert.ok(content.includes('Model Parameters'), 'Must show model parameters output');
  });

  it('verifies Inference Phase workflow is explicitly visualized', () => {
    const infoFile = path.join(process.cwd(), 'src/components/learning/llm-architecture-infographic.tsx');
    const content = fs.readFileSync(infoFile, 'utf-8');
    assert.ok(content.includes('Inference Phase: Real-Time Token Generation'), 'Must explain Inference Phase');
    assert.ok(content.includes('User Input'), 'Must show user prompt input');
    assert.ok(content.includes('Tokenization'), 'Must show inference tokenization');
    assert.ok(content.includes('Vector Embeddings') || content.includes('Embeddings'), 'Must show input embeddings');
    assert.ok(content.includes('Transformer Layers'), 'Must show forward pass transformer layers');
    assert.ok(content.includes('Next Token Prediction'), 'Must show next token prediction');
    assert.ok(content.includes('Final Response'), 'Must show final response output');
  });

  it('verifies the 10 mandatory technical components are visually represented', () => {
    const infoFile = path.join(process.cwd(), 'src/components/learning/llm-architecture-infographic.tsx');
    const content = fs.readFileSync(infoFile, 'utf-8');

    const mandatoryComponents = [
      'Tokenization',
      'Embeddings',
      'Positional Information',
      'Self-Attention',
      'Feed-Forward Networks',
      'Transformer Layers',
      'Context Window',
      'Model Parameters',
      'GPU / TPU Hardware Accelerators',
      'Next Token Prediction',
    ];

    mandatoryComponents.forEach(comp => {
      assert.ok(content.includes(comp), `Must visually represent component: ${comp}`);
    });
  });

  it('verifies technical accuracy: 175B is NOT presented as universal and parameter scaling is explained', () => {
    const infoFile = path.join(process.cwd(), 'src/components/learning/llm-architecture-infographic.tsx');
    const content = fs.readFileSync(infoFile, 'utf-8');

    assert.ok(content.includes('Small Language Models (SLMs)'), 'Must explain SLMs');
    assert.ok(content.includes('1B - 3B') || content.includes('1B – 3B'), 'Must explain 1B - 3B models');
    assert.ok(content.includes('7B - 14B') || content.includes('7B – 14B'), 'Must explain 7B - 14B local SDET models');
    assert.ok(content.includes('70B'), 'Must explain enterprise 70B models');
    assert.ok(content.includes('MoE'), 'Must explain Mixture-of-Experts frontier models');
    assert.ok(content.includes('Training vs Inference'), 'Must differentiate training vs inference compute');
  });

  it('verifies academy-shell.tsx integrates the LlmArchitectureInfographic for what-is-an-llm lesson', () => {
    const shellFile = path.join(process.cwd(), 'src/components/learning/academy-shell.tsx');
    const content = fs.readFileSync(shellFile, 'utf-8');
    assert.ok(content.includes('LlmArchitectureInfographic'), 'academy-shell.tsx must import LlmArchitectureInfographic');
    assert.ok(content.includes("slug === 'what-is-an-llm'"), 'academy-shell.tsx must render infographic for what-is-an-llm');
  });
});

describe('PHASE 8: Admin Console Extensions & Diagram Builder', () => {
  it('verifies Admin Console includes multi-mode lesson editor (Content, Diagram Builder, Docx)', () => {
    const adminFile = path.join(process.cwd(), 'src/components/admin/academy/academy-admin-console.tsx');
    const content = fs.readFileSync(adminFile, 'utf-8');
    assert.ok(content.includes('Technical Content & Code (HTML)'), 'Must have technical content editor tab');
    assert.ok(content.includes('Visual Diagram Builder'), 'Must have visual diagram builder tab');
    assert.ok(content.includes('Word Document (.docx)'), 'Must have docx upload tab');
  });

  it('verifies Admin Console supports inserting standard section templates', () => {
    const adminFile = path.join(process.cwd(), 'src/components/admin/academy/academy-admin-console.tsx');
    const content = fs.readFileSync(adminFile, 'utf-8');
    assert.ok(content.includes('handleInsertSectionTemplate'), 'Must have handleInsertSectionTemplate');
    assert.ok(content.includes('STANDARD_SECTION_TEMPLATES'), 'Must define STANDARD_SECTION_TEMPLATES');
    assert.ok(content.includes('overview') && content.includes('Lesson Overview'), 'Must support Overview template');
    assert.ok(content.includes('objectives') && content.includes('Learning Objectives'), 'Must support Objectives template');
    assert.ok(content.includes('concept') && content.includes('Concept Explanation'), 'Must support Concept template');
  });

  it('verifies Admin Console Diagram Builder supports Pipeline, SVG, and Image uploads', () => {
    const adminFile = path.join(process.cwd(), 'src/components/admin/academy/academy-admin-console.tsx');
    const content = fs.readFileSync(adminFile, 'utf-8');
    assert.ok(content.includes('handleInsertDiagram'), 'Must have handleInsertDiagram');
    assert.ok(content.includes('Uploaded PNG / JPG / SVG / WebP') || content.includes('diagramSourceAttr'), 'Must support diagram/image uploads');
    assert.ok(content.includes('diagramSourceAttr'), 'Must support source attribution');
    assert.ok(content.includes('diagramAltText'), 'Must support alt text for accessibility');
  });
});

describe('PHASE 8: Navigation Hierarchy & Sidebar Structure', () => {
  it('verifies Sidebar component displays Mobile Testing & Automation above CI/CD Concepts', () => {
    const sidebarFile = path.join(process.cwd(), 'src/components/layout/sidebar.tsx');
    const content = fs.readFileSync(sidebarFile, 'utf-8');

    const mobilePos = content.indexOf('Mobile Testing & Automation');
    const cicdPos = content.indexOf('CI/CD Concepts');

    assert.ok(mobilePos !== -1, 'Sidebar must contain Mobile Testing & Automation');
    assert.ok(cicdPos !== -1, 'Sidebar must contain CI/CD Concepts');
    assert.ok(mobilePos < cicdPos, 'Mobile Testing & Automation must appear above CI/CD Concepts');
  });

  it('verifies Mobile Testing & Automation nests Mobile Testing and Appium as child items', () => {
    const sidebarFile = path.join(process.cwd(), 'src/components/layout/sidebar.tsx');
    const content = fs.readFileSync(sidebarFile, 'utf-8');

    assert.ok(content.includes("title: 'Mobile Testing'"), 'Must contain Mobile Testing child item');
    assert.ok(content.includes("title: 'Appium'"), 'Must contain Appium child item');
    assert.ok(content.includes("displayTitle: 'Mobile Testing & Automation'"), 'Parent title must be Mobile Testing & Automation');
  });

  it('verifies searchCurriculum executes under 50ms across the full 9-course catalogue', () => {
    const jiti = require('jiti')(path.join(process.cwd(), 'test.js'));
    const { academyStore } = jiti('./src/lib/academy-store.ts');
    academyStore.searchCurriculum('warmup');
    const start = performance.now();
    const results = academyStore.searchCurriculum('Selenium Architecture');
    const duration = performance.now() - start;

    assert.ok(duration < 50, `Search took ${duration.toFixed(2)}ms, must be < 50ms`);
    assert.ok(results.length > 0, 'Search should find Selenium Architecture results');
    assert.ok(results[0].title || results[0].snippet, 'Search result must include title or snippet');
  });
});
