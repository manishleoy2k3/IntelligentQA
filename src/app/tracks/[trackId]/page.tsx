import { notFound, redirect } from 'next/navigation';
import { fetchAllCourses, fetchTrackByIdFromSupabase } from '@/lib/supabase/lessons';
import TrackOverviewClient from '@/components/tracks/track-overview-client';
import AcademyShell from '@/components/learning/academy-shell';
import { academyStore } from '@/lib/academy-store';

export async function generateStaticParams() {
  const courses = await fetchAllCourses();
  return courses.map((c) => ({ trackId: c.id }));
}

export default async function TrackOverviewPage({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;
  const track = await fetchTrackByIdFromSupabase(trackId);

  if (!track) {
    const course = academyStore.getCourse(trackId, { includeDrafts: false });
    if (course) {
      const firstLesson = course.modules?.[0]?.lessons?.[0];
      if (firstLesson) {
        redirect(`/learning/${firstLesson.slug}`);
      }
      redirect(`/learning/${course.slug}`);
    }
    notFound();
  }

  if (trackId === 'ai-qa') {
    return <AcademyShell initialLessonSlug="what-is-artificial-intelligence" />;
  }

  const guideSlug =
    track.id === 'selenium-java'
      ? 'selenium'
      : track.id === 'playwright-ts'
        ? 'playwright'
        : track.id;

  return <TrackOverviewClient initialTrack={track} guideSlug={guideSlug} />;
}
