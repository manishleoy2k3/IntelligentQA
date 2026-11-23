import { NextRequest, NextResponse } from 'next/server';
import { academyStore } from '@/lib/academy-store';
import { verifyAdminAccess } from '@/lib/cms-security';

export async function POST(req: NextRequest) {
  try {
    const auth = verifyAdminAccess(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.reason || 'Unauthorized: Admin role required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, parentId, orderedIds } = body;

    if (!type || !Array.isArray(orderedIds)) {
      return NextResponse.json(
        { success: false, error: 'type and orderedIds array are required fields.' },
        { status: 400 }
      );
    }

    const success = academyStore.reorderItems({
      type,
      parentId,
      orderedIds,
    });

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to reorder items. Verify parentId and orderedIds.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Items reordered successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
