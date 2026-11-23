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
    const { courseId } = body;

    // Find course if courseId not directly specified
    let targetCourseId = courseId;
    if (!targetCourseId) {
      for (const course of academyStore.getCourses({ includeDrafts: true })) {
        if (course.modules?.some((m) => m.id === id)) {
          targetCourseId = course.id;
          break;
        }
      }
    }

    if (!targetCourseId) {
      return NextResponse.json(
        { success: false, error: `Module ${id} not found.` },
        { status: 404 }
      );
    }

    try {
      const updated = academyStore.updateModule(targetCourseId, id, body);
      if (!updated) {
        return NextResponse.json(
          { success: false, error: `Module ${id} not found.` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Module updated successfully.',
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
    let targetCourseId = '';
    for (const course of academyStore.getCourses({ includeDrafts: true })) {
      if (course.modules?.some((m) => m.id === id)) {
        targetCourseId = course.id;
        break;
      }
    }

    if (!targetCourseId) {
      return NextResponse.json(
        { success: false, error: `Module ${id} not found.` },
        { status: 404 }
      );
    }

    const deleted = academyStore.deleteModule(targetCourseId, id);
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
