const path = require('path');
const jiti = require('jiti')(__filename, {
  alias: { '@': path.join(process.cwd(), 'src') },
});
const { academyStore } = jiti('../src/lib/academy-store.ts');

const testSlugs = [
  'publishing-test-results-in-ado',
  'azure-pipelines-agent-pools',
  'declarative-syntax-essentials',
  'parallel-stages-docker-agents',
  'what-is-git',
  'branching-strategies-gitflow-trunk-based',
  'what-is-github-actions',
  'matrix-strategy-parallel-testing-across-osbrowser',
];

console.log('=== VERIFYING LESSON RETRIEVAL ===');
testSlugs.forEach((slug) => {
  const res = academyStore.getLessonWithContext(slug);
  if (!res) {
    console.error(`FAILED to find lesson: ${slug}`);
  } else {
    const l = res.lesson;
    const hasDiagram =
      l.contentHtml.includes('data-curriculum-diagram') || l.contentHtml.includes('<figure');
    const hasCode = l.contentHtml.includes('<pre><code');
    const isPlaceholder =
      l.contentHtml.includes('under construction') ||
      l.contentHtml.length < 500 ||
      l.contentHtml.includes('WebDriverWait in Selenium, auto-waiting in Playwright');
    console.log(
      `✓ [${slug}] Title: "${l.title}" | HTML Length: ${l.contentHtml.length} | Has Diagram: ${hasDiagram} | Has Code: ${hasCode} | Is Placeholder: ${isPlaceholder}`
    );
  }
});

console.log('\n=== CHECKING OVERALL COURSE HEALTH ===');
const courses = ['course-azure-devops', 'course-jenkins', 'course-git', 'course-github-actions'];
courses.forEach((cId) => {
  const c = academyStore.getCourse(cId);
  let total = 0,
    placeholders = 0,
    diagrams = 0;
  (c.modules || []).forEach((m) => {
    (m.lessons || []).forEach((l) => {
      total++;
      if (
        l.contentHtml.includes('WebDriverWait in Selenium, auto-waiting in Playwright') ||
        l.contentHtml.length < 500
      ) {
        placeholders++;
      }
      if (l.contentHtml.includes('data-curriculum-diagram') || l.contentHtml.includes('<figure')) {
        diagrams++;
      }
    });
  });
  console.log(
    `Course "${c.title}": ${total} lessons, ${diagrams} with embedded diagrams, ${placeholders} placeholders`
  );
});
