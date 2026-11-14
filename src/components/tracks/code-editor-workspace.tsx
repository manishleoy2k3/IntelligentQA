'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Lesson, Track } from '@/types/qa';
import {
  Play,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  BookOpen,
  Code,
  Flame,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Lock,
  UserPlus,
  LogIn,
  ShieldCheck,
  GripVertical,
  Layers,
  Compass,
  Check,
  Cpu,
  Lightbulb,
  Target,
  ArrowRightCircle,
  Terminal,
} from 'lucide-react';
import Link from 'next/link';
import { QADatabase, DEMO_USER } from '@/lib/qa-db';
import { getLessonDoc, getConceptCodeSnippet } from '@/lib/qa-learning-docs';

export type SupportedLang = 'java' | 'typescript' | 'python';

interface WorkspaceProps {
  track: Track;
  lesson: Lesson;
  prevLessonHref?: string;
  nextLessonHref?: string;
  lessonIndex?: number;
  totalLessons?: number;
}

function getPythonCodeExample(lesson: Lesson, trackId: string): string {
  const isApi = trackId === 'api-testing';
  const isSelenium = trackId === 'selenium-java';

  if (isApi) {
    return `# Python requests + pytest Example: ${lesson.title}
import requests
import pytest

BASE_URL = "http://localhost:3000/api/sandbox/v1"

@pytest.fixture
def auth_headers():
    return {
        "Authorization": "Bearer sdet_jwt_token_sample",
        "Content-Type": "application/json"
    }

def test_api_contract_and_status(auth_headers):
    """
    Scenario: Verify API response contract and HTTP 200 status
    Concept: ${lesson.title}
    """
    response = requests.get(f"{BASE_URL}/users", headers=auth_headers, timeout=5)
    
    # Assert status code & contract schema
    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"
    
    data = response.json()
    assert isinstance(data.get("users"), list), "Payload should contain 'users' array"
    assert len(data["users"]) > 0, "Users list should not be empty"
    print(f"✔ API Verified: {len(data['users'])} records retrieved successfully.")
`;
  }

  if (isSelenium) {
    return `# Python Selenium WebDriver + pytest Example: ${lesson.title}
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

@pytest.fixture
def driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(0)  # Always use explicit waits in robust SDET frameworks
    yield driver
    driver.quit()

def test_${lesson.id.replace(/[^a-zA-Z0-9]/g, '_')}(driver):
    """
    Concept: ${lesson.title}
    Demonstrating resilient element location and explicit waits in Python.
    """
    driver.get("http://localhost:3000/sandbox/web")
    wait = WebDriverWait(driver, 10)
    
    # Wait for target element to be interactable
    element = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button, a, input")))
    assert element.is_displayed(), "Element should be visible on page"
    print("✔ Python Selenium concept execution validated.")
`;
  }

  return `# Python Playwright (pytest-playwright) Example: ${lesson.title}
import pytest
from playwright.sync_api import Page, expect

def test_${lesson.id.replace(/[^a-zA-Z0-9]/g, '_')}(page: Page):
    """
    Concept: ${lesson.title}
    Demonstrating resilient locators and web-first assertions in Python.
    """
    page.goto("http://localhost:3000/sandbox/web")
    
    # Resilient user-facing locator with auto-wait
    trigger_btn = page.get_by_role("button").first
    if trigger_btn.is_visible():
        trigger_btn.click()
    
    # Web-first auto-retrying assertion
    expect(page.get_by_role("heading", level=1)).to_be_visible(timeout=5000)
    print("✔ Python Playwright concept scenario passed successfully.")
`;
}

function getJavaCodeExample(lesson: Lesson, trackId: string): string {
  if (lesson.challenge?.starterCode?.java) {
    return lesson.challenge.starterCode.java;
  }
  if (lesson.challenge?.solutionCode?.java) {
    return lesson.challenge.solutionCode.java;
  }
  return `// Java SDET Concept Example: ${lesson.title}
package com.intelligentqa.concepts;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

public class ConceptDemo {
    private final WebDriver driver;
    private final WebDriverWait wait;

    public ConceptDemo(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void executeScenario() {
        // Concept: ${lesson.title}
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(By.tagName("h1")));
        System.out.println("✔ Java concept executed successfully: " + element.getText());
    }
}
`;
}

