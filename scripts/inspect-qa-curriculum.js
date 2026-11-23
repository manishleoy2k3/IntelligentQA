const path = require('path');
const jiti = require('jiti')(__filename, {
  alias: {
    '@': path.join(__dirname, '../src'),
  },
});

const { QA_TRACKS } = jiti('../src/lib/qa-curriculum.ts');

const selLesson = QA_TRACKS[0].modules[0].lessons[0];
console.log('Sample Lesson:', JSON.stringify(selLesson, null, 2));
