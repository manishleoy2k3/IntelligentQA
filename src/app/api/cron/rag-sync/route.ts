import { NextRequest, NextResponse } from 'next/server';
import { ragReconciler } from '@/lib/rag/reconciliation';
import { ragIndexer } from '@/lib/rag/indexer';

/**
 * Vercel Cron Scheduled Background Reconciliation:
 * Runs periodically to ensure 100% data freshness and recover any dropped events.
 *
 * Configured in vercel.json:
 * {
 *   "crons": [
 *     { "path": "/api/cron/rag-sync", "schedule": "0 0 * * *" }
 *   ]
 * }
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Verify secret if configured, or require it strictly in production
    if (process.env.NODE_ENV === 'production') {
      if (!cronSecret) {
        return NextResponse.json(
          { error: 'CRON_SECRET is required in production environment' },
          { status: 500 }
        );
      }
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized cron invocation' }, { status: 401 });
      }
    } else if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized cron invocation' }, { status: 401 });
    }

    // 1. Process pending outbox jobs with safe execution batch limit
    const batchRes = await ragIndexer.processBatch(25);

    // 2. Run reconciliation scan
    const reconReport = await ragReconciler.runReconciliationScan();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      batchResults: batchRes,
      reconciliationReport: reconReport,
    });
  } catch (err: any) {
    console.error('[API /api/cron/rag-sync] Error:', err);
    return NextResponse.json({ error: err?.message || 'Cron error' }, { status: 500 });
  }
}
