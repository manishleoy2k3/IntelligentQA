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
-- ROLLBACK STRATEGY (If needed to revert migrations cleanly):
-- ==============================================================================
-- DROP TABLE IF EXISTS cms_audit_logs CASCADE;
-- DROP TABLE IF EXISTS cms_media CASCADE;
-- DROP TABLE IF EXISTS cms_article_revisions CASCADE;
-- DROP TABLE IF EXISTS cms_article_tags CASCADE;
-- DROP TABLE IF EXISTS cms_articles CASCADE;
-- DROP TABLE IF EXISTS cms_tags CASCADE;
-- DROP TABLE IF EXISTS cms_categories CASCADE;
