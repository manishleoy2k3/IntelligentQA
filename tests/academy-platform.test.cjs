const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Academy Platform: Core TypeScript type definitions exist and export required interfaces', () => {
  const typesPath = path.join(process.cwd(), 'src/types/learning-platform.ts');
  assert.ok(fs.existsSync(typesPath), 'src/types/learning-platform.ts must exist');

  const content = fs.readFileSync(typesPath, 'utf-8');
  assert.ok(content.includes('export interface AcademyCategory'), 'Must export AcademyCategory');
  assert.ok(content.includes('export interface AcademyCourse'), 'Must export AcademyCourse');
  assert.ok(content.includes('export interface AcademyModule'), 'Must export AcademyModule');
  assert.ok(content.includes('export interface AcademyLesson'), 'Must export AcademyLesson');
  assert.ok(
    content.includes('export interface AcademyNavigationTreeCategory'),
    'Must export AcademyNavigationTreeCategory'
  );
  assert.ok(
    content.includes('export interface AcademyReorderPayload'),
    'Must export AcademyReorderPayload'
  );
});

test('Academy Platform: Data store contains all 7 mandatory top-level categories and Git & CI/CD subcategories', () => {
  const dataPath = path.join(process.cwd(), 'src/lib/curriculum-data-store.json');
  assert.ok(fs.existsSync(dataPath), 'curriculum-data-store.json must exist');

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  assert.ok(Array.isArray(data.academyCategories), 'Must have academyCategories array');

  const categories = data.academyCategories;
  const titles = categories.map((c) => c.title);
  const slugs = categories.map((c) => c.slug);

  // 1. AI Academy / AI for QA
  assert.ok(
    titles.includes('AI Academy') || titles.includes('AI for QA'),
    'Must include AI Academy / AI for QA'
  );
  assert.ok(slugs.includes('ai-for-qa'), 'Must include ai-for-qa slug');

  // 2. Selenium
  assert.ok(titles.includes('Selenium'), 'Must include Selenium');
  assert.ok(slugs.includes('selenium'), 'Must include selenium slug');

  // 3. Playwright
  assert.ok(titles.includes('Playwright'), 'Must include Playwright');
  assert.ok(slugs.includes('playwright'), 'Must include playwright slug');

  // 4. Rest Assured
  assert.ok(titles.includes('Rest Assured'), 'Must include Rest Assured');
  assert.ok(slugs.includes('rest-assured'), 'Must include rest-assured slug');

  // 5. API Testing
  assert.ok(titles.includes('API Testing'), 'Must include API Testing');
  assert.ok(slugs.includes('api-testing'), 'Must include api-testing slug');

  // 6. Appium
  assert.ok(titles.includes('Appium'), 'Must include Appium');
  assert.ok(slugs.includes('appium'), 'Must include appium slug');

  // 7. Git & CI/CD
  assert.ok(titles.includes('Git & CI/CD'), 'Must include Git & CI/CD');
  assert.ok(slugs.includes('git-cicd'), 'Must include git-cicd slug');

  // Subcategories: GitHub Actions, Azure DevOps, Jenkins
  const gitCategory = categories.find((c) => c.slug === 'git-cicd');
  assert.ok(gitCategory, 'Git & CI/CD category must exist');

  const githubActions = categories.find((c) => c.slug === 'github-actions');
  assert.ok(githubActions, 'GitHub Actions subcategory must exist');
  assert.strictEqual(
    githubActions.parentCategoryId,
    gitCategory.id,
    'GitHub Actions must have git-cicd as parentCategoryId'
  );

  const azureDevops = categories.find((c) => c.slug === 'azure-devops');
  assert.ok(azureDevops, 'Azure DevOps subcategory must exist');
  assert.strictEqual(
    azureDevops.parentCategoryId,
    gitCategory.id,
    'Azure DevOps must have git-cicd as parentCategoryId'
  );

  const jenkins = categories.find((c) => c.slug === 'jenkins');
  assert.ok(jenkins, 'Jenkins subcategory must exist');
  assert.strictEqual(
    jenkins.parentCategoryId,
    gitCategory.id,
    'Jenkins must have git-cicd as parentCategoryId'
  );
});

