import React from 'react';
import { Metadata } from 'next';
import AcademyShell from '@/components/learning/academy-shell';
import { getLessonBySlug } from '@/data/learning/academy-curriculum';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const lessonSlug = slug && slug.length > 0 ? slug[slug.length - 1] : 'what-is-an-llm';
  const lesson = getLessonBySlug(lessonSlug);

  if (lesson) {
    return {
      title: `${lesson.title} — IntelligentQA Learning Academy`,
      description: lesson.summary,
    };
  }

  return {
    title: 'Learning Academy — Technical Documentation & QA Engineering | IntelligentQA',
    description:
      'Master artificial intelligence, prompt engineering, context engineering, Model Context Protocol (MCP), and autonomous test agents.',
  };
}

export default async function LearningAcademyPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const lessonSlug = slug && slug.length > 0 ? slug[slug.length - 1] : undefined;

  return <AcademyShell initialLessonSlug={lessonSlug} />;
}
