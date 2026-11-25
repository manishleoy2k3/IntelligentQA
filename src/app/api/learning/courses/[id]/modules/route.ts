import { NextRequest, NextResponse } from 'next/server';
import { academyStore } from '@/lib/academy-store';
import { verifyAdminAccess } from '@/lib/cms-security';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = verifyAdminAccess(req);
    const course = academyStore.getCourse(id, { includeDrafts: auth.authorized });
    if (!course) {
      return NextResponse.json(
        { success: false, error: `Course ${id} not found.` },
        { status: 404 }
      );
    }

    const modules = academyStore.getModules(id, { includeDrafts: auth.authorized });
    return NextResponse.json({
      success: true,
      data: modules,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
