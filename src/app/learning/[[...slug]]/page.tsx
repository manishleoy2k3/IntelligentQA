import React from 'react';
import { Metadata } from 'next';
import AcademyShell from '@/components/learning/academy-shell';
import { getLessonBySlug } from '@/data/learning/academy-curriculum';
import { INITIAL_PUBLISHED_COURSES } from '@/data/learning/initial-courses';

const KNOWN_COURSE_SLUGS = new Set([
  'overview',
  'ai-academy',
  'ai-for-qa',
  'ai-qa',
  'ai-for-qa-mastery',
  'course-ai-qa-mastery',
  'playwright-ts',
  'selenium-java',
  'api-testing',
  'cicd-concepts',
  'course-cicd-concepts',
  'ci-cd-concepts',
  'ci-cd',
  'git-cicd',
  'cat-git-cicd',
  ...INITIAL_PUBLISHED_COURSES.map((c) => c.slug),
  ...INITIAL_PUBLISHED_COURSES.map((c) => c.id),
]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const targetSlug = slug && slug.length > 0 ? slug[slug.length - 1] : undefined;

  if (targetSlug && (targetSlug === 'cicd-concepts' || targetSlug === 'course-cicd-concepts' || targetSlug.includes('cicd') || targetSlug.includes('ci-cd'))) {
    return {
      title: 'CI/CD Concepts — Git, GitHub Actions, Azure DevOps & Jenkins | IntelligentQA',
      description:
        'Master modern Continuous Integration, automated quality gating, and Continuous Delivery for QA automation: Git branching models, GitHub Actions matrix runners, Azure DevOps release gates, and distributed Jenkins container pipelines.',
    };
  }

  if (targetSlug && KNOWN_COURSE_SLUGS.has(targetSlug)) {
    const course = INITIAL_PUBLISHED_COURSES.find(c => c.slug === targetSlug || c.id === targetSlug);
    if (course) {
      return {
        title: `${course.title} — Technical Documentation & Quality Engineering | IntelligentQA`,
        description: course.description,
      };
    }
  }

  if (!targetSlug || targetSlug === 'overview' || targetSlug.includes('ai')) {
    return {
      title: 'AI Academy — Technical Documentation & Quality Engineering | IntelligentQA',
      description:
        'Master artificial intelligence, prompt engineering, context engineering, Model Context Protocol (MCP), and autonomous test agents.',
    };
  }

  const lesson = getLessonBySlug(targetSlug);
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
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams?: Promise<{ course?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedQuery = searchParams ? await searchParams : {};
  const slug = resolvedParams?.slug;
  const targetSlug = slug && slug.length > 0 ? slug[slug.length - 1] : undefined;

  const isCourseOverview = !targetSlug || KNOWN_COURSE_SLUGS.has(targetSlug) || !!resolvedQuery.course;
  const courseId = resolvedQuery.course || (targetSlug && KNOWN_COURSE_SLUGS.has(targetSlug) && targetSlug !== 'overview' ? targetSlug : undefined);

  return (
    <AcademyShell
      initialLessonSlug={isCourseOverview ? undefined : targetSlug}
      initialCourseId={courseId}
      isOverview={isCourseOverview}
    />
  );
}
