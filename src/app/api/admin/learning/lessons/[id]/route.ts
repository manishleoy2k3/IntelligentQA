import { NextRequest, NextResponse } from 'next/server';
import { academyStore } from '@/lib/academy-store';
import { verifyAdminAccess } from '@/lib/cms-security';

export async function PUT(
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
    const body = await req.json();

    try {
      const updated = academyStore.updateLesson(id, body);
      if (!updated) {
        return NextResponse.json(
          { success: false, error: `Lesson ${id} not found.` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Lesson updated successfully.',
      });
    } catch (valErr: any) {
      return NextResponse.json(
        { success: false, error: valErr.message },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const deleted = academyStore.deleteLesson(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: `Lesson ${id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Lesson deleted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
