-- ==============================================================================
-- IntelligentQA Platform — Phase 8C Supabase RAG Knowledge Engine & Freshness Schema
-- Migration Version: 20261126000001
-- Extensions: vector (pgvector 768-dim)
-- ==============================================================================

-- 1. Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. KNOWLEDGE SOURCE REGISTRY
-- Authoritative tracking of every published/indexable entity, its content hash, version, and indexing status
CREATE TABLE IF NOT EXISTS knowledge_sources (
    id VARCHAR(160) PRIMARY KEY, -- e.g. 'lesson:les-ai-qa-1-1' or 'interview_question:iq-pw-001'
    source_type VARCHAR(32) NOT NULL CHECK (source_type IN ('course', 'module', 'lesson', 'article', 'interview_question', 'document_source')),
    source_id VARCHAR(128) NOT NULL,
    source_title VARCHAR(255) NOT NULL,
    course_id VARCHAR(64),
    module_id VARCHAR(64),
    lesson_id VARCHAR(128),
    category VARCHAR(64),
    topic VARCHAR(255),
    publication_status VARCHAR(32) NOT NULL DEFAULT 'published' CHECK (publication_status IN ('published', 'draft', 'archived', 'deleted')),
    current_content_hash VARCHAR(64) NOT NULL,
    current_version INT NOT NULL DEFAULT 1,
    indexed_content_hash VARCHAR(64),
    indexed_version INT DEFAULT 0,
    indexing_status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (indexing_status IN ('pending', 'processing', 'completed', 'failed', 'superseded', 'skipped')),
    chunk_count INT DEFAULT 0,
    last_indexed_at TIMESTAMPTZ,
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_knowledge_source_entity UNIQUE (source_type, source_id)
);

CREATE INDEX IF NOT EXISTS idx_ks_status ON knowledge_sources(indexing_status);
CREATE INDEX IF NOT EXISTS idx_ks_publication ON knowledge_sources(publication_status);
CREATE INDEX IF NOT EXISTS idx_ks_course ON knowledge_sources(course_id);
CREATE INDEX IF NOT EXISTS idx_ks_type ON knowledge_sources(source_type);

-- 3. ENHANCE KNOWLEDGE CHUNKS TABLE FOR VERSIONING & AUDIT METADATA
-- Alter existing knowledge_chunks if present, or create with full Phase 8C metadata
DO $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'knowledge_chunks') THEN
        CREATE TABLE knowledge_chunks (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            source_type VARCHAR(32) NOT NULL,
            source_id VARCHAR(128) NOT NULL,
            source_title VARCHAR(255) NOT NULL DEFAULT '',
            course_id VARCHAR(64),
            module_id VARCHAR(64),
            lesson_id VARCHAR(128),
            category VARCHAR(64),
            topic VARCHAR(255),
            content_version INT NOT NULL DEFAULT 1,
            content_hash VARCHAR(64) NOT NULL DEFAULT '',
            chunk_index INT NOT NULL,
            chunk_content TEXT NOT NULL,
            token_count INT DEFAULT 0,
            embedding vector(768) NOT NULL,
            embedding_model VARCHAR(64) NOT NULL DEFAULT 'text-embedding-004',
            embedding_version VARCHAR(32) NOT NULL DEFAULT 'v1',
            publication_status VARCHAR(32) NOT NULL DEFAULT 'published',
            is_active BOOLEAN NOT NULL DEFAULT true,
            metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
            indexed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT uq_chunk_versioned UNIQUE (source_type, source_id, content_version, chunk_index)
        );
    ELSE
        -- Add missing columns to existing table if required
        BEGIN
            ALTER TABLE knowledge_chunks ADD COLUMN IF NOT EXISTS source_title VARCHAR(255) DEFAULT '';
            ALTER TABLE knowledge_chunks ADD COLUMN IF NOT EXISTS module_id VARCHAR(64);
            ALTER TABLE knowledge_chunks ADD COLUMN IF NOT EXISTS category VARCHAR(64);
            ALTER TABLE knowledge_chunks ADD COLUMN IF NOT EXISTS topic VARCHAR(255);
            ALTER TABLE knowledge_chunks ADD COLUMN IF NOT EXISTS content_version INT DEFAULT 1;
            ALTER TABLE knowledge_chunks ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64) DEFAULT '';
            ALTER TABLE knowledge_chunks ADD COLUMN IF NOT EXISTS embedding_model VARCHAR(64) DEFAULT 'text-embedding-004';
            ALTER TABLE knowledge_chunks ADD COLUMN IF NOT EXISTS embedding_version VARCHAR(32) DEFAULT 'v1';
            ALTER TABLE knowledge_chunks ADD COLUMN IF NOT EXISTS publication_status VARCHAR(32) DEFAULT 'published';
            ALTER TABLE knowledge_chunks ADD COLUMN IF NOT EXISTS indexed_at TIMESTAMPTZ DEFAULT NOW();
            ALTER TABLE knowledge_chunks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_kc_active_retrieval ON knowledge_chunks(is_active, publication_status);
