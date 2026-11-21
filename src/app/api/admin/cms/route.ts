import { NextRequest, NextResponse } from 'next/server';
import { cmsStore } from '@/lib/cms-store';
import { verifyAdminAccess } from '@/lib/cms-security';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'articles';

    if (action === 'stats') {
      const stats = cmsStore.getCMSStats();
      return NextResponse.json({ success: true, stats });
    }

    if (action === 'categories') {
      const categories = cmsStore.getCategories();
      return NextResponse.json({ success: true, categories });
    }

    if (action === 'tags') {
      const tags = cmsStore.getTags();
      return NextResponse.json({ success: true, tags });
    }

    if (action === 'audit') {
      const logs = cmsStore.getAuditLogs();
      return NextResponse.json({ success: true, logs });
    }

    if (action === 'article') {
      const id = searchParams.get('id');
      const slug = searchParams.get('slug');
      if (id) {
        const art = cmsStore.getArticleById(id);
        return NextResponse.json({ success: true, article: art });
      }
      if (slug) {
        const art = cmsStore.getArticleBySlug(slug);
        return NextResponse.json({ success: true, article: art });
      }
      return NextResponse.json({ error: 'Missing article id or slug' }, { status: 400 });
    }

    // Default: list articles
    const status = searchParams.get('status') || undefined;
    const category = searchParams.get('category') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const search = searchParams.get('search') || undefined;

    const articles = cmsStore.getArticles({ status, category, tag, search });
    return NextResponse.json({ success: true, articles });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    if (action === 'save_article') {
      const { article, author } = body;
      if (!article) {
        return NextResponse.json({ error: 'Article payload required' }, { status: 400 });
      }
      const saved = cmsStore.saveArticle(article, author);
      return NextResponse.json({ success: true, article: saved });
    }

    if (action === 'duplicate_article') {
      const { id, author } = body;
      if (!id) {
        return NextResponse.json({ error: 'Article ID required' }, { status: 400 });
      }
      const duplicated = cmsStore.duplicateArticle(id, author);
      if (!duplicated) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, article: duplicated });
    }

    if (action === 'restore_revision') {
      const { articleId, revisionId, user } = body;
      if (!articleId || !revisionId) {
        return NextResponse.json({ error: 'Missing articleId or revisionId' }, { status: 400 });
      }
      const restored = cmsStore.restoreRevision(articleId, revisionId, user);
      if (!restored) {
        return NextResponse.json({ error: 'Failed to restore revision' }, { status: 400 });
      }
      return NextResponse.json({ success: true, article: restored });
    }

    if (action === 'save_category') {
      const { category } = body;
      const saved = cmsStore.saveCategory(category);
      return NextResponse.json({ success: true, category: saved });
    }

    if (action === 'save_tag') {
      const { tag } = body;
      const saved = cmsStore.saveTag(tag);
      return NextResponse.json({ success: true, tag: saved });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'article';
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
    }

    if (action === 'article') {
      const deleted = cmsStore.deleteArticle(id);
      return NextResponse.json({ success: deleted });
    }

    if (action === 'category') {
      const deleted = cmsStore.deleteCategory(id);
      return NextResponse.json({ success: deleted });
    }

    if (action === 'tag') {
      const deleted = cmsStore.deleteTag(id);
      return NextResponse.json({ success: deleted });
    }

    return NextResponse.json({ error: `Unknown delete action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
