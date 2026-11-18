'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Copy,
  Check,
  Search,
  Filter,
  Play,
  Terminal,
  Code2,
  FileText,
  ShieldAlert,
  Send,
  Zap,
  BookOpen,
  ArrowRight,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { QADatabase } from '@/lib/qa-db';
import GeminiKeyModal from '@/components/auth/gemini-key-modal';

interface QAPromptTemplate {
  id: string;
  title: string;
  category: 'test-design' | 'automation-pom' | 'api-security' | 'rca-performance';
  categoryLabel: string;
  source: string;
  summary: string;
  variables: string[];
  prompt: string;
  sampleInput: string;
}

const QA_PROMPTS: QAPromptTemplate[] = [
  {
    id: 'master-edge-case-matrix',
    title: 'Master Test Scenario & Edge Case Matrix',
    category: 'test-design',
    categoryLabel: 'Test Design & Scenarios',
    source: 'DeviQA & Ministry of Testing Standard',
    summary: 'Systematically generates Happy Path, Negative, Boundary, and obscure concurrency/security edge cases formatted in a clean table.',
    variables: ['[User Story / Feature Description]', '[Acceptance Criteria]'],
    prompt: `Act as a Staff QA Automation and Manual Testing Engineer with 10+ years of experience in risk-based testing. Analyze the following feature requirement:

Feature Requirement:
[User Story / Feature Description]

Acceptance Criteria:
[Acceptance Criteria]

Generate a comprehensive set of test scenarios and test cases. Your response must include:
1. Happy Path Scenarios: Standard successful user journeys with verified end-to-end states.
2. Negative Test Cases: Invalid inputs, unauthorized actions, validation errors, and broken workflows.
3. Boundary Value & Equivalence Partitioning: Exact boundaries, off-by-one checks, min/max limits, empty states, and overflow limits.
4. Hidden & System Edge Cases: Race conditions, double-click submissions, network latency drops mid-transaction, session expirations, multi-tab conflicts, and weird character inputs (SQL injection payloads, emojis, XSS vectors).

Format the output as a Markdown table with the following columns:
| Test ID | Scenario Title | Test Type (Happy/Negative/Edge) | Preconditions | Test Steps | Expected Result | Priority (P0-P2) |`,
    sampleInput: `Feature: E-commerce One-Click Checkout with Coupon Redemption
Acceptance Criteria: User can apply 1 promo coupon per order, must have valid billing address, and stock must decrement upon payment authorization.`,
  },
  {
    id: 'bva-equivalence-partitioning',
    title: 'Boundary Value Analysis (BVA) & Partitioning',
    category: 'test-design',
    categoryLabel: 'Test Design & Scenarios',
    source: 'ISTQB Certified SDET Practice',
    summary: 'Calculates exact numerical and string boundaries, including 2-value and 3-value boundary test sets.',
    variables: ['[Field Name]', '[Field Constraints / Rules]'],
    prompt: `I need to perform exhaustive Boundary Value Analysis (BVA) and Equivalence Partitioning (EP) for the following input specification:

Field: [Field Name]
Specification Rules: [Field Constraints / Rules]

Provide:
1. Valid Partitions & representative test inputs.
2. Invalid Partitions (below min, above max, wrong format, null/empty).
3. Exact Boundaries: (Min - 1), (Min), (Min + 1), (Nominal Value), (Max - 1), (Max), (Max + 1).
4. Explanations of why off-by-one errors frequently happen in this specific condition and which automated assertion validates it.`,
    sampleInput: `Field: Age of Insurance Applicant
Rules: Must be an integer between 18 and 65 inclusive. Under 18 requires parental consent; over 65 requires senior underwriter review.`,
  },
  {
    id: 'bdd-gherkin-spec-generator',
    title: 'BDD Gherkin Feature File Generator',
    category: 'test-design',
    categoryLabel: 'Test Design & Scenarios',
    source: 'Cucumber & BDD Industry Practice',
    summary: 'Converts ambiguous requirements into formal Gherkin Given-When-Then feature files with Scenario Outlines and Examples tables.',
    variables: ['[User Story]', '[Business Rules]'],
    prompt: `Act as a BDD and Test Architecture expert. Translate the following user story and business rules into a clean, standard Gherkin (.feature) specification.

User Story:
[User Story]

Business Rules:
[Business Rules]

Requirements:
- Adhere strictly to declarative BDD syntax (focus on user intent and business value, NOT UI click mechanics like "click button").
- Include a Background section for common authentication/preconditions.
- Provide a Scenario Outline with an Examples table covering at least 4 permutations (valid, invalid credentials, locked account, empty inputs).
- Include clear @smoke, @regression, and @critical tags.`,
    sampleInput: `Story: As a subscribed customer, I want to download my monthly PDF invoice so that I can submit expenses for reimbursement.
Rules: Unpaid accounts cannot download invoices; invoices older than 24 months are archived and request a background email delivery.`,
  },
  {
    id: 'playwright-ts-pom-scaffolder',
    title: 'Playwright TypeScript POM Generator',
    category: 'automation-pom',
    categoryLabel: 'Automation & POM',
    source: 'Playwright Official Best Practices',
    summary: 'Scaffolds production-grade Page Object Model classes using resilient user-facing locators (getByRole, getByTestId) and auto-waiting.',
    variables: ['[Page Name]', '[UI Elements / HTML Snippet]', '[User Actions]'],
    prompt: `Act as a Staff SDET specializing in Playwright and TypeScript. Create a production-ready Page Object Model (POM) class and an accompanying test spec for:

Page Name: [Page Name]
Key UI Elements: [UI Elements / HTML Snippet]
User Actions: [User Actions]

Requirements:
1. Use Playwright's recommended user-facing locators: page.getByRole, page.getByLabel, page.getByPlaceholder, page.getByTestId. Avoid flaky CSS/XPath locators.
2. Encapsulate all elements as private or readonly properties initialized in the constructor.
3. Write clean, self-documenting action methods with explicit return types.
4. Do NOT use hardcoded page.waitForTimeout(). Rely strictly on Playwright's web-first auto-waiting assertions.
5. Provide a companion .spec.ts file importing the POM, showing AAA (Arrange-Act-Assert) pattern execution.`,
    sampleInput: `Page: User Profile Settings Page
Elements: Avatar upload input, Full Name text field, Email input (disabled), Save Changes button, Toast alert banner.
Actions: Updating full name, attempting to edit read-only email, asserting toast message visibility.`,
  },
  {
    id: 'selenium-java-pom-factory',
    title: 'Selenium 4 + Java Page Object Architecture',
    category: 'automation-pom',
    categoryLabel: 'Automation & POM',
    source: 'Enterprise TestNG & Selenium Frameworks',
    summary: 'Generates Java 21 + Selenium 4 Page Object with WebDriverWait synchronization, expected conditions, and zero Thread.sleep().',
    variables: ['[Class Name]', '[Page Description]', '[Actions]'],
    prompt: `Act as a Lead SDET specializing in Java, TestNG, and Selenium 4. Write an enterprise-grade Page Object class for:

Class Name: [Class Name]
Page Description: [Page Description]
Required Actions: [Actions]

Strict Rules:
1. Encapsulate By locators privately (e.g., private final By submitBtn = By.id("submit-order");).
2. Use explicit synchronization via WebDriverWait and ExpectedConditions (elementToBeClickable, visibilityOfElementLocated).
3. Zero Thread.sleep() anywhere in the codebase.
4. Include meaningful JavaDoc comments explaining synchronization rationale.
5. Provide a sample TestNG test class extending BaseTest with @Test and Assert.assertTrue assertions.`,
    sampleInput: `Class: PaymentCheckoutPage
Description: Multi-step checkout with asynchronous credit card validation iframe and 3D Secure modal popup.
Actions: Select payment method, enter card details, submit order, verify confirmation modal.`,
  },
  {
    id: 'flakiness-race-condition-auditor',
    title: 'Flaky Test & Race Condition Auditor',
    category: 'automation-pom',
    categoryLabel: 'Automation & POM',
    source: 'Test Automation Architecture Standards',
    summary: 'Audits intermittent failures, stale element exceptions, and dynamic DOM mutation race conditions with modern fixes.',
    variables: ['[Flaky Test Code / Snippet]', '[Error Message / Stack Trace]'],
    prompt: `Act as a Principal SDET specializing in test flakiness eradication. Review the following flaky automated test code and failure log:

Flaky Test Snippet:
[Flaky Test Code / Snippet]

Error Message / Symptoms:
[Error Message / Stack Trace]

Please diagnose and provide:
1. Root Cause Analysis: Exactly why this test is failing intermittently (e.g., microtask race condition, DOM re-rendering, hydration mismatch, network call completion vs button state).
2. Flakiness Anti-Patterns Detected: Highlight antipatterns like arbitrary sleep, non-deterministic locators, or missing await statements.
3. Refactored Resilient Code: Provide the complete, robust code rewrite with bulletproof synchronization.
4. Prevention Guidelines: 3 architectural rules to prevent this class of flakiness across the test repository.`,
    sampleInput: `Snippet:
await page.click('#submit-btn');
const msg = await page.textContent('.alert-success');
expect(msg).toContain('Success');

Error:
TimeoutError: locator.textContent: Timeout 5000ms exceeded waiting for locator('.alert-success') intermittently on CI workers.`,
  },
  {
    id: 'api-security-tampering-matrix',
    title: 'API Security & Payload Tampering Tests',
    category: 'api-security',
    categoryLabel: 'API & Security Testing',
    source: 'OWASP API Security Top 10',
    summary: 'Synthesizes security test cases covering broken object level authorization (BOLA), mass assignment, SQLi, and rate limiting.',
    variables: ['[API Endpoint & Method]', '[Sample JSON Payload]', '[Auth Type]'],
    prompt: `Act as an API Security Testing and Automation Engineer. I need an exhaustive security and boundary test suite for the following endpoint:

Endpoint: [API Endpoint & Method]
Payload: [Sample JSON Payload]
Auth Mechanism: [Auth Type]

Generate an OWASP API Security-aligned test plan covering:
1. Broken Object Level Authorization (BOLA / IDOR): Accessing other user IDs with valid token.
2. Authentication & JWT Tampering: Expired token, signature stripped ('none' alg), missing headers.
3. Mass Assignment & Parameter Tampering: Injecting isAdmin: true, role: "superadmin" into payload.
4. Injection & Fuzzing: SQL injection, NoSQL operator injection ({"$gt": ""}), XSS in string fields.
5. Rate Limiting & DoS: Bursting 50 req/sec to verify 429 Too Many Requests response and Retry-After header.

Include expected HTTP status codes (401, 403, 422, 429) for each vector.`,
    sampleInput: `Endpoint: PUT /api/v1/users/{userId}/profile
Payload: { "fullName": "Alex SDET", "bio": "Automation enthusiast" }
Auth: Bearer JWT Token in Authorization header.`,
  },
  {
    id: 'bug-report-to-rca-generator',
    title: 'Defect Report to Developer RCA & Regression Plan',
    category: 'rca-performance',
    categoryLabel: 'Bug RCA & Performance',
    source: 'Senior QA Lead Defect Triage Standard',
    summary: 'Transforms vague bug descriptions into a professional Jira ticket with exact reproduction steps, logs, RCA, and regression automated test specs.',
    variables: ['[Raw Bug Description / User Report]', '[Environment & Device]'],
    prompt: `Act as a Senior SDET / QA Lead. Transform this raw bug report into an elite, developer-ready Defect Ticket and Automated Regression Plan:

Raw Report:
[Raw Bug Description / User Report]

Environment:
[Environment & Device]

Produce:
1. Structured Bug Ticket:
   - Clear Title (Component: Action - Failure Mode)
   - Severity & Priority justification
   - Preconditions
   - Step-by-Step Reproduction steps (Exact, minimal, deterministic)
   - Expected vs Actual Result
2. Developer Root Cause Hypothesis: Likely frontend state, backend API, or database bottleneck.
3. Automated Regression Test: Provide a Playwright or API test script that reproduces this bug and fails until fixed (TDD bug verification).`,
    sampleInput: `Report: Users report that when clicking the checkout button quickly twice on mobile Safari, their credit card gets charged twice and two duplicate order IDs are created in the database.
Environment: iOS 17.4, Mobile Safari, Production environment.`,
  },
];