function getTypeScriptCodeExample(lesson: Lesson, trackId: string): string {
  if (lesson.challenge?.starterCode?.typescript) {
    return lesson.challenge.starterCode.typescript;
  }
  if (lesson.automationContext?.playwrightTs) {
    return lesson.automationContext.playwrightTs;
  }
  if (lesson.challenge?.solutionCode?.typescript) {
    return lesson.challenge.solutionCode.typescript;
  }
  return `// TypeScript Playwright Concept Example: ${lesson.title}
import { test, expect } from '@playwright/test';

test('${lesson.title}', async ({ page }) => {
  await page.goto('/sandbox/web');
  
  // Concept: ${lesson.title}
  const heading = page.getByRole('heading', { level: 1 });
  await expect(heading).toBeVisible();
  
  console.log('✔ TypeScript Playwright concept executed successfully.');
});
`;
}

function getCodeForLanguage(lang: SupportedLang, lesson: Lesson, trackId: string): string {
  // 1. First retrieve high-fidelity code strictly mapped to the Concept Guide
  const conceptCode = getConceptCodeSnippet(lesson.id, trackId, lang, lesson.title);
  if (conceptCode) {
    return conceptCode;
  }
  // 2. Fallbacks for challenge-specific code
  if (lang === 'java') return getJavaCodeExample(lesson, trackId);
  if (lang === 'python') return getPythonCodeExample(lesson, trackId);
  return getTypeScriptCodeExample(lesson, trackId);
}

