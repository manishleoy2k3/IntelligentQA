import { NextRequest, NextResponse } from 'next/server';
import { Track, Lesson } from '@/types/qa';
import { QA_TRACKS } from '@/lib/qa-curriculum';
import { LessonDoc } from '@/lib/qa-learning-docs';
import { CodingProblem, DEFAULT_CODING_PROBLEMS } from '@/lib/coding-problems';
import fs from 'node:fs';
import path from 'node:path';

const DATA_FILE = path.join(process.cwd(), 'src/lib/curriculum-data-store.json');

// Persistent storage that survives server restarts and syncs across all user sessions
let serverTracks: Track[] = JSON.parse(JSON.stringify(QA_TRACKS));
let serverLessonDocs: Record<string, LessonDoc> = {};
let serverCodingProblems: CodingProblem[] = JSON.parse(JSON.stringify(DEFAULT_CODING_PROBLEMS));

function loadFromDisk() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.tracks) && data.tracks.length > 0) {
        serverTracks = data.tracks;
      }
      if (data.lessonDocs && typeof data.lessonDocs === 'object') {
        serverLessonDocs = data.lessonDocs;
      }
      if (Array.isArray(data.codingProblems) && data.codingProblems.length > 0) {
        serverCodingProblems = data.codingProblems;
      }
    }
  } catch (e) {
    console.error('Failed to load curriculum from disk', e);
  }
}