test('Academy Platform: Pre-seeded courses and lessons exist for initial categories', () => {
  const dataPath = path.join(process.cwd(), 'src/lib/curriculum-data-store.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  assert.ok(Array.isArray(data.academyCourses), 'Must have academyCourses array');
  assert.ok(data.academyCourses.length >= 7, 'Must have at least 7 starter courses');

  // Verify Playwright starter course
  const pwCourse = data.academyCourses.find((c) => c.slug === 'playwright-ts-mastery');
  assert.ok(pwCourse, 'Playwright starter course must exist');
  assert.ok(pwCourse.modules.length > 0, 'Course must have modules');
  assert.ok(pwCourse.modules[0].lessons.length > 0, 'Module must have lessons');

  const firstLesson = pwCourse.modules[0].lessons[0];
  assert.ok(
    firstLesson.title.includes('Playwright Architecture'),
    'Lesson title must match expected topic'
  );
  assert.ok(firstLesson.contentHtml !== undefined, 'Lesson must contain content HTML field');
});

test('Academy Platform: AcademyStore provides full CRUD and Navigation resolution methods', () => {
  const storePath = path.join(process.cwd(), 'src/lib/academy-store.ts');
  const storeContent = fs.readFileSync(storePath, 'utf-8');

  // Category CRUD
  assert.ok(storeContent.includes('getCategories('), 'Must provide getCategories');
  assert.ok(storeContent.includes('getCategory('), 'Must provide getCategory');
  assert.ok(storeContent.includes('createCategory('), 'Must provide createCategory');
  assert.ok(storeContent.includes('updateCategory('), 'Must provide updateCategory');
  assert.ok(storeContent.includes('deleteCategory('), 'Must provide deleteCategory');

  // Course CRUD
  assert.ok(storeContent.includes('getCourses('), 'Must provide getCourses');
  assert.ok(storeContent.includes('getCourse('), 'Must provide getCourse');
  assert.ok(storeContent.includes('createCourse('), 'Must provide createCourse');
  assert.ok(storeContent.includes('updateCourse('), 'Must provide updateCourse');
  assert.ok(storeContent.includes('deleteCourse('), 'Must provide deleteCourse');

  // Module CRUD
  assert.ok(storeContent.includes('getModules('), 'Must provide getModules');
  assert.ok(storeContent.includes('createModule('), 'Must provide createModule');
  assert.ok(storeContent.includes('updateModule('), 'Must provide updateModule');
  assert.ok(storeContent.includes('deleteModule('), 'Must provide deleteModule');

  // Lesson CRUD
  assert.ok(storeContent.includes('getLessons('), 'Must provide getLessons');
  assert.ok(storeContent.includes('getLesson('), 'Must provide getLesson');
  assert.ok(storeContent.includes('createLesson('), 'Must provide createLesson');
  assert.ok(storeContent.includes('updateLesson('), 'Must provide updateLesson');
  assert.ok(storeContent.includes('deleteLesson('), 'Must provide deleteLesson');

  // Navigation Tree & Context
  assert.ok(storeContent.includes('getNavigationTree('), 'Must provide getNavigationTree');
  assert.ok(storeContent.includes('getLessonWithContext('), 'Must provide getLessonWithContext');
  assert.ok(storeContent.includes('reorderItems('), 'Must provide reorderItems');
});

test('Academy Platform: API Route Handlers exist and follow standard response format', () => {
  const expectedRoutes = [
    'src/app/api/learning/tree/route.ts',
    'src/app/api/learning/categories/route.ts',
    'src/app/api/learning/categories/[id]/route.ts',
    'src/app/api/learning/courses/route.ts',
    'src/app/api/learning/courses/[id]/route.ts',
    'src/app/api/learning/modules/route.ts',
    'src/app/api/learning/modules/[id]/route.ts',
    'src/app/api/learning/lessons/route.ts',
    'src/app/api/learning/lessons/[id]/route.ts',
    'src/app/api/learning/curriculum/reorder/route.ts',
  ];

  for (const relPath of expectedRoutes) {
    const fullPath = path.join(process.cwd(), relPath);
    assert.ok(fs.existsSync(fullPath), `Route handler must exist: ${relPath}`);
    const code = fs.readFileSync(fullPath, 'utf-8');
    assert.ok(
      code.includes('NextResponse.json({') && code.includes('success:'),
      `Route handler ${relPath} must return standard JSON response envelope`
    );
  }
});

test('Academy Platform: Database relational schema extension is appended in scripts/schema.sql', () => {
  const schemaPath = path.join(process.cwd(), 'scripts/schema.sql');
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

  assert.ok(
    schemaContent.includes('CREATE TABLE IF NOT EXISTS academy_categories'),
    'Must include academy_categories table'
  );
  assert.ok(
    schemaContent.includes('CREATE TABLE IF NOT EXISTS academy_courses'),
    'Must include academy_courses table'
  );
  assert.ok(
    schemaContent.includes('CREATE TABLE IF NOT EXISTS academy_modules'),
    'Must include academy_modules table'
  );
  assert.ok(
    schemaContent.includes('CREATE TABLE IF NOT EXISTS academy_lessons'),
    'Must include academy_lessons table'
  );
  assert.ok(
    schemaContent.includes('CREATE TABLE IF NOT EXISTS academy_document_sources'),
    'Must include academy_document_sources table'
  );
  assert.ok(
    schemaContent.includes('CREATE TABLE IF NOT EXISTS academy_media_attachments'),
    'Must include academy_media_attachments table'
  );
});
