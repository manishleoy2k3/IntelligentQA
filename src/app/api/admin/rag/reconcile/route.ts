import { NextRequest, NextResponse } from 'next/server';
import { ragReconciler } from '@/lib/rag/reconciliation';
import { verifyAdminAccess } from '@/lib/cms-security';

export async function POST(req: NextRequest) {
  try {
    const auth = verifyAdminAccess(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.reason || 'Unauthorized: Admin role required for reconciliation operations' },
        { status: 401 }
      );
    }

    const report = await ragReconciler.runReconciliationScan();
    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    console.error('[API /api/admin/rag/reconcile] Error:', err);
    return NextResponse.json({ error: err?.message || 'Reconciliation error' }, { status: 500 });
  }
}