CREATE INDEX IF NOT EXISTS idx_kc_source_version ON knowledge_chunks(source_type, source_id, content_version);
CREATE INDEX IF NOT EXISTS idx_kc_course_filter ON knowledge_chunks(course_id, is_active);
CREATE INDEX IF NOT EXISTS idx_kc_category_filter ON knowledge_chunks(category, is_active);

-- HNSW Cosine Index for sub-50ms retrieval
CREATE INDEX IF NOT EXISTS idx_kc_embedding_hnsw 
ON knowledge_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 4. KNOWLEDGE INDEXING JOB QUEUE (Transactional Outbox)
CREATE TABLE IF NOT EXISTS knowledge_indexing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type VARCHAR(32) NOT NULL CHECK (job_type IN ('index_source', 'reindex_source', 'unpublish_source', 'delete_source', 'reconciliation_scan')),
    source_type VARCHAR(32) NOT NULL,
    source_id VARCHAR(128) NOT NULL,
    content_hash VARCHAR(64),
    version INT DEFAULT 1,
    status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'superseded', 'skipped')),
    priority INT DEFAULT 5,
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    last_error TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kij_status_priority ON knowledge_indexing_jobs(status, priority, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_kij_source ON knowledge_indexing_jobs(source_type, source_id);

-- 5. ADVANCED VECTOR RETRIEVAL RPC FUNCTION (With immediate publication & active version checks)
CREATE OR REPLACE FUNCTION match_knowledge_rag(
    query_embedding vector(768),
    match_threshold FLOAT DEFAULT 0.55,
    match_count INT DEFAULT 6,
    filter_course_id VARCHAR(64) DEFAULT NULL,
    filter_category VARCHAR(64) DEFAULT NULL,
    filter_source_type VARCHAR(32) DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    source_type VARCHAR(32),
    source_id VARCHAR(128),
    source_title VARCHAR(255),
    course_id VARCHAR(64),
    module_id VARCHAR(64),
    lesson_id VARCHAR(128),
    category VARCHAR(64),
    topic VARCHAR(255),
    chunk_index INT,
    chunk_content TEXT,
    similarity FLOAT,
    content_version INT,
    content_hash VARCHAR(64),
    metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        kc.id,
        kc.source_type,
        kc.source_id,
        kc.source_title,
        kc.course_id,
        kc.module_id,
        kc.lesson_id,
        kc.category,
        kc.topic,
        kc.chunk_index,
        kc.chunk_content,
        1 - (kc.embedding <=> query_embedding) AS similarity,
        kc.content_version,
        kc.content_hash,
        kc.metadata
    FROM knowledge_chunks kc
    WHERE kc.is_active = true
      AND kc.publication_status = 'published'
      AND (filter_course_id IS NULL OR kc.course_id = filter_course_id)
      AND (filter_category IS NULL OR kc.category = filter_category)
      AND (filter_source_type IS NULL OR kc.source_type = filter_source_type)
      AND 1 - (kc.embedding <=> query_embedding) >= match_threshold
    ORDER BY kc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_indexing_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published knowledge sources" ON knowledge_sources 
    FOR SELECT USING (publication_status = 'published');

CREATE POLICY "Public can match published active knowledge chunks" ON knowledge_chunks 
    FOR SELECT USING (is_active = true AND publication_status = 'published');

CREATE POLICY "Admin full access knowledge_sources" ON knowledge_sources 
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admin full access knowledge_chunks" ON knowledge_chunks 
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admin full access knowledge_indexing_jobs" ON knowledge_indexing_jobs 
    FOR ALL USING (auth.role() = 'service_role');

GRANT SELECT ON knowledge_sources TO anon, authenticated;
GRANT SELECT ON knowledge_chunks TO anon, authenticated;
GRANT ALL ON knowledge_sources TO postgres, service_role;
GRANT ALL ON knowledge_chunks TO postgres, service_role;
GRANT ALL ON knowledge_indexing_jobs TO postgres, service_role;
