import { NextRequest, NextResponse } from 'next/server';
import { ragIndexer } from '@/lib/rag/indexer';
import { verifyAdminAccess } from '@/lib/cms-security';

export async function POST(req: NextRequest) {
  try {
    const auth = verifyAdminAccess(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.reason || 'Unauthorized: Admin role required for RAG index operations' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { action, sourceType, sourceId, batchSize = 25 } = body;

    if (action === 'index_all') {
      const scanRes = await ragIndexer.ingestAllPublishedContent();
      const batchRes = await ragIndexer.processBatch(batchSize);
      return NextResponse.json({
        success: true,
        action: 'index_all',
        queued: scanRes.queued,
        processed: batchRes.processed,
        succeeded: batchRes.succeeded,
        failed: batchRes.failed,
      });
    }

    if (action === 'index_single' && sourceType && sourceId) {
      await ragIndexer.syncSourceEvent(sourceType, sourceId, 'upsert', 'published');
      const batchRes = await ragIndexer.processBatch(1);
      return NextResponse.json({
        success: true,
        action: 'index_single',
        sourceType,
        sourceId,
        processed: batchRes.processed,
        succeeded: batchRes.succeeded,
        failed: batchRes.failed,
      });
    }

    if (action === 'process_batch') {
      const batchRes = await ragIndexer.processBatch(batchSize);
      return NextResponse.json({
        success: true,
        action: 'process_batch',
        ...batchRes,
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (err: any) {
    console.error('[API /api/admin/rag/index] Error:', err);
    return NextResponse.json({ error: err?.message || 'Indexing error' }, { status: 500 });
  }
}
