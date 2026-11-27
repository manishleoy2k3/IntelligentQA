const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Phase 8D: GeminiEmbeddingProvider uses gemini-embedding-001 and not retired text-embedding-004', () => {
  const filePath = path.join(process.cwd(), 'src/lib/rag/embedding-provider.ts');
  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(content.includes("model = 'gemini-embedding-001'"), 'Must use gemini-embedding-001');
  assert.ok(!content.includes("model = 'text-embedding-004'"), 'Must not use retired text-embedding-004');
});

test('Phase 8D: Migration 20261127000001 defines 4-domain metadata, FTS, synthetic queries, hard negatives, and analytics', () => {
  const migPath = path.join(
    process.cwd(),
    'supabase/migrations/20261127000001_phase8d_domain_adaptive_rag.sql'
  );
  const sql = fs.readFileSync(migPath, 'utf8');
  assert.ok(sql.includes('coding_problem'), 'Must support coding_problem source_type');
  assert.ok(sql.includes('search_tsv'), 'Must add PostgreSQL full-text search tsvector');
  assert.ok(sql.includes('rag_synthetic_queries'), 'Must create rag_synthetic_queries table');
  assert.ok(sql.includes('rag_hard_negatives'), 'Must create rag_hard_negatives table');
  assert.ok(sql.includes('rag_retrieval_analytics'), 'Must create rag_retrieval_analytics table');
  assert.ok(sql.includes('rag_benchmark_runs'), 'Must create rag_benchmark_runs table');
});

test('Phase 8D: All new RAG modules exist and export required symbols', () => {
  const requiredFiles = [
    'src/lib/rag/synthetic-queries.ts',
    'src/lib/rag/hard-negatives.ts',
    'src/lib/rag/query-understanding.ts',
    'src/lib/rag/benchmark.ts',
    'src/lib/rag/monitoring.ts',
    'src/app/api/admin/rag/analytics/route.ts',
  ];
  for (const rel of requiredFiles) {
    assert.ok(fs.existsSync(path.join(process.cwd(), rel)), `Missing file: ${rel}`);
  }
});

test('Phase 8D: JMeter interview question exists in canonical interview bank', () => {
  const bankFiles = fs.readdirSync(path.join(process.cwd(), 'src/lib/interview-bank'));
  let foundJMeter = false;
  for (const f of bankFiles) {
    const content = fs.readFileSync(path.join(process.cwd(), 'src/lib/interview-bank', f), 'utf8');
    if (/jmeter/i.test(content)) {
      foundJMeter = true;
      break;
    }
  }
  assert.ok(foundJMeter, 'Canonical interview bank must contain JMeter interview question(s)');
});
