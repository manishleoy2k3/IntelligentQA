import { notFound, redirect } from 'next/navigation';
import { getTrackById, QA_TRACKS } from '@/lib/qa-curriculum';
import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, CheckCircle, Clock, Layers, ArrowRight } from 'lucide-react';

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export async function generateStaticParams() {
  return QA_TRACKS.map((t) => ({ courseId: t.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId } = await params;
  const track = getTrackById(courseId);
  if (!track) return { title: 'Course Not Found' };

  return {
    title: `${track.title} | IntelligentQA Free Course`,
    description: track.description,
    alternates: {
      canonical: `https://intelligentqa.io/courses/${track.id}`,
    },
  };
}

export default async function PublicCoursePage({ params }: PageProps) {
  const { courseId } = await params;
  const track = getTrackById(courseId);

  if (!track) {
    notFound();
  }

  if (courseId === 'ai-qa') {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-[#111111] text-slate-100 font-sans">
        {/* Kept clean with no content */}
      </div>
    );
  }

  // Course Structured Data (JSON-LD)
  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: track.title,
    description: track.description,
    provider: {
      '@type': 'Organization',
      name: 'IntelligentQA',
      sameAs: 'https://intelligentqa.io',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online',
      courseWorkload: `PT${track.estimatedHours}H`,
    },
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-100 font-sans pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      {/* Course Header Banner */}
      <div className="border-b border-[#27272A] bg-gradient-to-b from-[#141418] via-[#0E0E11] to-[#09090B] py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Masterclass Curriculum</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            {track.title}
          </h1>
          <p className="text-base text-[#A1A1AA] max-w-3xl leading-relaxed">
            {track.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[#A1A1AA]">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>{track.modules.length} Modules</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              <span>{track.totalLessons} Hands-on Lessons</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>{track.estimatedHours} Hours of Learning</span>
            </span>
          </div>
        </div>
      </div>

      {/* Modules and Lessons */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 space-y-8">
        <h2 className="text-xl font-bold text-white">Course Syllabus &amp; Modules</h2>
        <div className="space-y-6">
          {track.modules.map((mod, mIdx) => (
            <div
              key={mod.id}
              className="rounded-2xl border border-[#27272A] bg-[#121215] overflow-hidden shadow-md"
            >
              <div className="p-5 border-b border-[#27272A] bg-[#18181C] flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                    Module {mIdx + 1}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{mod.title}</h3>
                  <p className="text-xs text-[#A1A1AA]">{mod.description}</p>
                </div>
                <span className="text-xs text-[#71717A] px-2.5 py-1 rounded bg-[#27272A]">
                  {mod.lessons.length} Lessons
                </span>
              </div>

              <div className="divide-y divide-[#1E1E22]">
                {mod.lessons.map((les, lIdx) => (
                  <Link
                    key={les.id}
                    href={`/courses/${track.id}/lessons/${les.id}`}
                    className="p-4 flex items-center justify-between hover:bg-[#15151A] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#1C1C20] border border-[#27272A] text-xs font-mono font-bold text-[#A1A1AA] flex items-center justify-center group-hover:border-purple-500/50 group-hover:text-purple-300">
                        {lIdx + 1}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                          {les.title}
                        </div>
                        <div className="text-xs text-[#71717A]">{les.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#71717A]">{les.durationMinutes} mins</span>
                      <ArrowRight className="w-4 h-4 text-[#71717A] group-hover:text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
