import { NextRequest, NextResponse } from 'next/server';
import { academyStore } from '@/lib/academy-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
      });
    }

    const results = academyStore.searchCurriculum(query, { limit });

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
