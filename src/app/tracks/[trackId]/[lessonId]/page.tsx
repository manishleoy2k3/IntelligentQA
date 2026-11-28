import { notFound, redirect } from 'next/navigation';
import {
  fetchAllCourses,
  fetchCourseLessons,
  fetchLessonByIdFromSupabase,
} from '@/lib/supabase/lessons';
import CodeEditorWorkspace from '@/components/tracks/code-editor-workspace';
import { academyStore } from '@/lib/academy-store';

export async function generateStaticParams() {
  const courses = await fetchAllCourses();
  const params: { trackId: string; lessonId: string }[] = [];
  for (const course of courses) {
    const lessons = await fetchCourseLessons(course.id);
    for (const lesson of lessons) {
      params.push({ trackId: course.id, lessonId: lesson.id });
    }
  }
  return params;
}

export default async function LessonWorkspacePage({
  params,
}: {
  params: Promise<{ trackId: string; lessonId: string }>;
}) {
  const { trackId, lessonId } = await params;

  if (trackId === 'ai-qa') {
    redirect('/learning/what-is-artificial-intelligence');
  }

  const data = await fetchLessonByIdFromSupabase(trackId, lessonId);

  if (!data) {
    const academyResult = academyStore.getLesson(lessonId, { includeDrafts: false });
    if (academyResult) {
      redirect(`/learning/${academyResult.lesson.slug}`);
    }
    notFound();
  }

  const { track, lesson } = data;

  // Find previous and next lesson hrefs
  const allLessons = track.modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const prevLessonHref = prevLesson ? `/tracks/${track.id}/${prevLesson.id}` : undefined;
  const nextLessonHref = nextLesson ? `/tracks/${track.id}/${nextLesson.id}` : undefined;

  return (
    <CodeEditorWorkspace
      track={track}
      lesson={lesson}
      prevLessonHref={prevLessonHref}
      nextLessonHref={nextLessonHref}
      lessonIndex={currentIndex >= 0 ? currentIndex + 1 : 1}
      totalLessons={allLessons.length}
    />
  );
}
