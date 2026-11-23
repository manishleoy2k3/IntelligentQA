import { NextRequest, NextResponse } from 'next/server';
import { academyStore } from '@/lib/academy-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const lessonId = searchParams.get('lessonId') || undefined;
    const isSummary = searchParams.get('summary') === 'true';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId parameter is required.' },
        { status: 400 }
      );
    }

    if (isSummary) {
      const summary = academyStore.getUserLearningStats(userId);
      return NextResponse.json({
        success: true,
        summary,
        data: academyStore.getUserProgress(userId),
      });
    }

    const progress = academyStore.getUserProgress(userId, lessonId);
    return NextResponse.json({
      success: true,
      data: progress,
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
    const { userId, lessonId, completionStatus } = body;

    if (!userId || !lessonId || !completionStatus) {
      return NextResponse.json(
        { success: false, error: 'userId, lessonId, and completionStatus are required fields.' },
        { status: 400 }
      );
    }

    const validStatuses = ['not_started', 'in_progress', 'completed'];
    if (!validStatuses.includes(completionStatus)) {
      return NextResponse.json(
        { success: false, error: `Invalid completionStatus. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const recorded = academyStore.recordUserProgress({
      userId,
      lessonId,
      completionStatus,
    });

    return NextResponse.json({
      success: true,
      data: recorded,
      message: 'Lesson progress updated successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
