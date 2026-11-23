import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { academyStore } from '@/lib/academy-store';
import { verifyAdminAccess } from '@/lib/cms-security';

const DOCS_DIR = path.join(process.cwd(), 'public/uploads/learning/docs');
const MEDIA_DIR = path.join(process.cwd(), 'public/uploads/learning/media');

// Ensure directories exist
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    const auth = verifyAdminAccess(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.reason || 'Unauthorized: Admin role required' },
        { status: 401 }
      );
    }

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be multipart/form-data' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const lessonId = (formData.get('lessonId') as string) || '';
    const assetType = ((formData.get('assetType') as string) || 'attachment') as 'image' | 'diagram' | 'code' | 'attachment' | 'pdf';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const originalFilename = file.name;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const ext = path.extname(originalFilename).toLowerCase();
    const safeBaseName = path.basename(originalFilename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const storedFilename = `${safeBaseName}_${Date.now()}${ext}`;

    const isDocxOrPdf = ext === '.docx' || ext === '.doc' || ext === '.pdf';
    const targetDir = isDocxOrPdf ? DOCS_DIR : MEDIA_DIR;
    const filePath = path.join(targetDir, storedFilename);
    const publicUrl = `/uploads/learning/${isDocxOrPdf ? 'docs' : 'media'}/${storedFilename}`;

    fs.writeFileSync(filePath, buffer);

    if (isDocxOrPdf) {
      const docSourceId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      academyStore.saveDocumentSource({
        id: docSourceId,
        lessonId: lessonId || 'unassigned',
        originalFilename,
        storagePath: publicUrl,
        fileHashSha256: hash,
        fileSizeBytes: buffer.length,
        mimeType: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        data: {
          id: docSourceId,
          originalFilename,
          filePath: publicUrl,
          fileSizeBytes: buffer.length,
          mimeType: file.type,
          hash,
        },
        message: 'Document uploaded successfully.',
      }, { status: 201 });
    }

    // Otherwise save as lesson asset / media attachment
    const assetId = `asset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const savedAsset = academyStore.saveLessonAsset({
      id: assetId,
      lessonId: lessonId || 'unassigned',
      assetType,
      filePath: publicUrl,
      originalFilename,
      displayOrder: 0,
    });

    return NextResponse.json({
      success: true,
      data: savedAsset,
      message: 'Asset uploaded successfully.',
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
