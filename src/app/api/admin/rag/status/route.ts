import { NextRequest, NextResponse } from 'next/server';
import { ragStorage } from '@/lib/rag/storage';
import { verifyAdminAccess } from '@/lib/cms-security';
import { generateProductionHealthReport } from '@/lib/rag/health-reporter';

export async function GET(req: NextRequest) {
  try {
    const auth = verifyAdminAccess(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.reason || 'Unauthorized: Admin role required for RAG status' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const sourceType = searchParams.get('sourceType') || undefined;
    const courseId = searchParams.get('courseId') || undefined;
    const publicationStatus = searchParams.get('publicationStatus') || undefined;
    const indexingStatus = searchParams.get('indexingStatus') || undefined;

    const [summary, sources, jobs, healthReport] = await Promise.all([
      ragStorage.getAuditSummary(),
      ragStorage.getKnowledgeSources({
        sourceType,
        courseId,
        publicationStatus,
        indexingStatus,
      }),
      ragStorage.getAllJobs(),
      generateProductionHealthReport(),
    ]);

    return NextResponse.json({
      summary,
      healthReport,
      sources: sources.slice(0, 100), // paginated preview
      totalSourcesCount: sources.length,
      jobs: jobs.slice(0, 30),
    });
  } catch (err: any) {
    console.error('[API /api/admin/rag/status] Error:', err);
    return NextResponse.json({ error: err?.message || 'Status check error' }, { status: 500 });
  }
}
