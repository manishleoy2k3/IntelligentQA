import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { sanitizeGeminiKey } from '@/lib/gemini-validator';
import {
  generateArchitectureFromPrompt,
  reviewArchitectureDiagram,
} from '@/lib/diagram/ai-diagram-service';
import { calculateElkLayout } from '@/lib/diagram/elk-layout';
import { generateArchitectureSvg } from '@/lib/diagram/svg-generator';
import { generateEducationalInfographic } from '@/lib/diagram/image-generation';
import { validateArchitectureDiagram } from '@/lib/diagram/schema';
import { cmsStore } from '@/lib/cms-store';
import { StoredDiagramRecord } from '@/types/architecture-diagram';

const DIAGRAMS_DATA_FILE = path.join(process.cwd(), 'src/lib/diagrams-store.json');

function loadDiagrams(): StoredDiagramRecord[] {
  try {
    if (fs.existsSync(DIAGRAMS_DATA_FILE)) {
      const content = fs.readFileSync(DIAGRAMS_DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Failed to load diagrams store:', err);
  }
  return [];
}

function saveDiagrams(records: StoredDiagramRecord[]) {
  try {
    fs.writeFileSync(DIAGRAMS_DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save diagrams store:', err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get('lessonId');
    const courseId = searchParams.get('courseId');

    let records = loadDiagrams();
    if (lessonId) {
      records = records.filter((r) => r.lessonId === lessonId);
    }
    if (courseId) {
      records = records.filter((r) => r.courseId === courseId);
    }

    return NextResponse.json({ success: true, diagrams: records });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    const headerKey = req.headers.get('x-gemini-api-key');
    const effectiveApiKey = sanitizeGeminiKey(
      headerKey || body.apiKey || process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY || ''
    );

    // ACTION 1: Generate Professional Architecture Diagram (Mode A)
    if (action === 'generate_architecture') {
      const { prompt, context } = body;
      if (!prompt) {
        return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
      }

      const result = await generateArchitectureFromPrompt(prompt, context, effectiveApiKey);
      const review = reviewArchitectureDiagram(result.diagramData);

      return NextResponse.json({
        success: true,
        diagramData: result.diagramData,
        svg: result.svg,
        source: result.source,
        review,
      });
    }

    // ACTION 2: Review Architecture Diagram (Advisory AI Review)
    if (action === 'review_architecture') {
      const { diagramData } = body;
      const validation = validateArchitectureDiagram(diagramData);
      if (!validation.success) {
        return NextResponse.json({
          success: false,
          error: validation.error,
          details: validation.details,
        }, { status: 400 });
      }

      const review = reviewArchitectureDiagram(validation.data as any);
      return NextResponse.json({ success: true, review });
    }

    // ACTION 3: Generate Educational Infographic (Mode B)
    if (action === 'generate_infographic') {
      const { prompt, subject, targetLearner, technicalSections, aspectRatio } = body;
      if (!prompt) {
        return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
      }

      const result = await generateEducationalInfographic({
        prompt,
        subject,
        targetLearner,
        technicalSections,
        aspectRatio,
        apiKey: effectiveApiKey,
        model: body.imageModel,
      });

      return NextResponse.json(result);
    }

    // ACTION 4: Recalculate ELK Layout & Regenerate SVG
    if (action === 'layout_architecture') {
      const { diagramData } = body;
      const validation = validateArchitectureDiagram(diagramData);
      if (!validation.success) {
        return NextResponse.json({
          success: false,
          error: validation.error,
          details: validation.details,
        }, { status: 400 });
      }

      const layout = await calculateElkLayout(validation.data as any);
      const svg = generateArchitectureSvg(validation.data as any, layout);

      return NextResponse.json({
        success: true,
        diagramData: validation.data,
        layout,
        svg,
      });
    }

    // ACTION 5: Save Diagram Record & Persistent Storage
    if (action === 'save_diagram') {
      const { title, description, mode, architectureData, svgContent, imageUrl, courseId, lessonId } = body;

      const recordId = `diag-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      let finalImageUrl = imageUrl;

      // If architecture SVG provided, save as SVG media item
      if (mode === 'MODE_A_ARCHITECTURE' && svgContent) {
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filename = `architecture_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.svg`;
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, svgContent, 'utf-8');

        const mediaItem = cmsStore.saveMediaItem({
          id: `med-arch-${Date.now()}`,
          filename,
          originalName: `${title.replace(/\s+/g, '-').toLowerCase()}.svg`,
          url: `/uploads/${filename}`,
          mimeType: 'image/svg+xml',
          size: Buffer.byteLength(svgContent, 'utf-8'),
          dimensions: { width: 1200, height: 680 },
          alt: title,
          caption: description || `Figure: ${title}`,
          category: 'Architecture',
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'Course Administrator',
        });

        finalImageUrl = mediaItem.url;
      }

      const newRecord: StoredDiagramRecord = {
        id: recordId,
        title: title || 'Technical Diagram',
        description,
        mode: mode || 'MODE_A_ARCHITECTURE',
        architectureData,
        svgContent,
        imageUrl: finalImageUrl,
        courseId,
        lessonId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      };

      const records = loadDiagrams();
      records.unshift(newRecord);
      saveDiagrams(records);

      return NextResponse.json({
        success: true,
        record: newRecord,
        imageUrl: finalImageUrl,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('Admin diagram API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