function saveToDisk() {
  try {
    const payload = {
      tracks: serverTracks,
      lessonDocs: serverLessonDocs,
      codingProblems: serverCodingProblems,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save curriculum to disk', e);
  }
}

// Initial load from disk if store exists
loadFromDisk();

export async function GET(req: NextRequest) {
  try {
    loadFromDisk();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all'; // 'tracks' | 'docs' | 'problems' | 'all'
    const trackId = searchParams.get('trackId');
    const lessonId = searchParams.get('lessonId');
    const problemId = searchParams.get('problemId');

    if (type === 'tracks') {
      if (trackId) {
        const found = serverTracks.find((t) => t.id === trackId);
        return NextResponse.json({ success: true, track: found || null });
      }
      return NextResponse.json({ success: true, tracks: serverTracks });
    }

    if (type === 'docs') {
      if (lessonId) {
        return NextResponse.json({
          success: true,
          lessonId,
          doc: serverLessonDocs[lessonId] || null,
        });
      }
      return NextResponse.json({ success: true, docs: serverLessonDocs });
    }

    if (type === 'problems') {
      if (problemId) {
        const found = serverCodingProblems.find((p) => p.id === problemId);
        return NextResponse.json({ success: true, problem: found || null });
      }
      return NextResponse.json({ success: true, problems: serverCodingProblems });
    }

    // Default 'all' returns tracks, custom docs overrides, and coding problems
    return NextResponse.json({
      success: true,
      tracks: serverTracks,
      lessonDocs: serverLessonDocs,
      codingProblems: serverCodingProblems,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, trackId, moduleId, lesson, lessonDoc, problem, tracks, problems } = body;

    // 1. Bulk replace or update all tracks
    if (action === 'save_tracks' && Array.isArray(tracks)) {
      serverTracks = tracks;
      saveToDisk();
      return NextResponse.json({
        success: true,
        message: 'Tracks updated successfully in database',
        tracks: serverTracks,
      });
    }

    // 2. Save / Update single Lesson
    if (action === 'save_lesson' && trackId && lesson) {
      let track = serverTracks.find((t) => t.id === trackId);
      if (!track) {
        return NextResponse.json({ error: `Track ${trackId} not found` }, { status: 404 });
      }

      // Check if lesson exists in any module of the track first
      let found = false;
      for (const mod of track.modules) {
        const idx = mod.lessons.findIndex((l) => l.id === lesson.id);
        if (idx >= 0) {
          if (moduleId && mod.id !== moduleId) {
            mod.lessons.splice(idx, 1);
          } else {
            mod.lessons[idx] = lesson;
            found = true;
            break;
          }
        }
      }

      if (!found) {
        let targetModule = track.modules.find((m) => m.id === moduleId);
        if (!targetModule && track.modules.length > 0) {
          targetModule = track.modules[0];
        }
        if (targetModule) {
          targetModule.lessons.push(lesson);
        }
      }
      track.totalLessons = track.modules.reduce((sum, m) => sum + m.lessons.length, 0);

      // If a detailed lessonDoc was also passed, store it in server docs
      if (lessonDoc && lesson.id) {
        serverLessonDocs[lesson.id] = lessonDoc;
      }

      saveToDisk();

      return NextResponse.json({
        success: true,
        message: `Lesson "${lesson.title}" saved to server database`,
        lesson,
        lessonDoc: serverLessonDocs[lesson.id] || null,
      });
    }

    // 3. Save / Update Lesson Documentation (Guide)
    if (action === 'save_lesson_doc' && lessonDoc && (lessonDoc.id || body.lessonId)) {
      const id = body.lessonId || lessonDoc.id;
      serverLessonDocs[id] = lessonDoc;
      saveToDisk();
      return NextResponse.json({
        success: true,
        message: `Lesson doc for "${id}" saved to server database`,
        lessonDoc: serverLessonDocs[id],
      });
    }

    // 4. Save / Update Coding Problem
    if (action === 'save_problem' && problem) {
      const problemId = problem.id || `custom-${Date.now()}`;
      const savedProblem: CodingProblem = {
        ...problem,
        id: problemId,
        isCustom: true,
      };

      const existingIndex = serverCodingProblems.findIndex((p) => p.id === problemId);
      if (existingIndex >= 0) {
        serverCodingProblems[existingIndex] = savedProblem;
      } else {
        serverCodingProblems.unshift(savedProblem);
      }

      saveToDisk();

      return NextResponse.json({
        success: true,
        message: `Coding problem "${savedProblem.title}" saved to server database`,
        problem: savedProblem,
      });
    }

    // 5. Bulk replace coding problems
    if (action === 'save_problems' && Array.isArray(problems)) {
      serverCodingProblems = problems;
      saveToDisk();
      return NextResponse.json({
        success: true,
        message: 'Coding problems updated successfully in database',
        problems: serverCodingProblems,
      });
    }

    // 6. Reset to default
    if (action === 'reset_curriculum') {
      serverTracks = JSON.parse(JSON.stringify(QA_TRACKS));
      serverCodingProblems = JSON.parse(JSON.stringify(DEFAULT_CODING_PROBLEMS));
      for (const k of Object.keys(serverLessonDocs)) {
        delete serverLessonDocs[k];
      }
      saveToDisk();
      return NextResponse.json({
        success: true,
        message: 'Curriculum database reset to original defaults',
      });
    }

    return NextResponse.json({ error: 'Invalid action or payload' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'lesson' | 'problem'
    const trackId = searchParams.get('trackId');
    const lessonId = searchParams.get('lessonId');
    const problemId = searchParams.get('problemId');

    if (type === 'lesson' && trackId && lessonId) {
      const track = serverTracks.find((t) => t.id === trackId);
      if (track) {
        track.modules.forEach((m) => {
          m.lessons = m.lessons.filter((l) => l.id !== lessonId);
        });
        track.totalLessons = track.modules.reduce((sum, m) => sum + m.lessons.length, 0);
        delete serverLessonDocs[lessonId];
        saveToDisk();
        return NextResponse.json({
          success: true,
          message: `Lesson ${lessonId} deleted from server database`,
        });
      }
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    if (type === 'problem' && problemId) {
      serverCodingProblems = serverCodingProblems.filter((p) => p.id !== problemId);
      saveToDisk();
      return NextResponse.json({
        success: true,
        message: `Coding problem ${problemId} deleted from server database`,
      });
    }

    return NextResponse.json({ error: 'Missing parameters for delete' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
