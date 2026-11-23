import { NextRequest, NextResponse } from 'next/server';
import { academyStore } from '@/lib/academy-store';
import { verifyAdminAccess } from '@/lib/cms-security';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const status = searchParams.get('status') || undefined;
    const auth = verifyAdminAccess(req);
    const includeDrafts = auth.authorized && searchParams.get('includeDrafts') === 'true';

    const courses = academyStore.getCourses({ categoryId, status, includeDrafts });
    return NextResponse.json({
      success: true,
      data: courses,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

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
    const { categoryId, title, slug, subtitle, description, icon, thumbnail, level, estimatedHours, displayOrder, sortOrder, status } = body;

    if (!categoryId || !title || !slug) {
      return NextResponse.json(
        { success: false, error: 'categoryId, title, and slug are required fields.' },
        { status: 400 }
      );
    }

    if (!academyStore.isCourseSlugUnique(slug)) {
      return NextResponse.json(
        { success: false, error: `Course slug "${slug}" is already in use.` },
        { status: 400 }
      );
    }

    const created = academyStore.createCourse({
      categoryId,
      title,
      slug,
      subtitle: subtitle || '',
      description: description || '',
      icon: icon || 'BookOpen',
      thumbnail: thumbnail || '',
      level: level || 'All Levels',
      estimatedHours: typeof estimatedHours === 'number' ? estimatedHours : 0,
      displayOrder: typeof displayOrder === 'number' ? displayOrder : (typeof sortOrder === 'number' ? sortOrder : 0),
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      status: status || 'published',
      modules: [],
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Course created successfully.',
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
