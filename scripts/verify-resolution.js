const path = require('path');
const jiti = require('jiti')(__filename, {
  alias: { '@': path.join(process.cwd(), 'src') }
});
const { INITIAL_PUBLISHED_COURSES } = jiti('../src/data/learning/initial-courses.ts');

function resolveCourse(selectedCourseId) {
  if (selectedCourseId) {
    const query = selectedCourseId.toLowerCase().trim();

    // Priority match for CI/CD Concepts track
    if (
      query === 'cicd-concepts' ||
      query === 'course-cicd-concepts' ||
      query === 'ci-cd' ||
      query === 'ci-cd-concepts' ||
      query === 'cicd' ||
      query.includes('cicd') ||
      query.includes('ci-cd')
    ) {
      const cicdMatch = INITIAL_PUBLISHED_COURSES.find(
        (c) => c.id === 'course-cicd-concepts' || c.slug === 'cicd-concepts'
      );
      if (cicdMatch) return cicdMatch;
    }

    const match = INITIAL_PUBLISHED_COURSES.find(
      (c) =>
        c.id.toLowerCase() === query ||
        c.slug.toLowerCase() === query ||
        c.title.toLowerCase().includes(query) ||
        query.includes(c.id.toLowerCase()) ||
        query.includes(c.slug.toLowerCase()) ||
        (query.includes('apm') && c.id.includes('apm')) ||
        (query.includes('performance') && c.id.includes('performance'))
    );
    if (match) return match;
  }
  return INITIAL_PUBLISHED_COURSES[0];
}

const queries = ['course-cicd-concepts', 'cicd-concepts', 'ci-cd', 'cicd', 'ci-cd-concepts', 'course-git', 'course-github-actions', 'course-azure-devops', 'course-jenkins'];
queries.forEach(q => {
  const c = resolveCourse(q);
  console.log(`Query "${q}" -> ${c.title} (${c.id})`);
});
