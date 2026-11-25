/**
 * Production Health Check & Schema Verification Script
 * Strictly safe: Never logs secret keys or raw credentials.
 */

globalThis.WebSocket = class DummyWebSocket {};

const fs = require('fs');
const path = require('path');

// Load environment variables safely
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const k = trimmed.slice(0, idx).trim();
      let v = trimmed.slice(idx + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      process.env[k] = v;
    }
  }
}

const { createClient } = require('@supabase/supabase-js');

async function runHealthCheck() {
  console.log('================================================================');
  console.log('       SUPABASE PRODUCTION CONNECTIVITY & SCHEMA AUDIT');
  console.log('================================================================\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'intelligentqa-assets';

  console.log(`Target URL: ${supabaseUrl || 'NOT_CONFIGURED'}`);
  console.log(
    `Service Role Key Configured: ${Boolean(serviceRoleKey)} (Length: ${serviceRoleKey ? serviceRoleKey.length : 0})`
  );
  console.log(`Anon Key Configured: ${Boolean(anonKey)} (Length: ${anonKey ? anonKey.length : 0})`);
  console.log(`Storage Bucket Configured: ${bucketName}\n`);

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('CRITICAL: Cannot run live verification without URL and Service Role Key.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // 1. Connectivity & Latency Ping
  console.log('--- 1. Connectivity Ping ---');
  const t0 = Date.now();
  try {
    const { data: pingData, error: pingErr } = await supabase
      .from('categories')
      .select('count', { count: 'exact', head: true });
    const latency = Date.now() - t0;
    if (pingErr) {
      console.log(`❌ Ping failed (${latency}ms): [${pingErr.code}] ${pingErr.message}`);
      if (
        pingErr.code === 'PGRST116' ||
        pingErr.message.includes('relation "categories" does not exist')
      ) {
        console.log(
          '   Note: Connection succeeded at network/auth layer, but table "categories" is missing.'
        );
      } else {
        console.log(`   Details: ${pingErr.details || 'None'}`);
      }
    } else {
      console.log(`✅ Supabase ping successful (${latency}ms). Database is online and accessible.`);
    }
  } catch (err) {
    console.error(`❌ Network error reaching Supabase: ${err.message}`);
    process.exit(1);
  }

  // 2. Table Schema Audit
  console.log('\n--- 2. Required Production Tables Audit ---');
  const tables = [
    'categories',
    'courses',
    'course_modules',
    'course_lessons',
    'interview_questions',
    'cms_articles',
    'media_assets',
    'document_sources',
    'content_versions',
    'user_profiles',
    'user_lesson_progress',
    'user_exercise_records',
    'user_coding_projects',
    'knowledge_chunks',
    'chat_sessions',
    'chat_messages',
    'chat_message_citations',
  ];

  const tableReport = [];
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      if (error) {
        tableReport.push({ table, exists: false, count: 0, error: error.message });
      } else {
        tableReport.push({ table, exists: true, count: count || 0, error: null });
      }
    } catch (err) {
      tableReport.push({ table, exists: false, count: 0, error: err.message });
    }
  }

  console.log('| Table Name | Exists in DB | Current Row Count | Notes |');
  console.log('|---|:---:|:---:|---|');
  let missingTables = 0;
  for (const r of tableReport) {
    const statusIcon = r.exists ? '✅' : '❌';
    const note = r.exists ? 'Ready' : `Missing: ${r.error}`;
    if (!r.exists) missingTables++;
    console.log(`| \`${r.table}\` | ${statusIcon} | ${r.count} | ${note} |`);
  }

  // 3. Vector Extension & RPC check
  console.log('\n--- 3. pgvector & Semantic Search RPC Audit ---');
  try {
    // Test match_knowledge_chunks RPC
    const dummyEmbedding = new Array(768).fill(0.01);
    const { data: rpcData, error: rpcErr } = await supabase.rpc('match_knowledge_chunks', {
      query_embedding: dummyEmbedding,
      match_threshold: 0.1,
      match_count: 1,
    });
    if (rpcErr) {
      console.log(`⚠️  match_knowledge_chunks RPC test: ${rpcErr.message}`);
    } else {
      console.log(
        '✅ match_knowledge_chunks RPC function exists and is callable with 768-dim vector.'
      );
    }
  } catch (err) {
    console.log(`⚠️  match_knowledge_chunks RPC test failed: ${err.message}`);
  }

  // 4. Supabase Storage Audit
  console.log('\n--- 4. Supabase Storage Buckets Audit ---');
  try {
    const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
    if (bErr) {
      console.log(`❌ Failed to list storage buckets: ${bErr.message}`);
    } else {
      console.log(`Found ${buckets ? buckets.length : 0} storage bucket(s):`);
      let foundTargetBucket = false;
      for (const b of buckets || []) {
        console.log(`  • Bucket: ${b.name} (id: ${b.id}, public: ${b.public})`);
        if (b.name === bucketName) foundTargetBucket = true;
      }
      if (!foundTargetBucket) {
        console.log(`⚠️  Target bucket "${bucketName}" was NOT found in Supabase Storage!`);
      } else {
        console.log(`✅ Target bucket "${bucketName}" exists.`);
        // List files in the target bucket
        const { data: files, error: fErr } = await supabase.storage
          .from(bucketName)
          .list('', { limit: 100 });
        if (fErr) {
          console.log(`  ⚠️ Failed to list objects in "${bucketName}": ${fErr.message}`);
        } else {
          console.log(
            `  • Top-level objects in "${bucketName}": ${files ? files.length : 0} objects found.`
          );
        }
      }
    }
  } catch (err) {
    console.log(`❌ Error querying Supabase storage: ${err.message}`);
  }

  // 5. Check Local Uploaded Media
  console.log('\n--- 5. Local Media Assets Migration Check ---');
  const localUploadDir = path.join(process.cwd(), 'public/uploads');
  if (fs.existsSync(localUploadDir)) {
    const countFiles = (dir) => {
      let files = [];
      const list = fs.readdirSync(dir);
      for (const item of list) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          files = files.concat(countFiles(fullPath));
        } else {
          files.push(fullPath);
        }
      }
      return files;
    };
    const allLocalFiles = countFiles(localUploadDir);
    console.log(`Local files in public/uploads: ${allLocalFiles.length} files found.`);
    console.log('Sample local uploads:');
    allLocalFiles.slice(0, 5).forEach((f) => console.log(`  • ${path.relative(process.cwd(), f)}`));
  } else {
    console.log('No local public/uploads directory found.');
  }

  console.log('\n================================================================');
  console.log(`Audit Complete. Missing Tables: ${missingTables}`);
  console.log('================================================================');
}

runHealthCheck().catch((err) => {
  console.error('Fatal in health check:', err);
  process.exit(1);
});
