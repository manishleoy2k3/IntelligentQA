import { NextRequest, NextResponse } from 'next/server';
import { academyStore } from '@/lib/academy-store';
import { verifyAdminAccess } from '@/lib/cms-security';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyAdminAccess(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.reason || 'Unauthorized: Admin role required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const doc = academyStore.getDocumentSource(id);
    if (doc) {
      return NextResponse.json({
        success: true,
        data: doc,
      });
    }

    const media = academyStore.getMediaAttachment(id);
    if (media) {
      return NextResponse.json({
        success: true,
        data: media,
      });
    }

    return NextResponse.json(
      { success: false, error: `Document or asset ${id} not found.` },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
