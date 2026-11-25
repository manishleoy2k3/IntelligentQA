'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Compass,
  Code2,
  Server,
  Layers,
  Award,
} from 'lucide-react';
import { TrackId } from '@/types/qa';

interface Question {
  id: string;
  category: string;
  title: string;
  options: {
    label: string;
    recommendedTrack: TrackId;
    reason: string;
  }[];
}

const ASSESSMENT_QUESTIONS: Question[] = [
  {
    id: 'q1',
    category: 'Programming & Scripting Experience',
    title: 'What is your current comfort level with coding?',
    options: [
      {
        label:
          'Pure Manual Tester: Zero coding experience, but eager to start from variables and loops.',
        recommendedTrack: 'playwright-ts',
        reason:
          'TypeScript + Playwright provides the gentlest, fastest modern syntax without enterprise boilerplate.',
      },
      {
        label: 'Know Core Java: Comfortable with classes, OOPs concepts, and TestNG basics.',
        recommendedTrack: 'selenium-java',
        reason:
          'Selenium + Java leverages your existing OOPs knowledge and targets enterprise banking stacks.',
      },
      {
        label: 'Postman & API Enthusiast: Daily experience with JSON payloads and HTTP requests.',
        recommendedTrack: 'api-testing',
        reason:
          'API Testing builds directly on your HTTP and Postman knowledge with REST Assured & Playwright API.',
      },
      {
        label:
          'Automation Practitioner: Looking to lead AI testing and integrate autonomous agents.',
        recommendedTrack: 'ai-qa',
        reason:
          'AI Academy will teach you prompt engineering, self-healing locators, and LLM evaluation.',
      },
    ],
  },
  {
    id: 'q2',
    category: 'Target Job Market & Role',
    title: 'What kind of company and role are you targeting in your next career step?',
    options: [
      {
        label: 'High-growth Tech Startups & Modern Scaleups (Next.js, React, fast CI/CD pipelines)',
        recommendedTrack: 'playwright-ts',
        reason:
          'Modern tech companies have overwhelmingly standardized on Playwright with TypeScript.',
      },
      {
        label:
          'Enterprise Banks, Healthcare & Fortune 500 corporations with established frameworks',
        recommendedTrack: 'selenium-java',
        reason:
          'Large enterprise institutions maintain massive legacy Selenium Java codebases with high demand.',
      },
      {
        label: 'Backend & Microservices QA Engineer focused on data integrity and high throughput',
        recommendedTrack: 'api-testing',
        reason:
          'Microservice ecosystems demand high-velocity REST Assured and contract testing skills.',
      },
      {
        label: 'Lead SDET / Staff QA Architect pioneering Generative AI & Autonomous Test Agents',
        recommendedTrack: 'ai-qa',
        reason:
          'Forward-looking roles demand expertise in testing AI systems and self-healing frameworks.',
      },
    ],
  },
  {
    id: 'q3',
    category: 'Daily Automation Frustration',
    title: 'What is your biggest pain point when attempting test automation?',
    options: [
      {
        label:
          'Setting up drivers, path variables, browser binaries, and fighting mysterious crashes',
        recommendedTrack: 'playwright-ts',
        reason:
          'Playwright bundles zero-config browser binaries; "npx playwright test" just works out of the box.',
      },
      {
        label:
          'Understanding complex Object-Oriented design patterns and building frameworks from scratch',
        recommendedTrack: 'selenium-java',
        reason:
          'Our Java track breaks down OOPs (Inheritance, Polymorphism) step-by-step for test architects.',
      },
      {
        label: 'Flaky UI tests that take 45 minutes to run and fail because of random spinners',
        recommendedTrack: 'api-testing',
        reason:
          'Replacing 70% of UI test steps with lightning-fast API assertions eliminates UI flakiness.',
      },
      {
        label:
          'Spending hours manually rewriting brittle XPaths whenever the frontend team updates HTML',
        recommendedTrack: 'ai-qa',
        reason:
          'Self-healing locators and accessible ARIA anchors permanently solve element churn.',
      },
    ],
  },
];

