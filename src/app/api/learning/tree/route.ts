import { NextRequest, NextResponse } from 'next/server';
import { academyStore } from '@/lib/academy-store';
import { verifyAdminAccess } from '@/lib/cms-security';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const auth = verifyAdminAccess(req);
    const includeDrafts = auth.authorized && searchParams.get('includeDrafts') === 'true';

    const tree = academyStore.getNavigationTree({ includeDrafts });
    return NextResponse.json({
      success: true,
      data: tree,
    });
  } catch (error: any) {
    console.error('Error fetching navigation tree:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
