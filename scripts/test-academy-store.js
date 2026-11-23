const path = require('path');
const jiti = require('jiti')(__filename, {
  alias: {
    '@': path.join(__dirname, '../src'),
  },
});

const { academyStore } = jiti('../src/lib/academy-store.ts');

const published = academyStore.getCourses({ includeDrafts: false });
console.log('academyStore published courses:', published.length);
published.forEach((c) => {
  let lCount = 0;
  c.modules?.forEach((m) => {
    lCount += m.lessons?.length || 0;
  });
  console.log(`- [${c.id}] ${c.title} (Modules: ${c.modules?.length}, Lessons: ${lCount})`);
});
