const fs = require('fs');
const path = require('path');

const DATA_FILE = path.resolve(__dirname, '../src/lib/curriculum-data-store.json');
const store = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

console.log('🔄 Building Unified CI/CD Concepts Course...');

const gitCourse = store.academyCourses.find(c => c.id === 'course-git');
const ghaCourse = store.academyCourses.find(c => c.id === 'course-github-actions');
const adoCourse = store.academyCourses.find(c => c.id === 'course-azure-devops');
const jenCourse = store.academyCourses.find(c => c.id === 'course-jenkins');

if (!gitCourse || !ghaCourse || !adoCourse || !jenCourse) {
  console.error('Missing one of the sub-courses!');
  process.exit(1);
}

// Extract all lessons from each course
const gitLessons = (gitCourse.modules || []).flatMap(m => m.lessons || []);
const ghaLessons = (ghaCourse.modules || []).flatMap(m => m.lessons || []);
const adoLessons = (adoCourse.modules || []).flatMap(m => m.lessons || []);
const jenLessons = (jenCourse.modules || []).flatMap(m => m.lessons || []);

console.log(`Extracted lessons: Git=${gitLessons.length}, GHA=${ghaLessons.length}, ADO=${adoLessons.length}, Jenkins=${jenLessons.length}`);

// Create 4 comprehensive modules for the unified CI/CD Concepts course
const cicdModules = [
  {
    id: 'mod-cicd-1-git',
    courseId: 'course-cicd-concepts',
    slug: 'git-version-control',
    title: 'Module 1: Git & Version Control for QA',
    description: 'Git fundamentals, commit DAG architecture, branching models (Trunk-Based, GitFlow), conflict resolution, and PR review quality gates.',
    sortOrder: 1,
    status: 'published',
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-24T00:00:00.000Z',
    lessons: gitLessons.map(l => ({ ...l, courseId: 'course-cicd-concepts', moduleId: 'mod-cicd-1-git' }))
  },
  {
    id: 'mod-cicd-2-github-actions',
    courseId: 'course-cicd-concepts',
    slug: 'github-actions-pipelines',
    title: 'Module 2: GitHub Actions CI/CD Pipelines',
    description: 'Workflow triggers, job matrices, parallel test sharding, artifact caching, headless browser configurations, and custom composite actions.',
    sortOrder: 2,
    status: 'published',
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-24T00:00:00.000Z',
    lessons: ghaLessons.map(l => ({ ...l, courseId: 'course-cicd-concepts', moduleId: 'mod-cicd-2-github-actions' }))
  },
  {
    id: 'mod-cicd-3-azure-devops',
    courseId: 'course-cicd-concepts',
    slug: 'azure-devops-pipelines',
    title: 'Module 3: Azure DevOps Pipelines for SDETs',
    description: 'Multi-stage YAML pipelines, PublishTestResults@2 task, self-hosted vs Microsoft agent pools, Azure Test Plans traceability, and automated quality gates.',
    sortOrder: 3,
    status: 'published',
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-24T00:00:00.000Z',
    lessons: adoLessons.map(l => ({ ...l, courseId: 'course-cicd-concepts', moduleId: 'mod-cicd-3-azure-devops' }))
  },
  {
    id: 'mod-cicd-4-jenkins',
    courseId: 'course-cicd-concepts',
    slug: 'declarative-jenkins-pipelines',
    title: 'Module 4: Declarative Jenkins Pipelines for QA Automation',
    description: 'Declarative Jenkinsfile structure, multibranch webhook triggers, parallel test execution on Docker agents, HTML test reporting, and Slack alerts.',
    sortOrder: 4,
    status: 'published',
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-24T00:00:00.000Z',
    lessons: jenLessons.map(l => ({ ...l, courseId: 'course-cicd-concepts', moduleId: 'mod-cicd-4-jenkins' }))
  }
];

const cicdCourse = {
  id: 'course-cicd-concepts',
  categoryId: 'cat-git-cicd',
  slug: 'cicd-concepts',
  title: 'CI/CD Concepts',
  subtitle: 'Git Version Control, GitHub Actions, Azure DevOps & Declarative Jenkins Pipelines',
  description: 'Master modern Continuous Integration, automated quality gating, and Continuous Delivery for QA automation: Git branching models, GitHub Actions matrix runners, Azure DevOps quality release gates, and distributed Jenkins container pipelines.',
  level: 'Comprehensive',
  estimatedHours: 46,
  sortOrder: 8,
  status: 'published',
  createdAt: '2026-11-23T00:00:00.000Z',
  updatedAt: '2026-11-24T00:00:00.000Z',
  modules: cicdModules
};

// Check if already in store, if so update; else insert
const existingIdx = store.academyCourses.findIndex(c => c.id === 'course-cicd-concepts' || c.slug === 'cicd-concepts');
if (existingIdx !== -1) {
  store.academyCourses[existingIdx] = cicdCourse;
  console.log('Updated existing course-cicd-concepts in store.');
} else {
  store.academyCourses.push(cicdCourse);
  console.log('Appended course-cicd-concepts to store.');
}

fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
console.log('✅ Updated curriculum-data-store.json with course-cicd-concepts.');

// Also generate a client version for initial-courses.ts
const clientCourse = {
  id: cicdCourse.id,
  slug: cicdCourse.slug,
  title: cicdCourse.title,
  subtitle: cicdCourse.subtitle,
  description: cicdCourse.description,
  level: cicdCourse.level,
  estimatedHours: cicdCourse.estimatedHours,
  modules: cicdModules.map(m => ({
    id: m.id,
    courseId: m.courseId,
    slug: m.slug,
    title: m.title,
    description: m.description,
    lessons: m.lessons.map(l => ({
      id: l.id,
      moduleId: l.moduleId,
      courseId: l.courseId,
      slug: l.slug,
      title: l.title,
      summary: l.summary || '',
      estimatedReadingTime: l.estimatedReadingTime || 6
    }))
  }))
};

const initialCoursesPath = path.resolve(__dirname, '../src/data/learning/initial-courses.ts');
let initialContent = fs.readFileSync(initialCoursesPath, 'utf8');

// Check if already contains course-cicd-concepts
if (initialContent.includes('"id": "course-cicd-concepts"')) {
  console.log('initial-courses.ts already contains course-cicd-concepts, skipping text insert.');
} else {
  // Insert before the closing `];`
  const lastBracketIdx = initialContent.lastIndexOf('];');
  if (lastBracketIdx !== -1) {
    const formatted = ',\n  ' + JSON.stringify(clientCourse, null, 2) + '\n';
    initialContent = initialContent.slice(0, lastBracketIdx).trimEnd() + formatted + '];\n';
    fs.writeFileSync(initialCoursesPath, initialContent, 'utf8');
    console.log('✅ Added course-cicd-concepts to initial-courses.ts.');
  }
}
