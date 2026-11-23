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
    const { entityType, id, status } = body;

    if (!entityType || !id || !status) {
      return NextResponse.json(
        { success: false, error: 'entityType, id, and status are required fields.' },
        { status: 400 }
      );
    }

    const validEntities = ['course', 'module', 'lesson'];
    if (!validEntities.includes(entityType)) {
      return NextResponse.json(
        { success: false, error: `entityType must be one of: ${validEntities.join(', ')}` },
        { status: 400 }
      );
    }

    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const success = academyStore.setPublishStatus(entityType, id, status);
    if (!success) {
      return NextResponse.json(
        { success: false, error: `${entityType} with id ${id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${entityType} status updated to "${status}".`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
