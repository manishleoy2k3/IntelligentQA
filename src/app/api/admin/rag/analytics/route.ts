import { NextRequest, NextResponse } from 'next/server';
import { retrievalMonitoring, AdminQueryFlag } from '@/lib/rag/monitoring';

export async function GET() {
  try {
    const summary = retrievalMonitoring.getDashboardSummary();
    return NextResponse.json({ success: true, data: summary });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to load RAG analytics' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, flag } = body as { id?: string; flag?: AdminQueryFlag };
    if (!id || !flag) {
      return NextResponse.json(
        { success: false, error: 'Both id and flag are required' },
        { status: 400 }
      );
    }
    const updated = retrievalMonitoring.flagQuery(id, flag);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Analytics event not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to flag query' },
      { status: 500 }
    );
  }
}
