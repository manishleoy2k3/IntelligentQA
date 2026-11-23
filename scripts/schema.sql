-- ==============================================================================
-- 100% Free & Open-Source Database Schema (PostgreSQL / SQLite Compatible)
-- License: MIT / PostgreSQL License (Zero Commercial Licensing Fees)
-- IntelligentQA Platform - Open-Source CMS & Course Management Engine
-- ==============================================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CMS CATEGORIES
CREATE TABLE IF NOT EXISTS cms_categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    slug VARCHAR(140) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(32) DEFAULT '#10B981',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cms_categories_slug ON cms_categories(slug);

-- 2. CMS TAGS
CREATE TABLE IF NOT EXISTS cms_tags (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cms_tags_slug ON cms_tags(slug);

-- 3. CMS ARTICLES & TUTORIALS
CREATE TABLE IF NOT EXISTS cms_articles (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    short_description TEXT NOT NULL,
    featured_image TEXT,
    featured_image_caption TEXT,
    category_id VARCHAR(64) REFERENCES cms_categories(id) ON DELETE SET NULL,
    category_name VARCHAR(120) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft', -- draft, in_review, published, scheduled, archived
    content JSONB NOT NULL DEFAULT '{"blocks": [], "version": "2.28.0"}',
    reading_time_minutes INT DEFAULT 5,
    view_count INT DEFAULT 0,
    seo_title VARCHAR(255),
    seo_description TEXT,
    canonical_url VARCHAR(500),
    published_at TIMESTAMP WITH TIME ZONE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id VARCHAR(64) NOT NULL,
    created_by_name VARCHAR(120) NOT NULL,
    created_by_role VARCHAR(120),
    created_by_avatar TEXT
);

CREATE INDEX IF NOT EXISTS idx_cms_articles_slug ON cms_articles(slug);
CREATE INDEX IF NOT EXISTS idx_cms_articles_status ON cms_articles(status);
CREATE INDEX IF NOT EXISTS idx_cms_articles_published_at ON cms_articles(published_at);
CREATE INDEX IF NOT EXISTS idx_cms_articles_category ON cms_articles(category_name);

-- 4. ARTICLE TAG JOIN TABLE
CREATE TABLE IF NOT EXISTS cms_article_tags (
    article_id VARCHAR(64) NOT NULL REFERENCES cms_articles(id) ON DELETE CASCADE,
    tag_id VARCHAR(64) NOT NULL REFERENCES cms_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- 5. ARTICLE REVISIONS HISTORY (Version Control)
CREATE TABLE IF NOT EXISTS cms_article_revisions (
    id VARCHAR(64) PRIMARY KEY,
    article_id VARCHAR(64) NOT NULL REFERENCES cms_articles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content JSONB NOT NULL,
    summary VARCHAR(255),
    created_by VARCHAR(120) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cms_revisions_article_id ON cms_article_revisions(article_id);

-- 6. MEDIA ASSETS LIBRARY
CREATE TABLE IF NOT EXISTS cms_media (
    id VARCHAR(64) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    mime_type VARCHAR(64) NOT NULL,
    size_bytes BIGINT NOT NULL,
    width INT,
    height INT,
    alt_text VARCHAR(255) NOT NULL,
    caption TEXT,
    category VARCHAR(64) DEFAULT 'General',
    uploaded_by VARCHAR(120) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cms_media_category ON cms_media(category);
CREATE INDEX IF NOT EXISTS idx_cms_media_filename ON cms_media(filename);

-- 7. CMS AUDIT LOGS
CREATE TABLE IF NOT EXISTS cms_audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(120) NOT NULL,
    user_email VARCHAR(180) NOT NULL,
    action VARCHAR(64) NOT NULL, -- create, update, delete, publish, restore_revision, upload_media
    entity_type VARCHAR(64) NOT NULL, -- article, course, module, lesson, media
    entity_id VARCHAR(64) NOT NULL,
    entity_title VARCHAR(255),
    details TEXT
);

CREATE INDEX IF NOT EXISTS idx_cms_audit_timestamp ON cms_audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_cms_audit_action ON cms_audit_logs(action);

-- ==============================================================================
-- 8. LEARNING ACADEMY SCHEMA EXTENSION
-- ==============================================================================

-- 8.1 Academy Categories (Hierarchical with optional parent_category_id)
CREATE TABLE IF NOT EXISTS academy_categories (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(128) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon_name VARCHAR(64) DEFAULT 'FolderBook',
    parent_category_id VARCHAR(64) REFERENCES academy_categories(id) ON DELETE SET NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_academy_categories_parent ON academy_categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_academy_categories_sort ON academy_categories(sort_order);

-- 8.2 Academy Courses
CREATE TABLE IF NOT EXISTS academy_courses (
    id VARCHAR(64) PRIMARY KEY,
    category_id VARCHAR(64) NOT NULL REFERENCES academy_categories(id) ON DELETE CASCADE,
    slug VARCHAR(128) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    icon VARCHAR(64) DEFAULT 'BookOpen',
    thumbnail VARCHAR(512),
    level VARCHAR(32) DEFAULT 'All Levels',
    estimated_hours INT DEFAULT 0,
    display_order INT NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_academy_courses_cat ON academy_courses(category_id);
CREATE INDEX IF NOT EXISTS idx_academy_courses_slug ON academy_courses(slug);
CREATE INDEX IF NOT EXISTS idx_academy_courses_sort ON academy_courses(sort_order);

-- 8.3 Academy Modules
CREATE TABLE IF NOT EXISTS academy_modules (
    id VARCHAR(64) PRIMARY KEY,
    course_id VARCHAR(64) NOT NULL REFERENCES academy_courses(id) ON DELETE CASCADE,
    slug VARCHAR(128) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_module_course_slug UNIQUE (course_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_academy_modules_course ON academy_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_academy_modules_sort ON academy_modules(sort_order);

-- 8.4 Academy Lessons
CREATE TABLE IF NOT EXISTS academy_lessons (
    id VARCHAR(64) PRIMARY KEY,
    module_id VARCHAR(64) NOT NULL REFERENCES academy_modules(id) ON DELETE CASCADE,
    slug VARCHAR(128) NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    short_description TEXT,
    content_type VARCHAR(32) DEFAULT 'html',
    content_html TEXT NOT NULL,
    block_data JSONB,
    original_docx_path VARCHAR(512),
    original_document_path VARCHAR(512),
    rendered_docx_url VARCHAR(512),
    rendered_html_path VARCHAR(512),
    pdf_path VARCHAR(512),
    word_count INT DEFAULT 0,
    estimated_read_time INT DEFAULT 1,
    estimated_reading_time INT DEFAULT 1,
    display_order INT NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'published',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_lesson_module_slug UNIQUE (module_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_academy_lessons_module ON academy_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_academy_lessons_slug ON academy_lessons(slug);
CREATE INDEX IF NOT EXISTS idx_academy_lessons_sort ON academy_lessons(sort_order);

-- 8.5 Document Sources
CREATE TABLE IF NOT EXISTS academy_document_sources (
    id VARCHAR(64) PRIMARY KEY,
    lesson_id VARCHAR(64) NOT NULL REFERENCES academy_lessons(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    storage_path VARCHAR(512) NOT NULL,
    file_hash_sha256 VARCHAR(64) NOT NULL,
    file_size_bytes INT NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    extraction_metadata JSONB,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_academy_docs_lesson ON academy_document_sources(lesson_id);

-- 8.6 Media Attachments & Lesson Assets
CREATE TABLE IF NOT EXISTS academy_media_attachments (
    id VARCHAR(64) PRIMARY KEY,
    lesson_id VARCHAR(64) REFERENCES academy_lessons(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_hash_sha256 VARCHAR(64) NOT NULL,
    width INT,
    height INT,
    mime_type VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_academy_media_lesson ON academy_media_attachments(lesson_id);

CREATE TABLE IF NOT EXISTS academy_lesson_assets (
    id VARCHAR(64) PRIMARY KEY,
    lesson_id VARCHAR(64) NOT NULL REFERENCES academy_lessons(id) ON DELETE CASCADE,
    asset_type VARCHAR(64) NOT NULL DEFAULT 'image',
    file_path VARCHAR(512) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_academy_lesson_assets_lesson ON academy_lesson_assets(lesson_id);

-- 8.7 User Lesson Progress
CREATE TABLE IF NOT EXISTS user_lesson_progress (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    lesson_id VARCHAR(64) NOT NULL REFERENCES academy_lessons(id) ON DELETE CASCADE,
    completion_status VARCHAR(32) NOT NULL DEFAULT 'not_started',
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_user_lesson_progress UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson ON user_lesson_progress(lesson_id);

-- ==============================================================================
-- ROLLBACK STRATEGY (If needed to revert migrations cleanly):
-- ==============================================================================
-- DROP TABLE IF EXISTS academy_media_attachments CASCADE;
-- DROP TABLE IF EXISTS academy_document_sources CASCADE;
-- DROP TABLE IF EXISTS academy_lessons CASCADE;
-- DROP TABLE IF EXISTS academy_modules CASCADE;
-- DROP TABLE IF EXISTS academy_courses CASCADE;
-- DROP TABLE IF EXISTS academy_categories CASCADE;
-- DROP TABLE IF EXISTS cms_audit_logs CASCADE;
-- DROP TABLE IF EXISTS cms_media CASCADE;
-- DROP TABLE IF EXISTS cms_article_revisions CASCADE;
-- DROP TABLE IF EXISTS cms_article_tags CASCADE;
-- DROP TABLE IF EXISTS cms_articles CASCADE;
-- DROP TABLE IF EXISTS cms_tags CASCADE;
-- DROP TABLE IF EXISTS cms_categories CASCADE;
