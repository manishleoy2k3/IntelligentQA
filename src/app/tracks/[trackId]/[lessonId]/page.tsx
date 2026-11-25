import { notFound, redirect } from 'next/navigation';
import { getLessonById, QA_TRACKS } from '@/lib/qa-curriculum';
import CodeEditorWorkspace from '@/components/tracks/code-editor-workspace';
import { academyStore } from '@/lib/academy-store';

export function generateStaticParams() {
  const params: { trackId: string; lessonId: string }[] = [];
  for (const track of QA_TRACKS) {
    for (const module of track.modules) {
      for (const lesson of module.lessons) {
        params.push({ trackId: track.id, lessonId: lesson.id });
      }
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

  const data = getLessonById(trackId, lessonId);

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
