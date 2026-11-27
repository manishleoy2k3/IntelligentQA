-- ==============================================================================
-- IntelligentQA Platform — Phase 8D Domain-Adaptive RAG Retrieval Intelligence
-- Migration Version: 20261127000001
-- ==============================================================================

-- 1. Expand knowledge_sources & knowledge_chunks for 4-domain metadata
ALTER TABLE knowledge_sources DROP CONSTRAINT IF EXISTS knowledge_sources_source_type_check;
ALTER TABLE knowledge_sources
  ADD CONSTRAINT knowledge_sources_source_type_check
  CHECK (source_type IN ('course', 'module', 'lesson', 'article', 'interview_question', 'coding_problem', 'document_source'));

ALTER TABLE knowledge_sources ADD COLUMN IF NOT EXISTS technology VARCHAR(64);
ALTER TABLE knowledge_sources ADD COLUMN IF NOT EXISTS framework VARCHAR(64);
ALTER TABLE knowledge_sources ADD COLUMN IF NOT EXISTS programming_language VARCHAR(32);
ALTER TABLE knowledge_sources ADD COLUMN IF NOT EXISTS aliases TEXT[] DEFAULT '{}';
ALTER TABLE knowledge_sources ADD COLUMN IF NOT EXISTS source_url TEXT;

ALTER TABLE knowledge_chunks ADD COLUMN IF NOT EXISTS technology VARCHAR(64);
ALTER TABLE knowledge_chunks ADD COLUMN IF NOT EXISTS framework VARCHAR(64);
ALTER TABLE knowledge_chunks ADD COLUMN IF NOT EXISTS programming_language VARCHAR(32);
ALTER TABLE knowledge_chunks ADD COLUMN IF NOT EXISTS aliases TEXT[] DEFAULT '{}';
ALTER TABLE knowledge_chunks ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Full-text search index for hybrid lexical + vector retrieval
ALTER TABLE knowledge_chunks
  ADD COLUMN IF NOT EXISTS search_tsv tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(source_title, '') || ' ' || coalesce(technology, '') || ' ' || coalesce(framework, '') || ' ' || coalesce(chunk_content, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_kc_search_tsv ON knowledge_chunks USING GIN (search_tsv);
CREATE INDEX IF NOT EXISTS idx_kc_technology ON knowledge_chunks(technology) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_kc_framework ON knowledge_chunks(framework) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_kc_lang ON knowledge_chunks(programming_language) WHERE is_active = true;

-- 2. Synthetic Query Generation Table (isolated from canonical interview questions)
CREATE TABLE IF NOT EXISTS rag_synthetic_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_type VARCHAR(32) NOT NULL,
    source_id VARCHAR(128) NOT NULL,
    query_text TEXT NOT NULL,
    query_style VARCHAR(32) NOT NULL CHECK (query_style IN ('beginner', 'intermediate', 'advanced', 'practical', 'interview')),
    synonyms TEXT[] DEFAULT '{}',
    status VARCHAR(32) NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected')),
    batch_id VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_rsq_source ON rag_synthetic_queries(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_rsq_status ON rag_synthetic_queries(status);

-- 3. Hard-Negative Mining Candidates Table
CREATE TABLE IF NOT EXISTS rag_hard_negatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    synthetic_query_id UUID REFERENCES rag_synthetic_queries(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    positive_source_id VARCHAR(128) NOT NULL,
    negative_source_id VARCHAR(128) NOT NULL,
    negative_source_type VARCHAR(32) NOT NULL,
    similarity_score REAL NOT NULL,
    retrieval_method VARCHAR(32) NOT NULL DEFAULT 'hybrid',
    status VARCHAR(32) NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'verified_negative', 'false_negative')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_rhn_status ON rag_hard_negatives(status);
CREATE INDEX IF NOT EXISTS idx_rhn_pos ON rag_hard_negatives(positive_source_id);

-- 4. Retrieval Quality & Drift Monitoring Analytics (No PII)
CREATE TABLE IF NOT EXISTS rag_retrieval_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_hash VARCHAR(64) NOT NULL,
    query_preview VARCHAR(200) NOT NULL,
    query_category VARCHAR(64),
    technology VARCHAR(64),
    intent VARCHAR(32),
    result_count INT NOT NULL DEFAULT 0,
    top_similarity REAL DEFAULT 0,
    latency_ms INT NOT NULL DEFAULT 0,
    embedding_model VARCHAR(64) NOT NULL,
    embedding_version VARCHAR(32) NOT NULL DEFAULT 'v1',
    admin_flag VARCHAR(32) CHECK (admin_flag IN ('correct_retrieval', 'wrong_retrieval', 'missing_source', 'incorrect_ranking', 'incorrect_answer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rra_created ON rag_retrieval_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rra_flag ON rag_retrieval_analytics(admin_flag);

-- 5. Benchmark Runs History
CREATE TABLE IF NOT EXISTS rag_benchmark_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name VARCHAR(64) NOT NULL,
    model_version VARCHAR(32) NOT NULL DEFAULT 'v1',
    dataset_size INT NOT NULL,
    recall_at_5 REAL NOT NULL,
    recall_at_10 REAL NOT NULL,
    mrr REAL NOT NULL,
    ndcg_at_5 REAL NOT NULL,
    avg_latency_ms REAL NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
