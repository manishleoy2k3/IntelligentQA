import { getSupabaseClient } from './client';
import type { CMSArticle, ArticleStatus, EditorJSData } from '@/types/cms';

function mapRowToCMSArticle(row: Record<string, any>): CMSArticle {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    slug: row.slug,
    shortDescription: row.short_description,
    featuredImage: row.featured_image ?? undefined,
    featuredImageCaption: row.featured_image_caption ?? undefined,
    category: row.category,
    tags: Array.isArray(row.tags) ? row.tags : [],
    status: (row.status as ArticleStatus) || 'published',
    content: (row.content as EditorJSData) || { time: Date.now(), blocks: [] },
    readingTimeMinutes: row.reading_time_minutes ?? 5,
    viewCount: row.view_count ?? 0,
    createdBy: row.created_by || {
      id: 'admin',
      name: 'IntelligentQA Editorial',
      role: 'Admin',
    },
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
    canonicalUrl: row.canonical_url ?? undefined,
    publishedDate: row.published_date ?? undefined,
    updatedDate: row.updated_date ?? undefined,
  };
}

/**
 * Fetches published CMS articles from Supabase.
 */
export async function fetchPublishedArticles(category?: string): Promise<CMSArticle[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  let query = supabase
    .from('cms_articles')
    .select('*')
    .eq('status', 'published')
    .order('published_date', { ascending: false });

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error('[supabase/articles] Failed to fetch articles:', error?.message);
    return [];
  }

  return data.map(mapRowToCMSArticle);
}

/**
 * Fetches a single CMS article by slug from Supabase.
 */
export async function fetchArticleBySlug(slug: string): Promise<CMSArticle | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('cms_articles')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapRowToCMSArticle(data);
}
