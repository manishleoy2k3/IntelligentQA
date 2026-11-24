const path = require('path');
const jiti = require('jiti')(__filename, {
  alias: { '@': path.join(process.cwd(), 'src') }
});
const { INITIAL_PUBLISHED_COURSES } = jiti('../src/data/learning/initial-courses.ts');
const { academyStore } = jiti('../src/lib/academy-store.ts');

console.log('=== VERIFYING CI/CD CONCEPTS IN INITIAL_PUBLISHED_COURSES ===');
const cicdClient = INITIAL_PUBLISHED_COURSES.find(c => c.id === 'course-cicd-concepts' || c.slug === 'cicd-concepts');
if (!cicdClient) {
  console.error('❌ FAILED: course-cicd-concepts not found in INITIAL_PUBLISHED_COURSES!');
} else {
  console.log('✓ Found CI/CD Concepts in INITIAL_PUBLISHED_COURSES:');
  console.log(`  Title: ${cicdClient.title}`);
  console.log(`  Subtitle: ${cicdClient.subtitle}`);
  console.log(`  Modules: ${cicdClient.modules.length}`);
  cicdClient.modules.forEach((m, idx) => {
    console.log(`    Module ${idx + 1}: ${m.title} (${m.lessons.length} lessons)`);
  });
}

console.log('\n=== VERIFYING CI/CD CONCEPTS IN ACADEMY STORE ===');
const cicdStore = academyStore.getCourse('course-cicd-concepts');
if (!cicdStore) {
  console.error('❌ FAILED: course-cicd-concepts not found in academyStore!');
} else {
  console.log('✓ Found CI/CD Concepts in academyStore:');
  console.log(`  Title: ${cicdStore.title}`);
  console.log(`  Modules: ${cicdStore.modules.length}`);
  cicdStore.modules.forEach((m, idx) => {
    console.log(`    Module ${idx + 1}: ${m.title} (${m.lessons.length} lessons)`);
  });
}

console.log('\n=== VERIFYING RESOLUTION SIMULATION ===');
const queries = ['course-cicd-concepts', 'cicd-concepts', 'ci-cd', 'cicd'];
queries.forEach(query => {
  const match = INITIAL_PUBLISHED_COURSES.find(
    (c) =>
      c.id.toLowerCase() === query ||
      c.slug.toLowerCase() === query ||
      c.title.toLowerCase().includes(query) ||
      query.includes(c.id.toLowerCase()) ||
      query.includes(c.slug.toLowerCase()) ||
      ((query.includes('cicd') || query.includes('ci-cd')) && (c.id.includes('cicd') || c.id.includes('ci-cd') || c.slug.includes('cicd') || c.title.toLowerCase().includes('ci/cd')))
  );
  console.log(`Query "${query}" resolves to: ${match?.title} (${match?.id})`);
});
