import { notFound } from 'next/navigation';
import { getTrackById, QA_TRACKS } from '@/lib/qa-curriculum';
import TrackOverviewClient from '@/components/tracks/track-overview-client';
import AcademyShell from '@/components/learning/academy-shell';

export function generateStaticParams() {
  return QA_TRACKS.map(t => ({ trackId: t.id }));
}

export default async function TrackOverviewPage({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;
  const track = getTrackById(trackId);

  if (!track) {
    notFound();
  }

  if (trackId === 'ai-qa') {
    return <AcademyShell initialLessonSlug="what-is-artificial-intelligence" />;
  }

  const guideSlug = track.id === 'selenium-java' ? 'selenium' : track.id === 'playwright-ts' ? 'playwright' : track.id;

  return <TrackOverviewClient initialTrack={track} guideSlug={guideSlug} />;
}
