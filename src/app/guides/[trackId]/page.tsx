import React, { Suspense } from 'react';
import GuideCatalogClient from './guide-catalog-client';

export function generateStaticParams() {
  return [
    { trackId: 'selenium' },
    { trackId: 'selenium-java' },
    { trackId: 'playwright' },
    { trackId: 'playwright-ts' },
    { trackId: 'api-testing' },
    { trackId: 'ai-qa' },
    { trackId: 'articles' },
    { trackId: 'tutorials-articles' },
  ];
}

export default async function TrackGuidePage({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-900 text-slate-400">
          <div className="animate-pulse flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce" />
            <span>Loading Concept Guides...</span>
          </div>
        </div>
      }
    >
      <GuideCatalogClient initialTrackId={trackId} />
    </Suspense>
  );
}
