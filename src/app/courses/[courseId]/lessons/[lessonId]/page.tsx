import { redirect } from 'next/navigation';
import { getLessonById } from '@/lib/qa-curriculum';
import { notFound } from 'next/navigation';

export default async function CourseLessonRedirectPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;

  if (courseId === 'ai-qa') {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-[#111111] text-slate-100 font-sans">
        {/* Kept clean with no content */}
      </div>
    );
  }

  const data = getLessonById(courseId, lessonId);

  if (!data) {
    notFound();
  }

  // Redirect to the interactive learning & code editor workspace
  redirect(`/tracks/${courseId}/${lessonId}`);
}