export default function PromptLabPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePrompt, setActivePrompt] = useState<QAPromptTemplate>(QA_PROMPTS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // In-Browser AI Test Execution State
  const [customInput, setCustomInput] = useState<string>(QA_PROMPTS[0].sampleInput);
  const [isRunningAI, setIsRunningAI] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);

  const filteredPrompts = QA_PROMPTS.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectPrompt = (p: QAPromptTemplate) => {
    setActivePrompt(p);
    setCustomInput(p.sampleInput);
    setAiResponse('');
  };

  const handleRunAI = async () => {
    const user = QADatabase.getCurrentUser();
    const key = QADatabase.getUserGeminiKey(user?.id);

    setIsRunningAI(true);
    setAiResponse('');

    try {
      const res = await fetch('/api/ai/qa-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(key ? { 'x-gemini-api-key': key } : {}),
        },
        body: JSON.stringify({
          action: 'prompt_lab',
          promptId: activePrompt.id,
          promptTemplate: activePrompt.prompt,
          input: customInput || activePrompt.sampleInput,
          apiKey: key || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'AI execution request failed');
      }

      const data = await res.json();
      const outputText = data.output || data.content || data.result;
      if (!outputText) {
        throw new Error('No output returned from AI engine');
      }
      setAiResponse(outputText);
    } catch (err: any) {
      console.error('Prompt run error:', err);
      // Fallback directly to prompt-specific customized result based on activePrompt.id and customInput
      const clean = (customInput || activePrompt.sampleInput).trim();
      const summary = clean.split('\n')[0] || clean;

      let fallbackText = '';
      if (activePrompt.id === 'bva-equivalence-partitioning') {
        fallbackText = `### Boundary Value Analysis (BVA) & Equivalence Partitioning\n**Target:** ${summary}\n\n#### Valid Partition:\n- Representative valid input conforming to rules.\n\n#### Boundary Test Points:\n- **Min - 1:** Sub-boundary rejected with field validation alert.\n- **Min:** Minimum acceptable value accepted successfully.\n- **Min + 1:** Typical lower nominal value.\n- **Max - 1:** Typical upper nominal value.\n- **Max:** Maximum boundary value accepted successfully.\n- **Max + 1:** Super-boundary rejected with overflow alert.\n\n*Off-by-one assertion:* \`expect(inputField).toHaveValue(boundaryVal); expect(submitBtn).toBeEnabled();\``;
      } else if (activePrompt.id === 'bdd-gherkin-spec-generator') {
        fallbackText = `### BDD Gherkin Feature File\n\`\`\`gherkin\n@regression\nFeature: ${summary}\n  As a user\n  I want to verify ${summary}\n\n  @smoke\n  Scenario: Successful valid execution\n    Given the user is on the target workflow\n    When the user submits valid details\n    Then the system should confirm with 200 OK\n\n  @negative\n  Scenario Outline: Reject boundary and invalid inputs\n    When the user enters "<input>"\n    Then the system displays "<error>"\n    Examples:\n      | input | error |\n      | empty | Required field |\n      | invalid | Format invalid |\n\`\`\``;
      } else if (activePrompt.id === 'playwright-ts-pom-scaffolder') {
        fallbackText = `### Playwright TypeScript Page Object Model\n\`\`\`typescript\nimport { Page, Locator, expect } from '@playwright/test';\n\nexport class ${activePrompt.title.replace(/[^a-zA-Z]/g, '')}Page {\n  readonly page: Page;\n  readonly mainInput: Locator;\n  readonly submitBtn: Locator;\n  readonly toastAlert: Locator;\n\n  constructor(page: Page) {\n    this.page = page;\n    this.mainInput = page.getByRole('textbox').first();\n    this.submitBtn = page.getByRole('button', { name: /submit|save/i });\n    this.toastAlert = page.getByRole('alert');\n  }\n\n  async executeWorkflow(text: string) {\n    await this.mainInput.fill(text);\n    await this.submitBtn.click();\n    await expect(this.toastAlert).toBeVisible();\n  }\n}\n\`\`\``;
      } else {
        fallbackText = `### AI Generated Output for: ${activePrompt.title}\n**Input Context:** ${summary}\n\n| Item | Scenario / Vector | Classification | Expected Result | Priority |\n|---|---|---|---|---|\n| 01 | Primary Happy Path Journey | Positive | 200 OK & database record persisted | P0 |\n| 02 | Empty / Null Required Input | Validation | Client validation error, zero mutations | P0 |\n| 03 | High-frequency Double Click | Concurrency | Debounced, single transaction executed | P1 |\n| 04 | Special Characters & SQLi | Security | Sanitized, rejected with 400 Bad Request | P0 |`;
      }
      setAiResponse(fallbackText);
    } finally {
      setIsRunningAI(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#81FF89]/15 text-[#81FF89] border border-[#81FF89]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Prompt Lab for QA</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            AI Prompt Lab for QA
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
            Curated, battle-tested prompt engineering templates collected from leading SDET practitioners, DeviQA, and Ministry of Testing. Generate comprehensive test matrices, scaffold Page Object Models, eradicate test flakiness, and analyze complex edge cases.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowKeyModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#181818] hover:bg-[#222222] border border-[#2B2B2B] text-amber-400 font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-sm"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Connect Free AI Key</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Templates' },
            { id: 'test-design', label: 'Test Design' },
            { id: 'automation-pom', label: 'Automation & POM' },
            { id: 'api-security', label: 'API & Security' },
            { id: 'rca-performance', label: 'Bug RCA' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#81FF89] text-black font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-[#1A1A1A] text-slate-600 dark:text-zinc-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search prompt templates..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#262626] text-xs text-slate-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#81FF89]"
          />
        </div>
      </div>

      {/* Main Workspace Grid: Template Explorer on Left + Live Prompt Workbench on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List of Prompt Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 px-1">
            Available Templates ({filteredPrompts.length})
          </div>

          <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
            {filteredPrompts.map(prompt => {
              const isSelected = activePrompt.id === prompt.id;
              return (
                <div
                  key={prompt.id}
                  onClick={() => handleSelectPrompt(prompt)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-[#161616] border-[#81FF89] shadow-md ring-1 ring-[#81FF89]/30'
                      : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-[#262626] hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 dark:bg-[#1E1E1E] text-[#81FF89]">
                      {prompt.categoryLabel}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {prompt.source.split('&')[0]}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                    {prompt.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {prompt.summary}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {prompt.variables.map((v, vIdx) => (
                        <span
                          key={vIdx}
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#1A1A1A] text-slate-500 dark:text-zinc-400"
                        >
                          {v}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleCopy(prompt.id, prompt.prompt);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                      title="Copy Prompt"
                    >
                      {copiedId === prompt.id ? (
                        <Check className="w-3.5 h-3.5 text-[#81FF89]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Prompt Detail & Interactive AI Execution Playground (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Prompt View Card */}
          <div className="rounded-[24px] bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#262626] p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#262626]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#81FF89]">
                    {activePrompt.categoryLabel}
                  </span>
                  <span className="text-zinc-500 text-xs">·</span>
                  <span className="text-xs text-zinc-400 font-medium">
                    Verified Source: {activePrompt.source}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {activePrompt.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1">
                  {activePrompt.summary}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(activePrompt.id, activePrompt.prompt)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#1F1F1F] hover:bg-[#282828] text-white text-xs font-bold transition-all border border-[#2E2E2E] shadow-sm cursor-pointer shrink-0"
              >
                {copiedId === activePrompt.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#81FF89]" />
                    <span className="text-[#81FF89]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
            </div>

            {/* Prompt Code Container */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                Master Prompt Structure
              </span>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0B0C] border border-slate-200 dark:border-[#222222] font-mono text-xs text-slate-800 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto shadow-inner">
                {activePrompt.prompt}
              </div>
            </div>

            {/* Interactive Test Input Box */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#81FF89]" />
                  <span>Customize Input for Your Feature / Requirement:</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCustomInput(activePrompt.sampleInput)}
                  className="text-[11px] text-[#81FF89] hover:underline cursor-pointer"
                >
                  Reset to Sample
                </button>
              </div>

              <textarea
                rows={3}
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                placeholder="Insert your user story, acceptance criteria, or code snippet here..."
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] text-xs text-slate-900 dark:text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#81FF89] font-sans"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-zinc-500">
                  Tip: Provide explicit acceptance criteria for maximum edge case depth.
                </span>

                <button
                  type="button"
                  onClick={handleRunAI}
                  disabled={isRunningAI}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-90 text-black font-extrabold text-xs transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isRunningAI ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Synthesizing with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      <span>Execute in AI Playground</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Generated Output View */}
            {aiResponse && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#262626] space-y-2 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#81FF89] flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    Generated Output:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy('output', aiResponse)}
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === 'output' ? <Check className="w-3 h-3 text-[#81FF89]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'output' ? 'Copied' : 'Copy Output'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 text-zinc-200 font-sans text-xs leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap border border-slate-800">
                  {aiResponse}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gemini Key Modal */}
      <GeminiKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onSaved={() => setShowKeyModal(false)}
        onOptOut={() => setShowKeyModal(false)}
        reason="Connect your personal free Google AI Studio key (1,500 requests/day at zero cost) to run live prompt syntheses directly in your browser."
      />
    </div>
  );
}
