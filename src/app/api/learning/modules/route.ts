import { NextRequest, NextResponse } from 'next/server';
import { academyStore } from '@/lib/academy-store';
import { verifyAdminAccess } from '@/lib/cms-security';

export async function POST(req: NextRequest) {
  try {
    const auth = verifyAdminAccess(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.reason || 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { courseId, title, slug, description, sortOrder, status } = body;

    if (!courseId || !title || !slug) {
      return NextResponse.json(
        { success: false, error: 'courseId, title, and slug are required fields.' },
        { status: 400 }
      );
    }

    const created = academyStore.createModule(courseId, {
      title,
      slug,
      description: description || '',
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      status: status || 'published',
      lessons: [],
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Module created successfully.',
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
