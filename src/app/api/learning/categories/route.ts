import { NextRequest, NextResponse } from 'next/server';
import { academyStore } from '@/lib/academy-store';
import { verifyAdminAccess } from '@/lib/cms-security';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const categories = academyStore.getCategories({ includeInactive });
    return NextResponse.json({
      success: true,
      data: categories,
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
    const { title, slug, description, icon, sortOrder, parentCategoryId, isActive } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { success: false, error: 'Title and slug are required fields.' },
        { status: 400 }
      );
    }

    const created = academyStore.createCategory({
      title,
      slug,
      description: description || '',
      icon: icon || 'FolderBook',
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      parentCategoryId: parentCategoryId || null,
      isActive: isActive !== undefined ? !!isActive : true,
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Category created successfully.',
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