export default function DiagnosticAssessment() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [resultTrack, setResultTrack] = useState<{
    id: TrackId;
    title: string;
    reason: string;
  } | null>(null);

  const handleSelectOption = (optionIndex: number) => {
    const updated = [...selectedAnswers];
    updated[currentStep] = optionIndex;
    setSelectedAnswers(updated);

    if (currentStep < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Calculate recommended track based on selections
      const votes: Record<TrackId, number> = {
        'playwright-ts': 0,
        'selenium-java': 0,
        'api-testing': 0,
        'ai-qa': 0,
      };

      updated.forEach((optIdx, qIdx) => {
        const option = ASSESSMENT_QUESTIONS[qIdx].options[optIdx];
        if (option) {
          votes[option.recommendedTrack] = (votes[option.recommendedTrack] || 0) + 1;
        }
      });

      let topTrack: TrackId = 'playwright-ts';
      let maxVotes = -1;
      for (const [t, v] of Object.entries(votes)) {
        if (v > maxVotes) {
          maxVotes = v;
          topTrack = t as TrackId;
        }
      }

      const trackTitles: Record<TrackId, string> = {
        'playwright-ts': 'Playwright + TypeScript (Modern Web SDET)',
        'selenium-java': 'Selenium WebDriver + Java (Enterprise SDET)',
        'api-testing': 'API Testing & Automation (REST Assured & Playwright API)',
        'ai-qa': 'AI Academy',
      };

      const reasons: Record<TrackId, string> = {
        'playwright-ts':
          'Based on your background and goals, Playwright + TypeScript offers the fastest learning curve, zero-config setup, native auto-waiting, and highest startup job demand in 2026.',
        'selenium-java':
          'Your background aligns with Enterprise QA engineering. Mastering Core Java OOPs, TestNG, and WebDriver 4 will position you for high-paying roles in banking and enterprise institutions.',
        'api-testing':
          'Focusing on API automation will yield immediate 10x speedups in your testing pipelines, mastering both REST Assured and Playwright API.',
        'ai-qa':
          'You are primed for the frontier of Quality Engineering. Harnessing Generative AI for test synthesis and testing LLM applications will set you apart as a Next-Gen SDET.',
      };

      setResultTrack({
        id: topTrack,
        title: trackTitles[topTrack],
        reason: reasons[topTrack],
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
          <Compass className="w-3.5 h-3.5" />
          5-Minute Career Diagnostic
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Find Your Ideal SDET Learning Track
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-lg mx-auto">
          Answer 3 quick questions about your current skills, background, and career aspirations to
          receive a tailored recommendation.
        </p>
      </div>

      {!resultTrack ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>
              Question {currentStep + 1} of {ASSESSMENT_QUESTIONS.length}
            </span>
            <span>{ASSESSMENT_QUESTIONS[currentStep].category}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / ASSESSMENT_QUESTIONS.length) * 100}%`,
              }}
            />
          </div>

          {/* Question Title */}
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
            {ASSESSMENT_QUESTIONS[currentStep].title}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {ASSESSMENT_QUESTIONS[currentStep].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-3 hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 ${
                  selectedAnswers[currentStep] === idx
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold">{String.fromCharCode(65 + idx)}</span>
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{opt.label}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{opt.reason}</div>
                </div>
              </button>
            ))}
          </div>

          {currentStep > 0 && (
            <div className="pt-2">
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                ← Back to previous question
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Result Screen */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6 text-center">
          <div className="inline-flex p-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Recommended Track For You
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
              {resultTrack.title}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              {resultTrack.reason}
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/tracks/${resultTrack.id}`}
              className="w-full sm:w-auto py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              Start {resultTrack.title.split(' ')[0]} Curriculum
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => {
                setResultTrack(null);
                setCurrentStep(0);
                setSelectedAnswers([]);
              }}
              className="w-full sm:w-auto py-3 px-5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
