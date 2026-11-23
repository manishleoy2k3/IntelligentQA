import { NextRequest, NextResponse } from 'next/server';
import { academyStore } from '@/lib/academy-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const lessonId = searchParams.get('lessonId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId parameter is required.' },
        { status: 400 }
      );
    }

    if (lessonId) {
      const isBookmarked = academyStore.isLessonBookmarked(userId, lessonId);
      return NextResponse.json({
        success: true,
        bookmarked: isBookmarked,
      });
    }

    const bookmarks = academyStore.getUserBookmarks(userId);
    return NextResponse.json({
      success: true,
      data: bookmarks,
      count: bookmarks.length,
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
    const body = await req.json();
    const { userId, lessonId } = body;

    if (!userId || !lessonId) {
      return NextResponse.json(
        { success: false, error: 'userId and lessonId are required.' },
        { status: 400 }
      );
    }

    const result = academyStore.toggleBookmark(userId, lessonId);
    return NextResponse.json({
      success: true,
      data: result,
      message: result.bookmarked ? 'Lesson bookmarked.' : 'Bookmark removed.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const lessonId = searchParams.get('lessonId');

    if (!userId || !lessonId) {
      return NextResponse.json(
        { success: false, error: 'userId and lessonId are required.' },
        { status: 400 }
      );
    }

    const removed = academyStore.removeBookmark(userId, lessonId);
    return NextResponse.json({
      success: true,
      removed,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
