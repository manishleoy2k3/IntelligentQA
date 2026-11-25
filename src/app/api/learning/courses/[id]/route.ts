import { NextRequest, NextResponse } from 'next/server';
import { academyStore } from '@/lib/academy-store';
import { verifyAdminAccess } from '@/lib/cms-security';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = verifyAdminAccess(req);
    const course = academyStore.getCourse(id, { includeDrafts: auth.authorized });
    if (!course) {
      return NextResponse.json(
        { success: false, error: `Course ${id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: course,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

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

    try {
      const updated = academyStore.updateCourse(id, body);
      if (!updated) {
        return NextResponse.json(
          { success: false, error: `Course ${id} not found.` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Course updated successfully.',
      });
    } catch (validationErr: any) {
      return NextResponse.json({ success: false, error: validationErr.message }, { status: 400 });
    }
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
    const deleted = academyStore.deleteCourse(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: `Course ${id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
