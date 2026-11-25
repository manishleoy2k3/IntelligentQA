import { NextRequest, NextResponse } from 'next/server';
import { academyStore } from '@/lib/academy-store';
import { verifyAdminAccess } from '@/lib/cms-security';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = verifyAdminAccess(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.reason || 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { courseId, ...updates } = body;

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'courseId is required in body to update module.' },
        { status: 400 }
      );
    }

    const updated = academyStore.updateModule(courseId, id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Module ${id} not found under course ${courseId}.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Module updated successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = verifyAdminAccess(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.reason || 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'courseId query parameter is required to delete module.' },
        { status: 400 }
      );
    }

    const deleted = academyStore.deleteModule(courseId, id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: `Module ${id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Module deleted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
