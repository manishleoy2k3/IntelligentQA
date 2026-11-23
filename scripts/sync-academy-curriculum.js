const fs = require('fs');
const path = require('path');
const jiti = require('jiti')(__filename, {
  alias: {
    '@': path.join(__dirname, '../src'),
  },
});

const { ACADEMY_MODULES } = jiti('../src/data/learning/academy-curriculum.ts');

console.log('Loaded modules:', ACADEMY_MODULES.length);
let totalLessons = 0;
ACADEMY_MODULES.forEach((mod, idx) => {
  console.log(`Module ${idx + 1}: ${mod.title} (${mod.lessons.length} lessons)`);
  totalLessons += mod.lessons.length;
});
console.log('Total lessons:', totalLessons);
