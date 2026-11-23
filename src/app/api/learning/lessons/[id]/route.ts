import { NextRequest, NextResponse } from 'next/server';
import { academyStore } from '@/lib/academy-store';
import { verifyAdminAccess } from '@/lib/cms-security';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = verifyAdminAccess(req);
    let lessonWithContext = academyStore.getLessonWithContext(id);

    // If not found directly, check if `id` is a course slug or ID, and resolve to first published lesson
    if (!lessonWithContext) {
      const course = academyStore.getCourse(id, { includeDrafts: auth.authorized });
      if (course && course.modules && course.modules.length > 0) {
        const sortedMods = [...course.modules]
          .filter((m) => auth.authorized || m.status === 'published')
          .sort((a, b) => a.sortOrder - b.sortOrder);
        for (const m of sortedMods) {
          const sortedLessons = [...(m.lessons || [])]
            .filter((l) => auth.authorized || l.status === 'published')
            .sort((a, b) => a.sortOrder - b.sortOrder);
          if (sortedLessons.length > 0) {
            lessonWithContext = academyStore.getLessonWithContext(sortedLessons[0].slug || sortedLessons[0].id);
            break;
          }
        }
      }
    }

    if (!lessonWithContext) {
      return NextResponse.json(
        { success: false, error: `Lesson ${id} not found.` },
        { status: 404 }
      );
    }

    if (!auth.authorized) {
      if (
        lessonWithContext.lesson.status !== 'published' ||
        lessonWithContext.module.status !== 'published' ||
        lessonWithContext.course.status !== 'published'
      ) {
        return NextResponse.json(
          { success: false, error: `Lesson ${id} not found.` },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: lessonWithContext,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { success: false, error: auth.reason || 'Unauthorized' },
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
