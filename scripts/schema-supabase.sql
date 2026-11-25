-- ==============================================================================
-- IntelligentQA Platform — Supabase Production PostgreSQL Schema
-- Standalone SQL for direct execution in Supabase Dashboard SQL Editor
-- Extensions: uuid-ossp, pgcrypto, vector (768 dimensions for Gemini text-embedding-004)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(120) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(64) DEFAULT 'BookOpen',
    sort_order INT DEFAULT 0,
    parent_category_id VARCHAR(64) REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_category_id);

-- 3. COURSES
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(64) PRIMARY KEY,
    category_id VARCHAR(64) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    slug VARCHAR(140) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    description TEXT,
    icon VARCHAR(64),
    thumbnail TEXT,
    level VARCHAR(32) NOT NULL DEFAULT 'All Levels' 
        CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'All Levels')),
    estimated_hours INT DEFAULT 10,
    sort_order INT DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'published' 
        CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

-- 4. COURSE MODULES
CREATE TABLE IF NOT EXISTS course_modules (
    id VARCHAR(64) PRIMARY KEY,
    course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    slug VARCHAR(140) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'published' 
        CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_course_module_slug UNIQUE (course_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_modules_course_sort ON course_modules(course_id, sort_order);

-- 5. COURSE LESSONS (CMS Source of Truth)
CREATE TABLE IF NOT EXISTS course_lessons (
    id VARCHAR(128) PRIMARY KEY,
    module_id VARCHAR(64) NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    slug VARCHAR(180) NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content_html TEXT NOT NULL DEFAULT '',
    block_data JSONB DEFAULT '{}'::jsonb,
    original_docx_path TEXT,
    rendered_docx_url TEXT,
    word_count INT DEFAULT 0,
    estimated_read_time INT DEFAULT 3,
    sort_order INT DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'published' 
        CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_course_lesson_slug UNIQUE (course_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_lessons_module_sort ON course_lessons(module_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_lessons_course_status ON course_lessons(course_id, status);

-- 6. INTERVIEW QUESTIONS (Strictly 800 items)
CREATE TABLE IF NOT EXISTS interview_questions (
    id VARCHAR(64) PRIMARY KEY,
    category VARCHAR(64) NOT NULL,
    technology VARCHAR(64) NOT NULL,
    difficulty VARCHAR(32) NOT NULL 
        CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Architect', 'Junior', 'Mid', 'Senior')),
    experience_level VARCHAR(32),
    min_years INT DEFAULT 0,
    max_years INT DEFAULT 30,
    topic VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    expected_focus TEXT,
    answer_summary TEXT NOT NULL,
    code_snippet TEXT DEFAULT '',
    best_practice TEXT NOT NULL,
    pitfall_to_avoid TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'published' 
        CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_iq_category_diff ON interview_questions(category, difficulty);
CREATE INDEX IF NOT EXISTS idx_iq_technology ON interview_questions(technology);
CREATE INDEX IF NOT EXISTS idx_iq_status ON interview_questions(status);

-- 7. CMS ARTICLES
CREATE TABLE IF NOT EXISTS cms_articles (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    short_description TEXT NOT NULL,
    featured_image TEXT,
    featured_image_caption TEXT,
    category VARCHAR(64) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    status VARCHAR(32) NOT NULL DEFAULT 'published'
        CHECK (status IN ('draft', 'in_review', 'published', 'scheduled', 'archived')),
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    reading_time_minutes INT DEFAULT 5,
    view_count INT DEFAULT 0,
    created_by JSONB NOT NULL DEFAULT '{}'::jsonb,
    seo_title VARCHAR(255),
    seo_description TEXT,
    canonical_url VARCHAR(500),
    published_date TIMESTAMPTZ,
    updated_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cms_articles_slug ON cms_articles(slug);
CREATE INDEX IF NOT EXISTS idx_cms_articles_status ON cms_articles(status);

-- 8. MEDIA ASSETS
CREATE TABLE IF NOT EXISTS media_assets (
    id VARCHAR(128) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    storage_url TEXT NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    size_bytes BIGINT NOT NULL,
    dimensions JSONB DEFAULT '{}'::jsonb,
    category VARCHAR(64) DEFAULT 'General',
    alt_text TEXT,
    caption TEXT,
    uploaded_by VARCHAR(128) DEFAULT 'Course Administrator',
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_category ON media_assets(category);

-- 9. DOCUMENT SOURCES
CREATE TABLE IF NOT EXISTS document_sources (
    id VARCHAR(128) PRIMARY KEY,
    lesson_id VARCHAR(128) REFERENCES course_lessons(id) ON DELETE SET NULL,
    original_filename VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL,
    file_hash_sha256 VARCHAR(64) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CONTENT VERSIONS (Audit Log)
CREATE TABLE IF NOT EXISTS content_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(32) NOT NULL CHECK (entity_type IN ('lesson', 'course', 'interview_question', 'article')),
    entity_id VARCHAR(128) NOT NULL,
    version_number INT NOT NULL,
    snapshot JSONB NOT NULL,
    created_by VARCHAR(128) NOT NULL DEFAULT 'system',
    change_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_entity_version UNIQUE (entity_type, entity_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_content_versions_lookup ON content_versions(entity_type, entity_id);

-- 11. USER PROFILES
CREATE TABLE IF NOT EXISTS user_profiles (
    id VARCHAR(128) PRIMARY KEY,
    firebase_uid VARCHAR(128) UNIQUE,
    email VARCHAR(255),
    display_name VARCHAR(255),
    phone_number VARCHAR(64),
    avatar_url TEXT,
    target_role VARCHAR(64) DEFAULT 'Manual QA',
    primary_track VARCHAR(64) DEFAULT 'playwright-ts',
    experience_years NUMERIC(4,1),
    streak_count INT DEFAULT 0,
    role VARCHAR(32) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    profile_completed BOOLEAN DEFAULT false,
    last_active_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_firebase ON user_profiles(firebase_uid);

-- 12. USER LESSON PROGRESS
CREATE TABLE IF NOT EXISTS user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(128) NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id VARCHAR(128) NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    completion_status VARCHAR(32) NOT NULL DEFAULT 'in_progress' 
        CHECK (completion_status IN ('not_started', 'in_progress', 'completed')),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT uq_user_lesson UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_ulp_user_course ON user_lesson_progress(user_id, course_id);

-- 13. USER EXERCISE RECORDS & PROJECTS
CREATE TABLE IF NOT EXISTS user_exercise_records (
    id VARCHAR(160) PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    language VARCHAR(32) NOT NULL,
    user_answers JSONB DEFAULT '{}'::jsonb,
    score INT DEFAULT 0,
    total_answered INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_coding_projects (
    id VARCHAR(160) PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    language VARCHAR(32) NOT NULL,
    project_id VARCHAR(64) NOT NULL,
    code TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. KNOWLEDGE CHUNKS & VECTOR EMBEDDINGS (pgvector 768-dim)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_type VARCHAR(32) NOT NULL CHECK (source_type IN ('lesson', 'interview_question', 'documentation', 'code_example')),
    source_id VARCHAR(128) NOT NULL,
    course_id VARCHAR(64) REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id VARCHAR(128) REFERENCES course_lessons(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    chunk_content TEXT NOT NULL,
    token_count INT DEFAULT 0,
    embedding vector(768) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_chunk_source UNIQUE (source_type, source_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_kc_source ON knowledge_chunks(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_kc_active ON knowledge_chunks(is_active);
CREATE INDEX IF NOT EXISTS idx_kc_course ON knowledge_chunks(course_id);

-- HNSW Vector Index for sub-50ms cosine similarity
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding_hnsw 
ON knowledge_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 15. CHAT SESSIONS & MESSAGES (Agent 08 Foundation)
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_identifier VARCHAR(128) NOT NULL,
    session_mode VARCHAR(64) NOT NULL DEFAULT 'sdet_mentor' 
        CHECK (session_mode IN ('sdet_mentor', 'interview_griller', 'code_auditor', 'academy_tutor')),
    title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
    context_filters JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_identifier);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    token_usage JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id, created_at ASC);

CREATE TABLE IF NOT EXISTS chat_message_citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    chunk_id UUID NOT NULL REFERENCES knowledge_chunks(id) ON DELETE CASCADE,
    similarity_score FLOAT NOT NULL,
    citation_order INT DEFAULT 1,
    source_title VARCHAR(255),
    source_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_citations_message ON chat_message_citations(message_id);

-- 16. VECTOR MATCH RPC FUNCTION
CREATE OR REPLACE FUNCTION match_knowledge_chunks(
    query_embedding vector(768),
    match_threshold FLOAT DEFAULT 0.65,
    match_count INT DEFAULT 5,
    filter_course_id VARCHAR(64) DEFAULT NULL,
    filter_source_type VARCHAR(32) DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    source_type VARCHAR(32),
    source_id VARCHAR(128),
    course_id VARCHAR(64),
    lesson_id VARCHAR(128),
    chunk_content TEXT,
    similarity FLOAT,
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
        kc.course_id,
        kc.lesson_id,
        kc.chunk_content,
        1 - (kc.embedding <=> query_embedding) AS similarity,
        kc.metadata
    FROM knowledge_chunks kc
    WHERE kc.is_active = true
      AND (filter_course_id IS NULL OR kc.course_id = filter_course_id)
      AND (filter_source_type IS NULL OR kc.source_type = filter_source_type)
      AND 1 - (kc.embedding <=> query_embedding) > match_threshold
    ORDER BY kc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 17. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_coding_projects ENABLE ROW LEVEL SECURITY;

-- Public read policies for published educational materials
CREATE POLICY "Public can view active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view published courses" ON courses FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view published modules" ON course_modules FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view published lessons" ON course_lessons FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view published interview questions" ON interview_questions FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view published articles" ON cms_articles FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view media" ON media_assets FOR SELECT USING (true);
CREATE POLICY "Public can match active chunks" ON knowledge_chunks FOR SELECT USING (is_active = true);
