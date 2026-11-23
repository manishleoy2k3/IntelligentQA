import { notFound } from 'next/navigation';
import { getTrackById, QA_TRACKS } from '@/lib/qa-curriculum';
import TrackOverviewClient from '@/components/tracks/track-overview-client';

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
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-[#111111] text-slate-100 font-sans">
        {/* Kept clean with no content */}
      </div>
    );
  }

  const guideSlug = track.id === 'selenium-java' ? 'selenium' : track.id === 'playwright-ts' ? 'playwright' : track.id;

  return <TrackOverviewClient initialTrack={track} guideSlug={guideSlug} />;
}
