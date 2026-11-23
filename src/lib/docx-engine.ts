import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execFileSync } from 'child_process';
import { academyStore } from './academy-store';

export interface DocxValidationResult {
  valid: boolean;
  error?: string;
  fileSizeBytes: number;
  sha256: string;
}

export interface ExtractedImage {
  original: string;
  filename: string;
  storage_path: string;
  public_url: string;
}

export interface DocxProcessingResult {
  success: boolean;
  error?: string;
  html: string;
  printHtml: string;
  pdfPath: string;
  originalDocxPath: string;
  extractedImages: ExtractedImage[];
  metadata: {
    headings_count: number;
    paragraphs_count: number;
    tables_count: number;
    images_count: number;
    code_blocks_count: number;
    lists_count: number;
    links_count: number;
    word_count: number;
    estimated_reading_time_minutes: number;
  };
}

const MAX_UPLOAD_SIZE = 25 * 1024 * 1024; // 25 MB

/**
 * Validates untrusted DOCX input:
 * - Checks file extension
 * - Verifies magic byte ZIP signature (PK\x03\x04)
 * - Enforces file size constraints
 */
export function validateDocxFile(buffer: Buffer, originalFilename: string): DocxValidationResult {
  const fileSizeBytes = buffer.length;
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

  // 1. File extension validation
  const ext = path.extname(originalFilename).toLowerCase();
  if (ext !== '.docx') {
    return {
      valid: false,
      error: `Invalid file extension '${ext}'. Only Microsoft Word (.docx) files are supported.`,
      fileSizeBytes,
      sha256,
    };
  }

  // 2. Size limit validation
  if (fileSizeBytes === 0) {
    return {
      valid: false,
      error: 'Uploaded file is empty (0 bytes).',
      fileSizeBytes,
      sha256,
    };
  }

  if (fileSizeBytes > MAX_UPLOAD_SIZE) {
    return {
      valid: false,
      error: `File size (${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed limit of 25 MB.`,
      fileSizeBytes,
      sha256,
    };
  }

  // 3. Magic byte ZIP signature verification: 50 4B 03 04 (PK\x03\x04)
  if (
    buffer.length < 4 ||
    buffer[0] !== 0x50 ||
    buffer[1] !== 0x4b ||
    buffer[2] !== 0x03 ||
    buffer[3] !== 0x04
  ) {
    return {
      valid: false,
      error: 'File signature verification failed: Corrupted or non-standard DOCX container (missing PK zip signature).',
      fileSizeBytes,
      sha256,
    };
  }

  return {
    valid: true,
    fileSizeBytes,
    sha256,
  };
}

/**
 * Executes high-fidelity document parsing and asset extraction
 */
export function processDocxDocument(options: {
  docxFilePath: string;
  lessonId: string;
  originalFilename: string;
}): DocxProcessingResult {
  const { docxFilePath, lessonId, originalFilename } = options;

  if (!fs.existsSync(docxFilePath)) {
    throw new Error(`File does not exist at path: ${docxFilePath}`);
  }

  const safeLessonId = (lessonId || 'unassigned').replace(/[^a-zA-Z0-9_-]/g, '_');
  const baseUploadDir = path.join(process.cwd(), 'public/uploads/learning');
  const imagesOutputDir = path.join(baseUploadDir, 'images', safeLessonId);
  const publicImagesBaseUrl = `/uploads/learning/images/${safeLessonId}`;
  const scriptPath = path.join(process.cwd(), 'scripts/docx_engine.py');

  fs.mkdirSync(imagesOutputDir, { recursive: true });

  try {
    const rawResult = execFileSync(
      'python3',
      [scriptPath, docxFilePath, safeLessonId, imagesOutputDir, publicImagesBaseUrl],
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );

    const parsed = JSON.parse(rawResult);
    if (!parsed.success) {
      throw new Error(parsed.error || 'Document conversion failed in python engine');
    }

    const { html, print_html, extracted_images, metadata } = parsed.data;

    // Save printable HTML / PDF layout companion
    const ext = path.extname(docxFilePath);
    const docBaseName = path.basename(docxFilePath, ext);
    const printFilePath = path.join(baseUploadDir, 'docs', `${docBaseName}_print.html`);
    fs.writeFileSync(printFilePath, print_html, 'utf-8');
    const pdfPath = `/uploads/learning/docs/${docBaseName}_print.html`;

    const wordCount = metadata.word_count || 100;
    const readingTime = Math.max(1, Math.ceil(wordCount / 180));

    // Calculate public DOCX path
    const originalDocxPath = `/uploads/learning/docs/${path.basename(docxFilePath)}`;

    // If lessonId exists and is valid, link assets to academyStore
    if (lessonId && lessonId !== 'unassigned') {
      try {
        // Save extracted images as lesson assets
        extracted_images.forEach((img: ExtractedImage, idx: number) => {
          academyStore.saveLessonAsset({
            id: `asset-${safeLessonId}-img-${idx + 1}-${Date.now().toString(36)}`,
            lessonId,
            assetType: 'image',
            filePath: img.public_url,
            originalFilename: img.filename,
            displayOrder: idx + 1,
          });
        });

        // Update lesson with rendered HTML, original docx, pdf view, word count, reading time
        const lesson = academyStore.getLesson(lessonId, { includeDrafts: true });
        if (lesson && lesson.lesson) {
          academyStore.updateLesson(lesson.lesson.id, {
            contentHtml: html,
            originalDocxPath,
            pdfPath,
            wordCount,
            estimatedReadingTime: readingTime,
          });
        }
      } catch (storeErr) {
        console.warn('Non-blocking academyStore sync warning:', storeErr);
      }
    }

    return {
      success: true,
      html,
      printHtml: print_html,
      pdfPath,
      originalDocxPath,
      extractedImages: extracted_images || [],
      metadata: {
        ...metadata,
        estimated_reading_time_minutes: readingTime,
      },
    };
  } catch (err: any) {
    console.error('Docx processing engine error:', err);
    return {
      success: false,
      error: err.message || 'Unknown error occurred while processing Word document',
      html: '',
      printHtml: '',
      pdfPath: '',
      originalDocxPath: `/uploads/learning/docs/${path.basename(docxFilePath)}`,
      extractedImages: [],
      metadata: {
        headings_count: 0,
        paragraphs_count: 0,
        tables_count: 0,
        images_count: 0,
        code_blocks_count: 0,
        lists_count: 0,
        links_count: 0,
        word_count: 0,
        estimated_reading_time_minutes: 1,
      },
    };
  }
}