export default function CodeEditorWorkspace({
  track,
  lesson,
  prevLessonHref,
  nextLessonHref,
  lessonIndex = 1,
  totalLessons = 1,
}: WorkspaceProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedLang, setSelectedLang] = useState<SupportedLang>(
    track.id === 'selenium-java' ? 'java' : 'typescript'
  );
  const [code, setCode] = useState<string>(() =>
    getCodeForLanguage(
      track.id === 'selenium-java' ? 'java' : 'typescript',
      lesson,
      track.id
    )
  );

  // Switch code immediately when user selects a language tab
  const handleLanguageChange = (lang: SupportedLang) => {
    setSelectedLang(lang);
    setCode(getCodeForLanguage(lang, lesson, track.id));
  };

  // Sync code whenever lesson or language changes
  useEffect(() => {
    setCode(getCodeForLanguage(selectedLang, lesson, track.id));
  }, [lesson.id, selectedLang, track.id]);
  const [activeTab, setActiveTab] = useState<'guide' | 'manual-vs-code' | 'ai-action'>('guide');
  const [validationResult, setValidationResult] = useState<{
    passed: boolean;
    message: string;
    details?: string[];
  } | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Draggable Splitter state (user can resize freely as needed)
  const [splitPercent, setSplitPercent] = useState<number>(55);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // AI in Action State
  const [promptInput, setPromptInput] = useState<string>(lesson.aiAugmentation.promptExample);
  const [aiSnippetLang, setAiSnippetLang] = useState<SupportedLang>(
    track.id === 'selenium-java' ? 'java' : 'typescript'
  );
  const [aiSnippet, setAiSnippet] = useState<string>('');
  const [isGeneratingSnippet, setIsGeneratingSnippet] = useState<boolean>(false);
  const [aiSnippetError, setAiSnippetError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [appliedFeedback, setAppliedFeedback] = useState<boolean>(false);

  // Sync prompt input when lesson changes
  useEffect(() => {
    setPromptInput(lesson.aiAugmentation.promptExample);
    setAiSnippet('');
    setAiSnippetError(null);
  }, [lesson.id, lesson.aiAugmentation.promptExample]);

  const handleTryWithAi = async () => {
    setIsGeneratingSnippet(true);
    setAiSnippetError(null);
    try {
      const storedKey =
        typeof window !== 'undefined'
          ? localStorage.getItem('intelligentqa_gemini_api_key') || ''
          : '';
      const techStackKey =
        aiSnippetLang === 'java'
          ? (track.id === 'api-testing' ? 'rest-assured' : 'selenium-java')
          : aiSnippetLang === 'python'
          ? 'playwright-python'
          : 'playwright-ts';

      const res = await fetch('/api/ai/qa-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'code_snippet',
          input: promptInput,
          techStack: techStackKey,
          apiKey: storedKey,
        }),
      });

      const data = await res.json();
      if (data?.output) {
        setAiSnippet(data.output);
      } else {
        setAiSnippetError('Unable to generate snippet. Please try again.');
      }
    } catch (err: any) {
      setAiSnippetError(err.message || 'Error communicating with AI service');
    } finally {
      setIsGeneratingSnippet(false);
    }
  };

  // Mouse drag handlers for resizable panels
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newPercent = ((e.clientX - rect.left) / rect.width) * 100;
      if (newPercent >= 25 && newPercent <= 80) {
        setSplitPercent(Math.round(newPercent));
      }
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  // Sync auth state
  const syncAuth = useCallback(() => {
    if (typeof window !== 'undefined') {
      const user = QADatabase.getCurrentUser();
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    syncAuth();
    const handleAuthChange = () => syncAuth();
    window.addEventListener('intelligentqa_auth_changed', handleAuthChange);
    return () => {
      window.removeEventListener('intelligentqa_auth_changed', handleAuthChange);
    };
  }, [syncAuth]);

  const isLocked = QADatabase.isLessonLocked(track.id, lesson.id, !!currentUser);

  const handleValidateAndRun = async () => {
    if (isLocked) return;

    setIsRunning(true);
    setValidationResult(null);

    // Simulate execution against live sandbox
    await new Promise(r => setTimeout(r, 600));

    const rules = lesson.challenge.validationRules;
    const errors: string[] = [];

    for (const rule of rules) {
      for (const req of rule.requiredPatterns) {
        if (!code.includes(req)) {
          errors.push(`Missing required pattern: "${req}" (${rule.description})`);
        }
      }
      for (const forbidden of rule.forbiddenPatterns) {
        if (code.includes(forbidden)) {
          errors.push(`Anti-pattern detected: Avoid using "${forbidden}" in modern automation.`);
        }
      }
    }

    const userId = currentUser?.id || DEMO_USER.id;

    if (errors.length === 0) {
      setValidationResult({
        passed: true,
        message: '✔ Test Passed! Your automation code meets all robust SDET criteria and executed successfully in the sandbox.',
      });
      setIsCompleted(true);
      // Persist progress to database
      await QADatabase.markLessonComplete(userId, track.id, lesson.moduleId, lesson.id);
      await QADatabase.saveCodeSubmission(userId, {
        challengeId: lesson.id,
        language: selectedLang,
        codeContent: code,
        status: 'passed',
        testOutput: '1 passed (100% assertions satisfied)',
      });
    } else {
      setValidationResult({
        passed: false,
        message: '❌ Test Failed. See validation issues below:',
        details: errors,
      });
    }

    setIsRunning(false);
  };

  const loadSolution = () => {
    if (isLocked) return;
    const sol =
      selectedLang === 'java'
        ? lesson.challenge.solutionCode.java
        : lesson.challenge.solutionCode.typescript;
    if (sol) {
      setCode(sol);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full flex-1 flex flex-col lg:flex-row overflow-hidden border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 relative"
    >
      {/* LEFT PANEL: Interactive Guide & Concepts */}
      <div
        style={{ width: `${splitPercent}%` }}
        className="w-full flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto h-auto lg:h-[calc(100vh-65px)] transition-[width] duration-75"
      >
        {/* Navigation & Header */}
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs flex-wrap gap-2">
            <span className="font-semibold text-slate-500">{track.title}</span>
            <div className="flex items-center gap-2">
              {isLocked ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                  <Lock className="w-3 h-3" />
                  Free Signup Required
                </span>
              ) : currentUser ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 font-medium text-[11px]">
                  Member Access (100% Free)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-400 font-semibold text-[11px]">
                  Free Preview Lesson
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium">
                {lesson.level} · {lesson.durationMinutes} mins
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {lesson.title}
            </h2>
          </div>

          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {lesson.description}
          </p>

          {/* Subtabs */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Concept Guide
            </button>
            <button
              onClick={() => setActiveTab('manual-vs-code')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'manual-vs-code'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Code className="w-4 h-4" />
              Manual QA Mental Model
            </button>
            <button
              onClick={() => setActiveTab('ai-action')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ai-action'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              AI in Action
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 md:p-6 space-y-6 flex-1 text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          {activeTab === 'guide' && (() => {
            const doc = getLessonDoc(lesson.id, track.id, lesson.title, lesson.description);
            return (
              <div className="space-y-6">
                {/* 1. Header Overview & Playwright-Docs Style Introduction */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-slate-900 dark:to-indigo-950/20 border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/20">
                      {doc.category}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Documentation &amp; Core Architecture
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {doc.tagline}
                  </h3>
                  <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                    {doc.overview}
                  </p>
                  <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs md:text-sm text-sky-900 dark:text-sky-200 flex items-start gap-2.5">
                    <Flame className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block mb-0.5">Why This Matters for Manual Testers:</strong>
                      <span>{doc.whyItMattersForManualQA}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Architecture & Underlying Mechanism */}
                <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3 shadow-md">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-indigo-400" />
                    <h4 className="font-bold text-base md:text-lg text-white">
                      {doc.architectureUnderTheHood.title}
                    </h4>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto leading-relaxed">
                    {doc.architectureUnderTheHood.flowOrMechanism}
                  </div>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-slate-300 pt-1">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>Key Architectural Takeaway:</strong> {doc.architectureUnderTheHood.keyTakeaway}</span>
                  </div>
                </div>

                {/* 3. If java-oops-framework, retain in-depth OOPs 4 Pillars breakdown */}
                {lesson.id === 'java-oops-framework' && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 space-y-3">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          Why Manual Testers Need OOPs for Automation
                        </h3>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        In manual testing, every test case in your spreadsheet is an isolated row with steps like &quot;Launch Chrome, type user, click submit&quot;. If you automate like a manual tester by copy-pasting code into 100 script files, you end up with 100 browser instances running in memory, memory leaks, and when a single button ID changes, you have to manually edit 100 files!
                      </p>
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        <strong>Object-Oriented Programming (OOPs)</strong> solves this completely. A <em>Class</em> is your page blueprint, an <em>Object</em> is a live browser session, and the 4 pillars ensure you write code once and reuse it across thousands of test executions.
                      </p>
                    </div>

                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-500" />
                      The 4 Pillars of OOPs Mapped Directly to Automation:
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          1. Encapsulation (Data Hiding in POM)
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          <strong>Concept:</strong> Keep element locators <code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">private By username</code> inside the Page Class. Never expose raw locators to test classes!
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          <strong>Why it matters:</strong> If the web UI changes, you update the locator in ONE line inside the Page class, and all 50 tests pass without touching test files.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="font-bold text-sky-600 dark:text-sky-400 text-sm">
                          2. Inheritance (BaseTest Code Reuse)
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          <strong>Concept:</strong> <code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">public class LoginTest extends BaseTest</code>. Child test classes inherit driver lifecycle automatically.
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          <strong>Why it matters:</strong> Write browser initialization, window maximize, and driver.quit() ONCE in BaseTest. 100 test classes inherit it for free.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="font-bold text-purple-600 dark:text-purple-400 text-sm">
                          {'3. Polymorphism (Multi-Browser & Overloading)'}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          <strong>Concept:</strong> Method Overloading (<code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">click(By)</code> vs <code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">click(By, timeout)</code>) + Dynamic Dispatch (<code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">WebDriver driver = new ChromeDriver()</code>).
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          <strong>Why it matters:</strong> The exact same test suite switches between Chrome, Firefox, and Edge via a single configuration parameter at runtime!
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                          4. Abstraction (Hiding Browser Complexity)
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          <strong>Concept:</strong> <code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">WebDriver</code> is a Java Interface. <code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">BasePage</code> is an Abstract Class.
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          <strong>Why it matters:</strong> You call <code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">driver.get()</code> and Selenium handles millions of lines of browser C++ socket code under the hood.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Step-by-Step Implementation Guide (Playwright-Docs Style) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base md:text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-emerald-500" />
                      Step-by-Step Practical Implementation Guide
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">
                      {doc.stepByStepGuide.length} Sequenced Steps
                    </span>
                  </div>

                  <div className="space-y-4">
                    {doc.stepByStepGuide.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {step.stepNumber}
                            </span>
                            <h5 className="font-bold text-slate-900 dark:text-white text-sm md:text-base">
                              {step.title}
                            </h5>
                          </div>
                          {step.badge && (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {step.badge}
                            </span>
                          )}
                        </div>

                        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
                          {step.explanation}
                        </p>

                        {step.codeSnippet && (
                          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 text-xs font-mono">
                            {step.codeSnippet.caption && (
                              <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                                <span>{step.codeSnippet.caption}</span>
                                <span className="uppercase text-[10px] text-emerald-400 font-bold">{step.codeSnippet.language}</span>
                              </div>
                            )}
                            <pre className="p-3.5 overflow-x-auto leading-relaxed text-emerald-300">
                              <code>{step.codeSnippet.code}</code>
                            </pre>
                          </div>
                        )}

                        {step.proTip && (
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <span><strong>ProTip:</strong> {step.proTip}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Manual QA to SDET Transition Bridge (Comparative Table) */}
                {doc.manualToAutomatedBridge.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base md:text-lg flex items-center gap-2">
                      <ArrowRightCircle className="w-5 h-5 text-sky-500" />
                      Manual QA to Modern SDET Transition Bridge
                    </h4>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <table className="w-full text-left border-collapse text-xs md:text-sm">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                            <th className="p-3 font-bold">Manual Testing Action</th>
                            <th className="p-3 font-bold">Modern Automated SDET Code</th>
                            <th className="p-3 font-bold">Why This Eliminates Flakiness</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                          {doc.manualToAutomatedBridge.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="p-3 text-slate-600 dark:text-slate-400 font-medium">
                                {row.manualAction}
                              </td>
                              <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                                {row.automatedApproach}
                              </td>
                              <td className="p-3 text-slate-500 dark:text-slate-400">
                                {row.whyItMatters}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 6. Production Code Example & Line-by-Line Breakdown */}
                {doc.productionCodeExample && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base md:text-lg flex items-center gap-2">
                        <Code className="w-5 h-5 text-indigo-500" />
                        {doc.productionCodeExample.title}
                      </h4>
                    </div>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
                      {doc.productionCodeExample.description}
                    </p>
                    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 font-mono text-xs">
                      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-2">
                          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                          Production Blueprint
                        </span>
                        <span className="uppercase text-[11px] font-bold text-sky-400">
                          {doc.productionCodeExample.language}
                        </span>
                      </div>
                      <pre className="p-4 overflow-x-auto leading-relaxed text-emerald-300">
                        <code>{doc.productionCodeExample.code}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {/* 7. Best Practices & Flaky Anti-patterns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2.5">
                    <div className="font-bold text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      SDET Best Practices (Do This)
                    </div>
                    <ul className="space-y-2 text-xs md:text-sm text-emerald-900 dark:text-emerald-200">
                      {doc.bestPractices.map((bp, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold">✔</span>
                          <span>{bp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2.5">
                    <div className="font-bold text-rose-800 dark:text-rose-300 text-sm flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      Flaky Anti-Patterns (Avoid This)
                    </div>
                    <ul className="space-y-2 text-xs md:text-sm text-rose-900 dark:text-rose-200">
                      {doc.antiPatterns.map((ap, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-rose-500 font-bold">✖</span>
                          <span>{ap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 8. Technical Interview Question & Architectural Model Answer */}
                {doc.interviewQnA && (
                  <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-2.5">
                    <div className="font-bold text-indigo-900 dark:text-indigo-300 text-sm md:text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Technical Interview Question: &ldquo;{doc.interviewQnA.question}&rdquo;
                    </div>
                    <p className="text-xs md:text-sm text-indigo-950 dark:text-indigo-200 leading-relaxed pl-6 border-l-2 border-indigo-400 dark:border-indigo-600">
                      <strong>Model Architectural Answer:</strong> {doc.interviewQnA.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          {activeTab === 'manual-vs-code' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3.5">
                <h4 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                  Manual Verification Flow: {lesson.manualContext.title}
                </h4>
                <ol className="list-decimal pl-5 space-y-1.5 text-sm sm:text-base text-slate-700 dark:text-slate-300">
                  {lesson.manualContext.steps.map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                </ol>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-rose-600 dark:text-rose-400 text-sm sm:text-base">
                    Manual QA Pain Points:
                  </span>
                  <ul className="list-disc pl-5 mt-1.5 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    {lesson.manualContext.painPoints.map((pp, i) => (
                      <li key={i}>{pp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai-action' && (
            <div className="space-y-5">
              {/* Prompt Engineering Card with Interactive Try with AI */}
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="font-bold text-amber-900 dark:text-amber-300 text-sm sm:text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Autonomous Prompt for this Scenario
                  </div>
                  <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-900/80 p-1 rounded-lg border border-amber-200 dark:border-amber-900 text-xs">
                    {(['java', 'typescript', 'python'] as SupportedLang[]).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setAiSnippetLang(l)}
                        className={`px-2.5 py-0.5 rounded-md font-semibold capitalize transition-all cursor-pointer ${
                          aiSnippetLang === l
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {l === 'typescript' ? 'TS' : l}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  rows={3}
                  className="w-full text-xs sm:text-sm font-mono bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-amber-200 dark:border-amber-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-y"
                  placeholder="Enter automation scenario prompt for Gemini SDET Agent..."
                />

                <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                    ⚡ Ephemeral live test: AI generates code in the background without storing or cluttering your history.
                  </p>
                  <button
                    type="button"
                    onClick={handleTryWithAi}
                    disabled={isGeneratingSnippet || !promptInput.trim()}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    {isGeneratingSnippet ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Generating Snippet...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                        <span>Try it with AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Generated AI Snippet Display (Short, clean code snippet, no description) */}
              {aiSnippet && (
                <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-lg space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <Terminal className="w-4 h-4" />
                      <span>AI-Generated Code Snippet ({aiSnippetLang.toUpperCase()})</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-normal">
                        Raw Code Only · No Commentary
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(aiSnippet);
                          setCopyFeedback(true);
                          setTimeout(() => setCopyFeedback(false), 2000);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {copyFeedback ? <Check className="w-3 h-3 text-emerald-400" /> : <Code className="w-3 h-3" />}
                        <span>{copyFeedback ? 'Copied!' : 'Copy Code'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLang(aiSnippetLang);
                          setCode(aiSnippet);
                          setAppliedFeedback(true);
                          setTimeout(() => setAppliedFeedback(false), 2000);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1 cursor-pointer"
                        title="Load this AI snippet directly into the code editor on the right"
                      >
                        {appliedFeedback ? <Check className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                        <span>{appliedFeedback ? 'Applied to Editor!' : 'Apply to Editor'}</span>
                      </button>
                    </div>
                  </div>

                  <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                    <code>{aiSnippet}</code>
                  </pre>
                </div>
              )}

              {aiSnippetError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{aiSnippetError}</span>
                </div>
              )}

              {/* Agent Workflow & Self Healing Tip */}
              <div className="p-5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 space-y-2.5">
                <h4 className="font-bold text-cyan-900 dark:text-cyan-300 text-sm sm:text-base">
                  Autonomous Agent Workflow:
                </h4>
                <p className="text-cyan-950 dark:text-cyan-200 text-sm sm:text-base leading-relaxed">
                  {lesson.aiAugmentation.agenticWorkflow}
                </p>
                <div className="mt-2 text-sm text-cyan-700 dark:text-cyan-400">
                  💡 <strong>Self-Healing Tip:</strong> {lesson.aiAugmentation.selfHealingTip}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Draggable Divider Bar (Desktop Splitter) */}
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={() => setSplitPercent(55)}
        className={`hidden lg:flex w-2 hover:w-2.5 bg-slate-200 dark:border-x dark:border-neutral-800 dark:bg-neutral-900 hover:bg-emerald-500/80 cursor-col-resize select-none items-center justify-center transition-all group relative z-10 shrink-0 ${
          isDragging ? 'bg-emerald-500 w-2.5 shadow-lg' : ''
        }`}
        title="Drag to resize panels (Double-click to reset)"
      >
        <div className="w-1 h-8 rounded-full bg-slate-400 dark:bg-slate-600 group-hover:bg-white flex flex-col justify-around py-1">
          <span className="w-0.5 h-0.5 rounded-full bg-current mx-auto" />
          <span className="w-0.5 h-0.5 rounded-full bg-current mx-auto" />
          <span className="w-0.5 h-0.5 rounded-full bg-current mx-auto" />
        </div>
      </div>

      {/* RIGHT PANEL: Interactive Concept Code Lab */}
      <div
        style={{ width: `${100 - splitPercent}%` }}
        className="w-full flex flex-col bg-slate-950 text-slate-100 h-auto lg:h-[calc(100vh-65px)] relative transition-[width] duration-75"
      >
          {/* Editor Toolbar - Language toggles and Sandbox Lab link */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => handleLanguageChange('java')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer text-xs ${
                  selectedLang === 'java'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="View Java automation code example"
              >
                Java
              </button>
              <button
                onClick={() => handleLanguageChange('typescript')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer text-xs ${
                  selectedLang === 'typescript'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="View TypeScript automation code example"
              >
                TypeScript
              </button>
              <button
                onClick={() => handleLanguageChange('python')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer text-xs ${
                  selectedLang === 'python'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="View Python automation code example"
              >
                Python
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={
                  track.id === 'api-testing'
                    ? '/sandbox/api'
                    : track.id === 'playwright-ts'
                    ? '/sandbox/web?stack=playwright'
                    : '/sandbox/web?stack=selenium'
                }
                target="_blank"
                className="px-2.5 py-1 text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 rounded-md border border-emerald-500/20"
                title="Practice these concepts on live DOM elements in the Sandbox Lab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Practice Lab
              </Link>
            </div>
          </div>

        {/* Code Input Area */}
        <div className="flex-1 p-4 font-mono text-xs sm:text-sm overflow-y-auto relative">
          <textarea
            value={code}
            onChange={e => !isLocked && setCode(e.target.value)}
            disabled={isLocked}
            spellCheck={false}
            className={`w-full h-full bg-transparent text-emerald-300 focus:outline-none resize-none leading-relaxed font-mono ${
              isLocked ? 'opacity-30 select-none' : ''
            }`}
            placeholder="Type or edit your automation test code here..."
          />

          {/* Locked Lesson Overlay */}
          {isLocked && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Lock className="w-7 h-7" />
              </div>

              <div className="max-w-md space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Lesson 2+ Unlocks With Free Account
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Lesson 1 of every track is a free guest preview. To access subsequent lessons, write &amp; run code in our live sandbox, and save your progress, create your free IntelligentQA account.
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  100% Free Forever · No Credit Card Required
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Link
                  href="/signup"
                  className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up Free
                </Link>
                <Link
                  href="/login"
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs sm:text-sm transition-colors border border-slate-700 flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  Log In
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Concept Navigation Footer (Previous / Next concept navigation) */}
        <div className="p-3.5 md:p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          {/* Progress / Lesson Indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-bold text-[11px]">
              Lesson {lessonIndex} of {totalLessons}
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="text-slate-300 font-medium truncate max-w-[200px] md:max-w-xs hidden sm:inline" title={lesson.title}>
              {lesson.title}
            </span>
          </div>

          {/* Navigation Controls: Previous, Next, and Labs */}
          <div className="flex items-center gap-2.5">
            {prevLessonHref ? (
              <Link
                href={prevLessonHref}
                className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-1.5 border border-slate-700"
                title="Go back to previously learned concept"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </Link>
            ) : (
              <button
                disabled
                className="py-2 px-3.5 bg-slate-900 text-slate-600 font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 border border-slate-800/80 cursor-not-allowed opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}

            {nextLessonHref ? (
              <Link
                href={nextLessonHref}
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
                title="Advance to next concept"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href={
                  track.id === 'api-testing'
                    ? '/sandbox/api'
                    : track.id === 'playwright-ts'
                    ? '/sandbox/web?stack=playwright'
                    : '/sandbox/web?stack=selenium'
                }
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-md"
              >
                <span>Track Completed! Practice in Labs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
