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
    const {
      courseId,
      moduleId,
      title,
      slug,
      summary,
      contentHtml,
      blockData,
      originalDocxPath,
      renderedDocxUrl,
      wordCount,
      estimatedReadTime,
      sortOrder,
      status,
    } = body;

    if (!courseId || !moduleId || !title || !slug) {
      return NextResponse.json(
        { success: false, error: 'courseId, moduleId, title, and slug are required fields.' },
        { status: 400 }
      );
    }

    const created = academyStore.createLesson(courseId, moduleId, {
      title,
      slug,
      summary: summary || '',
      contentHtml: contentHtml || '',
      blockData: blockData || null,
      originalDocxPath: originalDocxPath || null,
      renderedDocxUrl: renderedDocxUrl || null,
      wordCount: typeof wordCount === 'number' ? wordCount : 0,
      estimatedReadTime: typeof estimatedReadTime === 'number' ? estimatedReadTime : 1,
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      status: status || 'published',
      publishedAt: status === 'published' ? new Date().toISOString() : null,
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Lesson created successfully.',
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
