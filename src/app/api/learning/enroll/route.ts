import { NextRequest, NextResponse } from 'next/server';
import { academyStore } from '@/lib/academy-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId parameter is required.' },
        { status: 400 }
      );
    }

    const enrolled = academyStore.getUserEnrolledCourses(userId);
    return NextResponse.json({
      success: true,
      data: enrolled,
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
    const { userId, courseId } = body;

    if (!userId || !courseId) {
      return NextResponse.json(
        { success: false, error: 'userId and courseId are required.' },
        { status: 400 }
      );
    }

    academyStore.enrollUserInCourse(userId, courseId);
    return NextResponse.json({
      success: true,
      message: 'Course enrolled successfully. Zero cost community membership.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
