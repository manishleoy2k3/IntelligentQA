#!/usr/bin/env node

/**
 * IntelligentQA — Migration Verification & Count Audit Runner
 * Validates source dataset integrity against migration models and outputs
 * the official certification table.
 */

const fs = require('fs');
const path = require('path');

// Automatically load .env.local and .env if present
const envFiles = ['.env.local', '.env'];
for (const envFile of envFiles) {
  const envPath = path.join(__dirname, '..', envFile);
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const jiti = require('jiti')(__filename);

const DATA_FILE = path.join(__dirname, '../src/lib/curriculum-data-store.json');
const { ALL_INTERVIEW_QUESTIONS } = jiti('../src/lib/interview-bank/index.ts');

function main() {
  console.log('================================================================');
  console.log('      INTELLIGENTQA — MIGRATION VERIFICATION AUDIT');
  console.log('================================================================\n');

  if (!fs.existsSync(DATA_FILE)) {
    console.error('Curriculum data store missing!');
    process.exit(1);
  }

  const store = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

  const categories = store.academyCategories || [];
  const courses = store.academyCourses || [];
  const articles = store.articles || [];
  const media = store.media || store.academyMedia || [];
  const docSources = store.academyDocSources || [];

  let moduleCount = 0;
  let lessonCount = 0;
  const lessonIds = new Set();
  const moduleIds = new Set();
  const duplicateLessonIds = [];

  for (const c of courses) {
    for (const m of c.modules || []) {
      moduleCount++;
      moduleIds.add(m.id);
      for (const l of m.lessons || []) {
        lessonCount++;
        if (lessonIds.has(l.id)) {
          duplicateLessonIds.push(l.id);
        }
        lessonIds.add(l.id);
      }
    }
  }

  // Interview questions
  const iqIds = new Set();
  const duplicateIqIds = [];
  ALL_INTERVIEW_QUESTIONS.forEach((q) => {
    if (iqIds.has(q.id)) {
      duplicateIqIds.push(q.id);
    }
    iqIds.add(q.id);
  });

  const verificationTable = [
    { entity: 'Categories', expected: 11, actual: categories.length },
    { entity: 'Courses', expected: 9, actual: courses.length },
    { entity: 'Modules', expected: 60, actual: moduleCount },
    { entity: 'Lessons', expected: 464, actual: lessonCount },
    { entity: 'CMS articles', expected: 1, actual: articles.length },
    { entity: 'Media items', expected: 152, actual: media.length },
    { entity: 'Document sources', expected: 51, actual: docSources.length },
    { entity: 'Interview questions', expected: 800, actual: ALL_INTERVIEW_QUESTIONS.length },
  ];

  console.log('| Entity | Source Count | Database/Migration Count | Missing | Extra | Status |');
  console.log('|---|---:|---:|---:|---:|---|');

  let allPassed = true;
  for (const row of verificationTable) {
    const missing = Math.max(0, row.expected - row.actual);
    const extra = Math.max(0, row.actual - row.expected);
    const status = row.expected === row.actual ? '✅ VERIFIED' : '❌ MISMATCH';
    if (row.expected !== row.actual) allPassed = false;
    console.log(
      `| ${row.entity} | ${row.expected} | ${row.actual} | ${missing} | ${extra} | ${status} |`
    );
  }

  console.log('\n--- INTEGRITY CHECKS ---');
  console.log(
    `• Unique Lesson IDs:         ${lessonIds.size} / ${lessonCount} (Collisions: ${duplicateLessonIds.length})`
  );
  console.log(`• Unique Module IDs:         ${moduleIds.size} / ${moduleCount}`);
  console.log(
    `• Unique Interview Q IDs:    ${iqIds.size} / ${ALL_INTERVIEW_QUESTIONS.length} (Collisions: ${duplicateIqIds.length})`
  );
  console.log(`• Integrity Result:          ${allPassed ? '100% PASS' : 'FAIL'}\n`);

  if (!allPassed) {
    process.exit(1);
  }
}

main();
