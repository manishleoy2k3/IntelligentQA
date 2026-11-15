import React from 'react';
import { DEFAULT_CODING_PROBLEMS } from '@/lib/coding-problems';
import ProblemSolverClient from './problem-solver-client';

export function generateStaticParams() {
  return DEFAULT_CODING_PROBLEMS.map(p => ({
    problemId: p.id,
  }));
}

export default async function ProblemSolverPage({
  params,
}: {
  params: Promise<{ problemId: string }>;
}) {
  const { problemId } = await params;
  return <ProblemSolverClient problemId={problemId} />;
}
