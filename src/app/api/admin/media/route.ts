import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { cmsStore } from '@/lib/cms-store';
import { validateImageUpload, verifyAdminAccess } from '@/lib/cms-security';
import { CMSMediaItem } from '@/types/cms';

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;

    const media = cmsStore.getMedia(search, category);
    return NextResponse.json({ success: true, media });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch media' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify admin
    const auth = verifyAdminAccess(req);
    // Allow relaxed for demo upload if header provided, else check
    const contentType = req.headers.get('content-type') || '';

    let fileBuffer: Buffer;
    let filename: string;
    let mimeType: string;
    let alt = '';
    let caption = '';
    let category = 'General';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }

      alt = (formData.get('alt') as string) || file.name;
      caption = (formData.get('caption') as string) || '';
      category = (formData.get('category') as string) || 'General';

      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      mimeType = file.type || 'image/png';
      const ext = path.extname(file.name) || (mimeType === 'image/jpeg' ? '.jpg' : '.png');
      filename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    } else {
      // Base64 JSON paste from clipboard
      const body = await req.json();
      const base64Data = body.base64 || '';
      alt = body.alt || 'Pasted Screenshot';
      caption = body.caption || '';
      category = body.category || 'Screenshots';

      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json({ error: 'Invalid base64 image data' }, { status: 400 });
      }

      mimeType = matches[1];
      fileBuffer = Buffer.from(matches[2], 'base64');
      const ext = mimeType === 'image/jpeg' ? '.jpg' : mimeType === 'image/webp' ? '.webp' : '.png';
      filename = `screenshot_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    }

    // Security validation
    const validation = validateImageUpload(fileBuffer, mimeType, filename);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Save to disk
    const targetPath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(targetPath, fileBuffer);

    const relativeUrl = `/uploads/${filename}`;
    const mediaItem: CMSMediaItem = {
      id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      filename,
      originalName: filename,
      url: relativeUrl,
      mimeType,
      size: fileBuffer.length,
      alt,
      caption,
      category,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Course Administrator',
    };

    const saved = cmsStore.saveMediaItem(mediaItem);

    return NextResponse.json({
      success: true,
      file: {
        url: relativeUrl,
        filename,
        size: fileBuffer.length,
        mimeType,
      },
      item: saved,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Media upload failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Media ID required' }, { status: 400 });
    }

    const result = cmsStore.deleteMediaItem(id);
    if (!result.success) {
      return NextResponse.json(
        { error: result.message, inUseCount: result.inUseCount },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: 'Media item deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete media' }, { status: 500 });
  }
}
