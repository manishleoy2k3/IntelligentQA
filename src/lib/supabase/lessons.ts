import { getSupabaseClient } from './client';
import type { CourseRecord, CourseModuleRecord, CourseLessonRecord } from './types';

/**
 * Fetches all published courses from Supabase ordered by sort_order.
 */
export async function fetchAllCourses(): Promise<CourseRecord[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  if (error || !data) {
    console.error('[supabase/lessons] Failed to fetch courses:', error?.message);
    return [];
  }

  return data as CourseRecord[];
}

/**
 * Fetches a single course by ID or slug.
 */
export async function fetchCourseByIdOrSlug(idOrSlug: string): Promise<CourseRecord | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as CourseRecord;
}

/**
 * Fetches all published modules for a course ordered by sort_order.
 */
export async function fetchCourseModules(courseId: string): Promise<CourseModuleRecord[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('course_modules')
    .select('*')
    .eq('course_id', courseId)
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  if (error || !data) {
    console.error('[supabase/lessons] Failed to fetch modules:', error?.message);
    return [];
  }

  return data as CourseModuleRecord[];
}

/**
 * Fetches all published lessons for a course ordered by sort_order.
 */
export async function fetchCourseLessons(courseId: string): Promise<CourseLessonRecord[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('course_lessons')
    .select('*')
    .eq('course_id', courseId)
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  if (error || !data) {
    console.error('[supabase/lessons] Failed to fetch lessons:', error?.message);
    return [];
  }

  return data as CourseLessonRecord[];
}

/**
 * Fetches a single lesson by ID or slug within a course.
 */
export async function fetchLessonByIdOrSlug(
  courseId: string,
  lessonIdOrSlug: string
): Promise<CourseLessonRecord | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('course_lessons')
    .select('*')
    .eq('course_id', courseId)
    .or(`id.eq.${lessonIdOrSlug},slug.eq.${lessonIdOrSlug}`)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as CourseLessonRecord;
}

import type { Track, Module, Lesson, TrackId } from '@/types/qa';

export function getLessonHours(durationMinutes?: number): string {
  const mins = durationMinutes || 45;
  const hrs = Math.max(0.5, Math.round((mins / 60) * 2) / 2);
  return `${hrs}h`;
}

/**
 * Fetches all published courses, modules, and lessons from Supabase and maps them to TrackInfo[].
 */
export async function fetchTracksFromSupabase(): Promise<Track[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const [coursesRes, modulesRes, lessonsRes] = await Promise.all([
    supabase
      .from('courses')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true }),
    supabase
      .from('course_modules')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true }),
    supabase
      .from('course_lessons')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true }),
  ]);

  if (coursesRes.error || !coursesRes.data) {
    return [];
  }

  const modules = (modulesRes.data || []) as CourseModuleRecord[];
  const lessons = (lessonsRes.data || []) as CourseLessonRecord[];

  return (coursesRes.data as CourseRecord[]).map((course) => {
    const courseModules = modules.filter((m) => m.course_id === course.id);
    const mappedModules: Module[] = courseModules.map((mod) => {
      const modLessons = lessons.filter((l) => l.module_id === mod.id);
      const mappedLessons: Lesson[] = modLessons.map((l, idx) => ({
        id: l.id,
        moduleId: mod.id,
        trackId: course.id as TrackId,
        title: l.title,
        description: l.summary || '',
        durationMinutes: Math.max(15, (l.estimated_read_time || 3) * 10),
        badge: 'selenium',
        level: 'Intermediate',
        hasCodeEditor: true,
        language: course.id.includes('python')
          ? 'python'
          : course.id.includes('playwright')
            ? 'typescript'
            : 'java',
        starterCode: '',
        expectedOutput: '',
        hints: [],
        order: l.sort_order ?? idx,
        manualContext: { title: l.title, steps: [], painPoints: [] },
        automationContext: {
          playwrightTs: '',
          explanation: l.summary || '',
          bestPractices: [],
          antiPatterns: [],
        },
        aiAugmentation: { promptExample: '', agenticWorkflow: '', selfHealingTip: '' },
        challenge: {
          instruction: l.summary || '',
          starterCode: {},
          solutionCode: {},
          validationRules: [],
        },
      }));

      return {
        id: mod.id,
        trackId: course.id as TrackId,
        title: mod.title,
        description: mod.description || '',
        order: mod.sort_order ?? 0,
        lessons: mappedLessons,
      };
    });

    const totalLessons = mappedModules.reduce((acc, m) => acc + m.lessons.length, 0);

    return {
      id: course.id as TrackId,
      title: course.title,
      shortTitle: course.title.split(':')[0] || course.title,
      tagline: course.subtitle || course.description || '',
      description: course.description || '',
      color: 'emerald',
      badgeColor: 'emerald',
      iconName: course.icon || 'BookOpen',
      totalLessons,
      estimatedHours: course.estimated_hours || 10,
      modules: mappedModules,
    };
  });
}

export async function fetchTrackByIdFromSupabase(trackId: string): Promise<Track | null> {
  const tracks = await fetchTracksFromSupabase();
  return tracks.find((t) => t.id === trackId) || null;
}

export async function fetchLessonByIdFromSupabase(
  trackId: string,
  lessonId: string
): Promise<{ track: Track; lesson: Lesson } | null> {
  const track = await fetchTrackByIdFromSupabase(trackId);
  if (!track) return null;
  for (const mod of track.modules) {
    const lesson = mod.lessons.find((l) => l.id === lessonId);
    if (lesson) return { track, lesson };
  }
  return null;
}
