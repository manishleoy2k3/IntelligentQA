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
    const {
      courseId,
      moduleId,
      title,
      slug,
      summary,
      shortDescription,
      contentType,
      contentHtml,
      blockData,
      originalDocxPath,
      originalDocumentPath,
      renderedDocxUrl,
      renderedHtmlPath,
      pdfPath,
      wordCount,
      estimatedReadTime,
      estimatedReadingTime,
      displayOrder,
      sortOrder,
      status,
    } = body;

    if (!courseId || !moduleId || !title || !slug) {
      return NextResponse.json(
        { success: false, error: 'courseId, moduleId, title, and slug are required fields.' },
        { status: 400 }
      );
    }

    try {
      const created = academyStore.createLesson(courseId, moduleId, {
        title,
        slug,
        summary: summary || shortDescription || '',
        shortDescription: shortDescription || summary || '',
        contentType: contentType || 'html',
        contentHtml: contentHtml || '',
        blockData: blockData || null,
        originalDocxPath: originalDocxPath || originalDocumentPath || null,
        originalDocumentPath: originalDocumentPath || originalDocxPath || null,
        renderedDocxUrl: renderedDocxUrl || null,
        renderedHtmlPath: renderedHtmlPath || null,
        pdfPath: pdfPath || null,
        wordCount: typeof wordCount === 'number' ? wordCount : 0,
        estimatedReadTime: typeof estimatedReadTime === 'number' ? estimatedReadTime : (typeof estimatedReadingTime === 'number' ? estimatedReadingTime : 1),
        estimatedReadingTime: typeof estimatedReadingTime === 'number' ? estimatedReadingTime : (typeof estimatedReadTime === 'number' ? estimatedReadTime : 1),
        displayOrder: typeof displayOrder === 'number' ? displayOrder : (typeof sortOrder === 'number' ? sortOrder : 0),
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
        status: status || 'published',
        publishedAt: status === 'published' ? new Date().toISOString() : null,
      });

      return NextResponse.json({
        success: true,
        data: created,
        message: 'Lesson created successfully.',
      }, { status: 201 });
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
