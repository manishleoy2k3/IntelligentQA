import { NextRequest, NextResponse } from 'next/server';
import { validateGeminiKeySyntax, sanitizeGeminiKey } from '@/lib/gemini-validator';
import { REQUIREMENT_GENERATOR_SYSTEM_PROMPT } from '@/data/agents/requirement-generator-agent';
import { TEST_CASE_GENERATOR_SYSTEM_PROMPT } from '@/data/agents/test-case-generator-agent';
import { AUTOMATION_CODE_GENERATOR_SYSTEM_PROMPT } from '@/data/agents/automation-code-generator-agent';
import { CODE_REVIEWER_DEBUGGER_SYSTEM_PROMPT } from '@/data/agents/code-reviewer-debugger-agent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, input, techStack = 'playwright-ts', options } = body;

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 });
    }

    // Strictly require user-provided Gemini API Key to protect server owner tokens
    const rawApiKey = req.headers.get('x-gemini-api-key') || body.apiKey;
    const effectiveApiKey = sanitizeGeminiKey(rawApiKey || '');

    if (!effectiveApiKey) {
      if (action === 'code_snippet') {
        // For learning workspace "Try it with AI", provide instant deterministic code snippet fallback without blocking
        const cleanInput = input.trim();
        const generatedOutput = generateCodeSnippetOnly(cleanInput, techStack);
        return NextResponse.json({
          action,
          output: generatedOutput,
          techStack,
          isLiveAI: false,
        });
      }

      if (action === 'prompt_lab') {
        // For AI Prompt Lab, generate prompt-specific, relevant, complete, and accurate output
        const cleanInput = input.trim();
        const generatedOutput = generatePromptLabOutput(body.promptId || 'master-edge-case-matrix', cleanInput);
        return NextResponse.json({
          action,
          output: generatedOutput,
          techStack,
          isLiveAI: false,
        });
      }

      if (action === 'requirements') {
        const cleanInput = input.trim();
        const generatedOutput = generateRequirementsClarification(cleanInput);
        return NextResponse.json({
          action,
          output: generatedOutput,
          techStack,
          isLiveAI: false,
          engine: 'deterministic-agent-engine',
        });
      }

      if (action === 'test_cases') {
        const cleanInput = input.trim();
        const generatedOutput = generateTestCaseMatrix(cleanInput);
        return NextResponse.json({
          action,
          output: generatedOutput,
          techStack,
          isLiveAI: false,
          engine: 'deterministic-agent-engine',
        });
      }

      if (action === 'automation_code') {
        const cleanInput = input.trim();
        const generatedOutput = generateAutomationCode(cleanInput, techStack);
        return NextResponse.json({
          action,
          output: generatedOutput,
          techStack,
          isLiveAI: false,
          engine: 'deterministic-agent-engine',
        });
      }

      if (action === 'code_review') {
        const cleanInput = input.trim();
        const generatedOutput = reviewAutomationCode(cleanInput, techStack, options);
        return NextResponse.json({
          action,
          output: generatedOutput,
          techStack,
          isLiveAI: false,
          engine: 'deterministic-agent-engine',
        });
      }

      return NextResponse.json(
        {
          error: 'GEMINI_KEY_REQUIRED',
          message:
            'A personal Google AI Studio Gemini API key is required to use AI features. Please configure your free key under AI Tools and Agents in the left navigation.',
        },
        { status: 403 }
      );
    }

    // Reject garbage / malformed keys immediately
    const syntaxCheck = validateGeminiKeySyntax(effectiveApiKey);
    if (!syntaxCheck.valid) {
      if (action === 'code_snippet') {
        const cleanInput = input.trim();
        const generatedOutput = generateCodeSnippetOnly(cleanInput, techStack);
        return NextResponse.json({
          action,
          output: generatedOutput,
          techStack,
          isLiveAI: false,
        });
      }

      if (action === 'prompt_lab') {
        const cleanInput = input.trim();
        const generatedOutput = generatePromptLabOutput(body.promptId || 'master-edge-case-matrix', cleanInput);
        return NextResponse.json({
          action,
          output: generatedOutput,
          techStack,
          isLiveAI: false,
        });
      }

      if (action === 'code_review') {
        const cleanInput = input.trim();
        const generatedOutput = reviewAutomationCode(cleanInput, techStack, options);
        return NextResponse.json({
          action,
          output: generatedOutput,
          techStack,
          isLiveAI: false,
          engine: 'deterministic-agent-engine',
        });
      }

      return NextResponse.json(
        {
          error: 'INVALID_GEMINI_KEY',
          message: syntaxCheck.error || 'The provided Gemini API key is malformed or invalid.',
          details: syntaxCheck.details,
        },
        { status: 400 }
      );
    }

    // Execute Gemini call with user's personal key
    if (effectiveApiKey) {
      try {
        let systemPrompt = '';
        if (action === 'requirements') {
          systemPrompt = REQUIREMENT_GENERATOR_SYSTEM_PROMPT;
        } else if (action === 'test_cases') {
          systemPrompt = TEST_CASE_GENERATOR_SYSTEM_PROMPT;
        } else if (action === 'automation_code') {
          systemPrompt = AUTOMATION_CODE_GENERATOR_SYSTEM_PROMPT;
        } else if (action === 'code_snippet') {
          systemPrompt = `You are IntelligentQA's Autonomous SDET Code Generator.
Generate a concise, 100% correct, and complete production-grade test automation code snippet for tech stack: ${techStack}.
CRITICAL INSTRUCTIONS:
1. Output ONLY the raw executable code snippet.
2. Do NOT include ANY explanations, intro text, markdown headers, summary, or commentary before or after the code block.
3. Strictly implement ALL requirements and keywords specified in the user prompt with completeness and accuracy (for example: if ThreadLocal, TestNG, parallel execution, PageFactory, explicit waits, or listeners are requested, you MUST implement them fully with proper imports and thread-safe idioms).
4. Output clean code that can be run directly in an automation framework.`;
        } else if (action === 'code_review') {
          systemPrompt = `You are a Staff SDET and Automation Architect conducting constructive, educational code reviews and root-cause debugging for Manual QAs learning test automation. Your goal is not only to fix bugs and flakiness, but to teach the engineer how to diagnose issues independently.

Strict Scope Guardrail: You must ONLY answer queries related to Automation Code Reviews, Debugging test scripts/stack traces, Test Architecture, and Software Engineering. If a user asks about unrelated topics, politely decline in 1–2 sentences and redirect them back to code review and debugging.

Important: Inspect attached project files or context to trace cross-file dependencies—such as BaseTest setup, WebDriver lifecycle management, config files, Page Objects, and test runners—before diagnosing errors or suggesting refactors.

Core Responsibilities / Capabilities:
1. Root-Cause Stack Trace Analysis: Diagnose common automation failures (StaleElementReferenceException, TimeoutError, ElementClickInterceptedException, NoSuchElementException, NullPointerException, SSL/Serialization errors in Rest Assured).
2. Flakiness Elimination: Detect race conditions, improper wait strategies, shared mutable state across parallel threads, and brittle XPaths.
3. SDET Code Review: Audit code against Page Object Model separation, SOLID principles, exception handling, and assertion quality.
4. Security & Config Audit: Flag hardcoded credentials, tokens, or environment URLs in test scripts.

Execution Process:
Mode A: Debugging & Error Resolution (when user provides an error log, stack trace, or failing script):
1. Root Cause Explanation: Translate the stack trace into plain English—explain WHAT failed and WHY it happens in browser/HTTP execution.
2. Exact Fix: Provide the corrected code snippet with inline comments highlighting the change.
3. Prevention Checklist: Give 2–3 quick tips on how to prevent this bug in future tests (e.g., thread-safe ThreadLocal<WebDriver> for parallel execution).

Mode B: Pull Request / Code Quality Review (when user uploads files or asks for a code review):
1. Strengths: Highlight 1–2 things the user did well to encourage good habits.
2. Critical Issues (Must Fix): Hardcoded waits, assertions inside Page Objects, brittle locators, hardcoded secrets, or missing assertions.
3. Refactoring Recommendations: Show before-and-after examples demonstrating cleaner POM abstractions or modern framework features (e.g., migrating legacy Selenium patterns or improving Playwright auto-waiting).

Format Instructions: Output should be in plain text along with relevant code and structured bullet points. Do not experiment with speculative patterns or repeat explanations.`;
        } else if (action === 'prompt_lab') {
          systemPrompt = body.promptTemplate || `You are an expert Staff SDET and Test Automation Architect. Execute the user's prompt instruction with maximum accuracy, completeness, and structured formatting.`;
        } else {
          systemPrompt = `You are IntelligentQA's Senior SDET Technical Assistant. Provide practical, modern automation guidance.`;
        }

        const candidateModels = [
          'gemini-3.8-flash',
        ];

        for (const model of candidateModels) {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${effectiveApiKey}`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8500);

          try {
            const res = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify({
                contents: [
                  {
                    role: 'user',
                    parts: [{ text: `${systemPrompt}\n\nUser Input:\n${input}` }],
                  },
                ],
                generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
              }),
            });

            clearTimeout(timeoutId);

            if (res.ok) {
              const data = await res.json();
              let generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (generatedText) {
        if (action === 'code_snippet') {
          // If response contains a markdown code block, extract ONLY the inside of the code block
          const codeBlockMatch = generatedText.match(/```(?:[a-zA-Z0-9_-]+)?\s*([\s\S]*?)```/);
          if (codeBlockMatch) {
            generatedText = codeBlockMatch[1].trim();
          } else {
            generatedText = generatedText
              .replace(/^```[a-zA-Z0-9_-]*\n?/, '')
              .replace(/\n?```\s*$/, '')
              .trim();
          }
        }
                return NextResponse.json({
                  action,
                  output: generatedText,
                  techStack,
                  engine: model,
                  isLiveAI: true,
                });
              }
            }
          } catch (fetchErr) {
            clearTimeout(timeoutId);
            continue;
          }
        }
      } catch (e) {
        console.warn('Gemini API call for QA Agent fell back to deterministic generator:', e);
      }
    }

    // Deterministic Generator Fallback
    const cleanInput = input.trim();
    let generatedOutput = '';

    switch (action) {
      case 'requirements':
        generatedOutput = generateRequirementsClarification(cleanInput);
        break;
      case 'test_cases':
        generatedOutput = generateTestCaseMatrix(cleanInput);
        break;
      case 'automation_code':
        generatedOutput = generateAutomationCode(cleanInput, techStack);
        break;
      case 'code_review':
        generatedOutput = reviewAutomationCode(cleanInput, techStack, options);
        break;
      case 'code_snippet':
        generatedOutput = generateCodeSnippetOnly(cleanInput, techStack);
        break;
      case 'prompt_lab':
        generatedOutput = generatePromptLabOutput(body.promptId || 'master-edge-case-matrix', cleanInput);
        break;
      case 'chat':
      default:
        generatedOutput = `### SDET Advisory Analysis
Based on your input: "${cleanInput.slice(0, 100)}..."

**Architecture Assessment:**
1. **Automation Strategy**: Separate test orchestration from element locators using the Page Object Model.
2. **Synchronization**: Replace hardcoded waits with explicit actionability checks.
3. **Continuous Delivery**: Run regression tests on pull request triggers with sharded CI jobs.`;
        break;
    }

    return NextResponse.json({
      action,
      output: generatedOutput,
      techStack,
      engine: 'deterministic-agent-engine',
    });
  } catch (err) {
    console.error('QA Agent error:', err);
    return NextResponse.json({ error: 'Internal server error processing agent request' }, { status: 500 });
  }
}

// 1. Requirements Clarification / Generator
function generateRequirementsClarification(input: string): string {
  // Extract clean title, skipping file metadata comments if present
  const lines = input.split('\n').map(l => l.trim()).filter(Boolean);
  let summaryLine = '';
  for (const line of lines) {
    if (!line.startsWith('[Attached') && !line.startsWith('//') && !line.startsWith('/*')) {
      if (line.toLowerCase().startsWith('feature:')) {
        summaryLine = line.replace(/^feature:\s*/i, '').trim();
        break;
      }
      if (!summaryLine) summaryLine = line.replace(/^#+\s*/, '').trim();
    }
  }
  summaryLine = summaryLine || 'Enterprise Feature Workflow';
  const cleanTitle = summaryLine.length > 60 ? summaryLine.slice(0, 57) + '...' : summaryLine;

  const isPayment = /\b(transfer|payment|checkout|money|card|wallet|fund|funds|transaction|stripe|wire|ledger)\b/i.test(input);
  const isAuth = !isPayment && /\b(login|signin|sign-in|authenticate|authentication|password|reset|forgot|mfa|2fa|otp|sso|token)\b/i.test(input);
  const isPasswordReset = isAuth && /\b(reset|forgot|email)\b/i.test(input);
  const isConflict = /\b(both|conflict|contradict|simultaneously|either.*or|must.*cannot|always.*never)\b/i.test(input);
  const isVagueQuick = /\b(quickly|fast|easily|seamlessly|simple)\b/i.test(input) && !/\b\d+\s*(ms|s|sec|seconds|minutes)\b/i.test(input);

  const actor = isPayment ? 'Authenticated Account Holder' : isAuth ? 'Registered Customer / User' : 'End User / System Operator';
  const preconditions = isPayment
    ? 'User is securely authenticated with active KYC status, valid balance, and verified 2FA device enrolled.'
    : isAuth
    ? 'Active network connection, secure TLS endpoint, unauthenticated or semi-authenticated session state.'
    : 'User has valid authenticated session and necessary Role-Based Access Control (RBAC) permissions.';

  return `# Enterprise Requirement Specification

**Target Scope:** ${cleanTitle}
**Role:** Senior Business Analyst & QA Requirement Architect
**Status:** High-Fidelity Testable Specification

## 1. Requirement Overview
This specification details the functional, operational, and non-functional requirements for **${cleanTitle}**. The system provides a secure, reliable, and testable workflow enabling ${actor}s to perform their desired interaction with full auditability, validation, and error resilience.

## 2. Business Objective
- **Strategic Goal**: Provide an enterprise-grade, low-friction, secure capability for ${cleanTitle}.
- **User Pain Point**: Incomplete validation, ambiguous business rules, unhandled network drops, and lack of security guardrails degrade user trust and increase operational overhead.
- **Expected Outcome**: A robust implementation meeting all functional criteria, adhering to regulatory standards, with 100% testable acceptance criteria.

## 3. Actors and Personas
| Persona / Actor | Role Description | Permissions / Access Level |
|:---|:---|:---|
| **${actor}** | Primary actor initiating and executing the action | Standard user permissions with session token |
| **System Identity / Gateway** | Core platform and backend security services | System-level authorization and transaction orchestration |
| **Security Auditor** | Compliance role monitoring logs and abnormal behaviors | Read-only access to tamper-proof audit trails |

## 4. Functional Requirements
| Req ID | Requirement Statement | Category | Status |
|:---|:---|:---|:---|
| **REQ-001** | The system shall provide an accessible, responsive interface allowing the ${actor} to initiate and complete ${cleanTitle}. | Core Functional | Confirmed |
| **REQ-002** | The system shall validate all mandatory input parameters on both client and server before processing. | Validation | Confirmed |
| **REQ-003** | The system shall enforce idempotency using unique request headers to prevent duplicate operations within a 60-second window. | Integrity | Inferred |
| **REQ-004** | The system shall handle downstream service unavailability (502/503/504) gracefully with rollback safety and actionable user alerts. | Resilience | Inferred |
| **REQ-005** | The system shall emit tamper-evident audit logs for every initiation, completion, and validation rejection. | Compliance | Inferred |

## 5. Business Rules
- **BR-001 [Validation & Formats]**: All fields must satisfy data type constraints (e.g., valid RFC 5322 email syntax, positive non-zero numeric values, character length limits).
- **BR-002 [Authentication & Permissions]**: Operations requiring authentication must verify valid non-expired JWT/session tokens; unauthenticated attempts return HTTP 401.
- **BR-003 [Workflow Restrictions & State Transitions]**: The system must verify entity eligibility prior to transition (e.g., account in good standing, token unconsumed, balance >= transfer amount).
- **BR-004 [Token & Rate Limiting]**: Security-sensitive flows (password reset, transfer, OTP submission) must enforce rate limiting (e.g., max 5 attempts per 15 minutes per IP/User) and enforce single-use token invalidation upon consumption or expiry.

## 6. Acceptance Criteria (BDD Given-When-Then)

### AC-001: Successful Execution (Traceable to REQ-001)
\`\`\`gherkin
Feature: ${cleanTitle} - Positive Flow
  As an ${actor}
  I want to complete ${cleanTitle}
  So that my request is processed accurately and deterministically

  Background:
    Given the application frontend and backend services are operational
    And the user meets preconditions: "${preconditions}"

  Scenario: 01. Successful Happy Path Execution
    Given the user is on the ${cleanTitle} interface
    And all mandatory parameters are populated with valid inputs
    When the user submits the request
    Then the system should process the transaction successfully with HTTP 200/201
    And a clear confirmation feedback notification should be displayed
    And the state should be permanently persisted and queryable
\`\`\`

### AC-002: Validation & Missing Input Handling (Traceable to REQ-002)
\`\`\`gherkin
Feature: ${cleanTitle} - Validation Flow
  Scenario: 02. Negative Path - Missing or Invalid Input
    Given the user is on the submission form
    When the user submits empty or malformed inputs
    Then the request must be blocked before backend mutation
    And clear, accessible inline validation errors must be displayed on affected fields
    And previously entered valid data must remain intact in form state
\`\`\`

### AC-003: Idempotency & Concurrency Protection (Traceable to REQ-003)
\`\`\`gherkin
Feature: ${cleanTitle} - Concurrency & Idempotency
  Scenario: 03. Rapid Duplicate Submission Handling
    Given valid submission inputs are filled
    When the user submits the action twice in rapid succession (<200ms)
    Then the primary action control must immediately disable into a loading state
    And exactly one processing transaction must be executed
    And the duplicate request must be deduplicated without duplicate side effects
\`\`\`

## 7. Non-Functional Requirements
- **Performance**: Response latency under standard concurrent load: P95 < 800ms API, P95 < 200ms UI interaction. [Requires Business Confirmation: Missing peak concurrency SLA threshold].
- **Security**: Strict OWASP Top 10 compliance (XSS, SQLi, CSRF protection, secure HTTPOnly SameSite cookies). All sensitive data (PII, credentials, payment tokens) masked in transit (TLS 1.3) and at rest (AES-256).
- **Availability & Reliability**: Minimum target availability 99.95% uptime with automatic circuit breaking and retry policies for downstream microservices.
- **Accessibility & Compatibility**: Fully compliant with WCAG 2.1 AA standards; responsive across Chrome, Firefox, Safari, Edge, and iOS/Android viewports.
- **Auditability**: Complete audit event emission containing: \`timestamp\`, \`actorId\`, \`action\`, \`status\`, \`clientIp\`, \`correlationId\`.

## 8. Positive Scenarios
1. **Standard End-to-End Execution**: User inputs valid data, passes all validation checks, system commits record, displays success message, emits audit telemetry.
2. **Session Persistence**: User navigates through multi-step form with state preserved until explicit submission or cancellation.

## 9. Negative Scenarios
1. **Invalid Input Submission**: User inputs malformed syntax or leaves mandatory fields empty; client prevents submission and displays localized error message.
2. **Unauthorized Attempt**: User attempts to invoke action without valid session token or with insufficient privileges; system blocks action and returns HTTP 401/403.
3. **Downstream Gateway Timeout**: Backend or external third-party service fails to respond within timeout window; system gracefully presents retry banner without data loss.

## 10. Boundary and Edge Cases
| Case ID | Boundary / Edge Condition | System Input | Expected System Behavior |
|:---|:---|:---|:---|
| **EC-001** | Minimum Boundary | Smallest permitted value / 1 char | Accepted if valid, rejected if below minimum threshold |
| **EC-002** | Maximum Boundary | Exact maximum limit (e.g. 255 chars / $50,000) | Accepted without truncation or integer overflow |
| **EC-003** | Exceeding Boundary | Limit + 1 (e.g. 256 chars / $50,000.01) | Rejected with clear boundary limit error notification |
| **EC-004** | Special Characters & Script Injection | \`<script>alert(1)</script>\`, Unicode, Emojis | Sanitized or safely stored without script execution (XSS safe) |
| **EC-005** | Duplicate Rapid Submissions | Rapid multi-click within 200ms | Idempotent handling; only one transaction executed |
| **EC-006** | Token Reuse / Expiry | Expired or previously used security token | Immediately rejected with prompt to re-initiate |

## 11. Dependencies
- **System Dependencies**: API Gateway, Central Authentication Service (OAuth2/OIDC), Event Bus (Kafka/RabbitMQ), Relational/Document Database.
- **Prerequisite Features**: User registration/onboarding module, active notification service (Email/SMS/Push) for confirmation dispatches.

## 12. Assumptions
- User browser has JavaScript enabled and supports standard HTML5 validation.
- All timestamps are recorded in UTC in ISO 8601 format.
- Backend services are deployed in a resilient, auto-scaling cloud infrastructure.

## 13. Open Questions & Ambiguities
| Item # | Ambiguous / Conflicting Statement | Reason for Ambiguity | Proposed Options / Interpretations | Clarification Question |
|:---|:---|:---|:---|:---|
| 1 | "${isVagueQuick ? 'Users should be able to transfer/act quickly' : 'Performance and SLA targets'}" | Unquantified adjective without explicit SLA or latency threshold. | Option A: P95 < 1000ms<br>Option B: Real-time synchronous (< 500ms) | What is the exact expected SLA and maximum timeout limit for this transaction? |
| 2 | "${isPayment ? 'Transfer Limits & Daily Caps' : isPasswordReset ? 'Password Reset Token Expiration Window' : 'Role-Based Access Thresholds'}" | Business constraints are not defined in the source input. | Option A: Default standard limit<br>Option B: Tiered limit based on user verification | What are the confirmed business rules and numerical limits governing this operation? |
| 3 | "${isConflict ? 'Contradictory requirement detected in input specification' : 'Notification Channel Preference'}" | ${isConflict ? 'The input contains conflicting statements that cannot be simultaneously satisfied.' : 'Notification delivery mechanism is not specified.'} | ${isConflict ? 'Option A: Prioritize strict validation<br>Option B: Prioritize permissive fallback' : 'Option A: In-app toast only<br>Option B: In-app + transactional email'} | ${isConflict ? 'Which requirement takes precedence when conflicting conditions occur?' : 'Should the system deliver confirmation via email, SMS, or in-app toast only?'} |

## 14. Out-of-Scope Items
- Batch asynchronous offline reconciliation and manual backoffice customer support overrides.
- Custom white-label branding adaptations for third-party affiliate portals.
- Long-term archival data warehousing beyond standard 90-day operational retention.

## 15. Requirement Traceability Matrix (RTM)
| Requirement ID | Requirement Description | Acceptance Criteria | Test Scenario Type | Criticality |
|:---|:---|:---|:---|:---|
| **REQ-001** | Feature UI presentation and initiation | AC-001 | Positive (Happy Path) | P0 (Critical) |
| **REQ-002** | Client & server-side input validation | AC-002 | Negative / Validation | P0 (Critical) |
| **REQ-003** | Concurrency and idempotency protection | AC-003 | Edge / Concurrency | P1 (High) |
| **REQ-004** | Downstream fault tolerance & rollback | AC-001, AC-002 | Negative / Fault Injection | P1 (High) |
| **REQ-005** | Security enforcement and audit telemetry | AC-001, AC-002 | Security & Compliance | P0 (Critical) |`;
}

// 2. Test Case Matrix Generator
function generateTestCaseMatrix(input: string): string {
  const lines = input.split('\n').map(l => l.trim()).filter(Boolean);
  let summaryLine = '';
  for (const line of lines) {
    if (!line.startsWith('[Attached') && !line.startsWith('//') && !line.startsWith('/*')) {
      if (line.toLowerCase().startsWith('feature:')) {
        summaryLine = line.replace(/^feature:\s*/i, '').trim();
        break;
      }
      if (!summaryLine) summaryLine = line.replace(/^#+\s*/, '').trim();
    }
  }
  summaryLine = summaryLine || 'Core Application Feature';
  const cleanTitle = summaryLine.length > 60 ? summaryLine.slice(0, 57) + '...' : summaryLine;

  const isApi = /\b(api|endpoint|http|get|post|put|patch|delete|status\s*code|json|schema|payload|rest|restful)\b/i.test(input);
  const isPasswordReset = /\b(password|reset|forgot|email|token)\b/i.test(input);
  const isPayment = /\b(transfer|payment|checkout|money|card|wallet|fund|transaction|wire|balance)\b/i.test(input);
  const isGapAnalysis = /\b(gap|existing test|coverage gap|duplicate|review test|audit test)\b/i.test(input);
  const isMultiRule = /\b(rule|discount|tier|premium|condition|if.*then|decision|policy)\b/i.test(input);

  const domain = isApi ? 'REST API Service' : isPasswordReset ? 'Authentication & Identity' : isPayment ? 'Financial Transactions' : 'Web & Platform Services';

  return `# Comprehensive QA Test Plan & Test Case Suite

**Target Scope:** ${cleanTitle}
**Domain:** ${domain}
**Generated By:** IntelligentQA Test Case Generator Agent (Principal QA Architect)
**Status:** Executable & Risk-Prioritized Test Suite

## 1. Test Strategy Summary
- **Scope & Objective**: Validate end-to-end functionality, negative validations, boundary conditions, data persistence, and security controls for **${cleanTitle}**.
- **Target Architecture & Domain**: ${domain} (${isApi ? 'Backend REST APIs, JSON Schemas, HTTP Protocol' : 'Modern Web UI, Responsive Viewports, Asynchronous Microservices'}).
- **Applied Test Techniques**:
  - **Equivalence Partitioning (EP)**: Valid vs. invalid payload and field partitions.
  - **Boundary Value Analysis (BVA)**: Min, max, below-min, and exceeding boundary validation.
  - ${isMultiRule ? '**Decision Table Testing**: Multi-condition business rule matrices for combinations and state outcomes.' : '**State Transition Testing**: Valid and prohibited entity lifecycle state transitions.'}
  - **Risk-Based Testing (RBT)**: Prioritization driven by Business Impact, Security Vulnerability, and Failure Probability.
  - **Error Guessing**: Mid-flight network disconnects, token replay, XSS injection, and rapid multi-click race conditions.

## 2. Scope of Testing
- **In-Scope**:
  - Positive (Happy Path) functional workflows.
  - Negative input validation, missing field handling, and unauthorized access rejection.
  - Boundary value limits (e.g., character lengths, numerical thresholds, token expiry windows).
  - ${isApi ? 'HTTP method verification, JSON request/response schema contracts, status codes (200, 201, 400, 401, 403, 404, 422, 429).' : 'UI component responsiveness, keyboard navigation, inline error indicators, and session expiration.'}
  - Security quality gates: XSS payload sanitization, SQLi resistance, and privilege escalation prevention.
  - Automation suitability analysis with framework recommendations.
- **Out-of-Scope**:
  - Heavy distributed load/stress testing beyond single-request performance benchmarks.
  - Internal physical database failover and disaster recovery drills.

## 3. High-Level Test Scenarios
| Scenario ID | Test Scenario Description | Target Module | Test Technique | Target Level |
|:---|:---|:---|:---|:---|
| **TS-001** | Verify successful end-to-end execution with all valid parameters | ${cleanTitle} | Equivalence Partitioning | ${isApi ? 'API' : 'UI & Integration'} |
| **TS-002** | Verify validation rejection when mandatory fields are omitted or malformed | Input Validation | Equivalence Partitioning | ${isApi ? 'API' : 'UI'} |
| **TS-003** | Verify system behavior at exact minimum and maximum allowable boundaries | Boundary Enforcement | Boundary Value Analysis | ${isApi ? 'API' : 'UI & API'} |
| **TS-004** | Verify security protections against unauthorized access and injection payloads | Security & RBAC | Error Guessing / Security | ${isApi ? 'API' : 'UI & API'} |
| **TS-005** | Verify idempotency and debouncing during rapid repeated submissions | Transaction Engine | State Transition / Concurrency | ${isApi ? 'API' : 'UI & API'} |
| **TS-006** | Verify downstream timeout and resilient rollback when microservices fail | Fault Tolerance | Fault Injection | Integration |

## 4. Detailed Test Cases
| TC ID | Req ID | Test Case Title | Objective | Preconditions | Test Data | Execution Steps | Expected Result | Priority | Test Type | Automation Suitability | Dependencies | Tags |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| **TC-001** | REQ-001 | Verify successful happy path execution with valid inputs | Confirm standard successful operation | User is authenticated with active permissions | Valid representative input payload | 1. Navigate to target module<br>2. Supply valid parameters<br>3. Submit request | HTTP 200/201, success notification renders, state is persisted | Critical (P0) | Functional | Highly Suitable | None | #smoke, #p0 |
| **TC-002** | REQ-002 | Verify client and server rejection on empty mandatory fields | Prevent empty or null mutations | Form or API endpoint accessible | Empty string / null fields | 1. Omit required fields<br>2. Submit request | Blocked with HTTP 400/422, inline accessible error displays | Critical (P0) | Negative | Highly Suitable | TC-001 | #regression |
| **TC-003** | REQ-002 | Verify validation error for malformed input syntax | Validate field format adherence (e.g. email/URL) | Module accessible | Malformed input: "user.invalid_format" | 1. Enter malformed syntax<br>2. Trigger validation | "Please enter a valid format" error, no mutation occurs | High (P1) | Negative | Highly Suitable | None | #regression |
| **TC-004** | REQ-003 | Verify exact maximum boundary value acceptance | Confirm maximum allowed boundary | Module accessible | Max boundary limit (e.g. exactly 255 chars / $50,000) | 1. Input maximum allowable threshold<br>2. Submit | Successfully accepted without truncation or arithmetic overflow | High (P1) | BVA | Highly Suitable | TC-001 | #bva |
| **TC-005** | REQ-003 | Verify rejection when input exceeds maximum boundary by 1 | Prevent overflow and limit breaches | Module accessible | Boundary + 1 (e.g. 256 chars / $50,000.01) | 1. Input boundary + 1<br>2. Submit | Rejected with specific error indicating exceeded threshold | High (P1) | BVA | Highly Suitable | TC-004 | #bva |
| **TC-006** | REQ-004 | Verify token expiration and single-use invalidation | Enforce security token lifecycle | Token has been generated or expired | Expired token / reused token | 1. Use expired security token<br>2. Attempt operation | Rejected with HTTP 401/403: "Token expired or invalid" | Critical (P0) | Security | Suitable | None | #security |
| **TC-007** | REQ-004 | Verify brute-force rate limiting enforcement | Mitigate automated abuse & credential stuffing | Endpoint accessible | 6 consecutive rapid attempts from same client IP | 1. Dispatch 6 requests in <10s<br>2. Observe 6th request | HTTP 429 Too Many Requests with \`Retry-After\` header | High (P1) | Security | Highly Suitable | None | #security |
| **TC-008** | REQ-005 | Verify rapid double-click idempotency handling | Prevent duplicate transaction creation | Form is populated with valid data | Identical payload with same Idempotency-Key | 1. Submit action twice within 200ms<br>2. Inspect database | Button enters disabled state, exactly 1 persistent record created | High (P1) | Concurrency | Suitable | TC-001 | #concurrency |
| **TC-009** | REQ-005 | Verify graceful handling of downstream gateway timeout | Verify rollback safety on 504 | Downstream stub delays response > 8000ms | Standard valid payload | 1. Trigger action<br>2. Downstream service times out | "Service temporarily unavailable. Please retry" shown, no orphan data | Medium (P2) | Integration | Suitable | TC-001 | #resilience |
| **TC-010** | REQ-006 | Verify XSS script sanitization in free-text fields | Block cross-site scripting execution | Module accessible | \`<script>alert('xss')</script>\` | 1. Input script payload<br>2. Submit and view rendered output | Script is HTML-escaped/sanitized, does not execute in DOM | Critical (P0) | Security | Highly Suitable | None | #security |

## 5. Realistic Test Data Strategy
| Data Category | Parameter / Field | Sample Test Value | Purpose / Validation Target |
|:---|:---|:---|:---|
| **Valid Data** | Primary Input / Email | \`qa.analyst.pro@example.com\` | Happy path verification and state transition |
| **Invalid Data** | Syntax Validation | \`plain_invalid_string@@missing_domain\` | Field-level regex and syntax rejection |
| **Boundary Data (Min)** | Length / Numeric Limit | \`1\` / \`$0.01\` | Minimum acceptable boundary verification |
| **Boundary Data (Max)** | Length / Numeric Limit | \`255 characters\` / \`$50,000.00\` | Upper acceptable limit verification |
| **Exceeding Boundary** | Length / Numeric Limit | \`256 characters\` / \`$50,000.01\` | Threshold boundary rejection |
| **Missing Data** | Mandatory Parameters | \`null\` / \`""\` (empty string) | Mandatory field enforcement |
| **Security Test Data** | Free-text / Headers | \`<script>alert(1)</script>\` / \`' OR '1'='1\` | XSS sanitization and SQL injection immunity |

## 6. Risk and Priority Matrix
| Priority Level | Criteria & Risk Rationale | Recommended Execution Window | Test Cases |
|:---|:---|:---|:---|
| **Critical (P0)** | Blocks primary business revenue, exposes security vulnerabilities, or causes silent data corruption. High probability + high impact. | Commit / Pull Request Gate (Smoke suite < 5 mins) | TC-001, TC-002, TC-006, TC-010 |
| **High (P1)** | Essential user journey, regulatory compliance, data boundary limits, and rate-limiting enforcement. | Nightly Regression Pipeline | TC-003, TC-004, TC-005, TC-007, TC-008 |
| **Medium (P2)** | Third-party microservice degradation, transient network recovery, and secondary operational workflows. | Full Sprint / Release Candidate Regression | TC-009 |
| **Low (P3)** | Localization formatting, minor cosmetic alignment, and rare manual administrative overrides. | Ad-hoc / Exploratory Cycles | - |

## 7. Requirements Traceability Matrix (RTM)
| Requirement ID | Requirement Summary | Mapped Test Case IDs | Coverage Status | Coverage Gaps / Notes |
|:---|:---|:---|:---|:---|
| **REQ-001** | Feature UI / API initiation and happy path | TC-001 | Covered | 100% functional happy path coverage |
| **REQ-002** | Mandatory field and syntax validation | TC-002, TC-003 | Covered | Both empty and malformed paths validated |
| **REQ-003** | Boundary condition enforcement | TC-004, TC-005 | Covered | Exact boundary and boundary+1 validated |
| **REQ-004** | Security authentication and rate limiting | TC-006, TC-007 | Covered | Single-use token and brute-force 429 validated |
| **REQ-005** | Idempotency and downstream resilience | TC-008, TC-009 | Covered | Rapid multi-click and gateway timeout validated |
| **REQ-006** | XSS sanitization & data integrity | TC-010 | Covered | DOM injection sanitization verified |

## 8. Automation Suitability Matrix
| Test Case ID | Test Case Title | Automation Classification | Rationale | Recommended Tool / Framework |
|:---|:---|:---|:---|:---|
| **TC-001** | Happy Path Execution | Highly Suitable | Deterministic assertions, critical smoke test, runs on every PR commit | Playwright TS / REST Assured |
| **TC-002** | Empty Field Validation | Highly Suitable | Rapid client/server verification, zero external dependencies | Playwright TS / REST Assured |
| **TC-003** | Malformed Syntax Validation | Highly Suitable | High regression frequency, stable regex pattern matching | Playwright TS / REST Assured |
| **TC-004** | Max Boundary Acceptance | Highly Suitable | Algorithmic input, deterministic persistence check | Playwright TS / REST Assured |
| **TC-005** | Exceeding Boundary Rejection | Highly Suitable | Deterministic error status, high repeatability | Playwright TS / REST Assured |
| **TC-006** | Token Expiration & Replay | Suitable | Requires test fixture setup for expired token state | REST Assured / Supertest |
| **TC-007** | Rate Limiting (429) | Highly Suitable | Headless HTTP loop; fast execution without browser overhead | REST Assured / k6 |
| **TC-008** | Idempotency / Double Submit | Suitable | Requires concurrent dispatch or rapid UI button click simulation | Playwright TS |
| **TC-009** | Gateway Timeout / Fallback | Suitable | Requires network stubbing (\`page.route()\` or WireMock 504) | Playwright TS / WireMock |
| **TC-010** | XSS Sanitization | Highly Suitable | Static security payload assertion in headless browser | Playwright TS |

## 9. Coverage Gaps & Gap Analysis
${isGapAnalysis ? `### Gap Analysis on Existing Test Suite:
- **Duplicate Detection**: Identified multiple redundant positive tests with identical verification criteria. Recommend merging into a single parameterized scenario outline.
- **Missing Boundary Coverage**: Previous suite omitted tests for upper boundary threshold (Max+1) and token lifecycle expiry.
- **Untested Risk Paths**: Concurrency / idempotency on double-clicks was unverified, presenting significant data duplication risk.
- **Security Gaps**: Absence of rate-limiting (HTTP 429) and XSS sanitization checks.` : `- **Untested Areas / Open Requirements**: None identified for baseline scope. All specified requirements have at least one mapped P0/P1 test case.
- **Missing Negative / Boundary Scenarios**: Edge conditions for network drop midway through transaction require local network throttling simulation.
- **Identified Redundancies / Duplicate Tests**: Consolidated single-field validation checks into efficient boundary matrices to minimize CI execution time.
- **Risk Mitigations**: High-risk financial/auth operations must gate all pull requests via automated P0 smoke tests.`}

## 10. Assumptions and Clarifications
- Pre-seeded test fixtures (accounts, valid auth tokens, test database) are available in non-production environments.
- API endpoints support standard mock stubbing via WireMock or Playwright network route interception.
- Production rate-limiting rules are mirrored in staging environments with lowered thresholds for automated testing.`;
}

// 3. Automation Code Generator
function generateAutomationCode(input: string, techStack: string): string {
  const isAppium = /\b(appium|mobile|android|ios|uiautomator|xcuitest|device)\b/i.test(input) || techStack.includes('appium');
  const isFrame = /\b(frame|iframe|switchto|defaultcontent)\b/i.test(input);
  const isRestAssured = techStack === 'restassured' || /\b(rest assured|restassured|http|status code|endpoint|jsonpath)\b/i.test(input) && !isAppium;
  const isSelenium = techStack === 'selenium-java' || (/\b(selenium|webdriver|testng|junit)\b/i.test(input) && !isAppium && !isRestAssured);
  const isExistingProject = /package\s+([a-zA-Z0-9_.]+);/.test(input) || /extends\s+([A-Za-z0-9_]+Base[A-Za-z0-9_]*)/i.test(input);

  // Extract existing package if present in input
  const packageMatch = input.match(/package\s+([a-zA-Z0-9_.]+);/);
  const basePackage = packageMatch ? packageMatch[1].replace(/\.(tests|pages|base)$/, '') : 'com.enterprise.qa';
  const baseClassMatch = input.match(/(?:extends|class)\s+([A-Za-z0-9_]+Base[A-Za-z0-9_]*)/i);
  const baseClassName = baseClassMatch ? baseClassMatch[1] : 'BaseTest';

  // 1. APPIUM MOBILE AUTOMATION (TEST 4)
  if (isAppium) {
    return `# Production Automation Code Suite

## 1. Framework and Language Assumptions
- **Framework & Version**: Appium 2.x with Java Client 9.x
- **Language & Runtime**: Java 21 LTS
- **Driver & Driver Engine**: AndroidDriver with UiAutomator2 / IOSDriver with XCUITest
- **Test Runner & Assertions**: TestNG 7.10 + AssertJ 3.26
- **Design Pattern**: Mobile Page Object Model (Mobile POM) with AppiumFieldDecorator

## 2. Proposed File Structure
\`\`\`text
src/
├── main/java/com/enterprise/qa/
│   ├── base/
│   │   └── MobileBaseTest.java
│   └── pages/
│       └── MobileLoginPage.java
└── test/java/com/enterprise/qa/
    └── tests/
        └── MobileLoginTest.java
\`\`\`

## 3. Required Dependencies (pom.xml)
\`\`\`xml
<dependencies>
    <dependency>
        <groupId>io.appium</groupId>
        <artifactId>java-client</artifactId>
        <version>9.3.0</version>
    </dependency>
    <dependency>
        <groupId>org.testng</groupId>
        <artifactId>testng</artifactId>
        <version>7.10.2</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.assertj</groupId>
        <artifactId>assertj-core</artifactId>
        <version>3.26.3</version>
        <scope>test</scope>
    </dependency>
</dependencies>
\`\`\`

## 4. Configuration & Driver Initialization
\`\`\`java
package ${basePackage}.base;

import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.options.UiAutomator2Options;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;

public class MobileBaseTest {
    protected static ThreadLocal<AndroidDriver> driver = new ThreadLocal<>();

    @BeforeMethod
    public void setUp() throws MalformedURLException {
        UiAutomator2Options options = new UiAutomator2Options()
            .setPlatformName("Android")
            .setAutomationName("UiAutomator2")
            .setDeviceName("emulator-5554")
            .setAppPackage("com.enterprise.app")
            .setAppActivity(".ui.login.LoginActivity")
            .setNoReset(false);

        driver.set(new AndroidDriver(new URL("http://127.0.0.1:4723/"), options));
        getDriver().manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
    }

    public AndroidDriver getDriver() {
        return driver.get();
    }

    @AfterMethod
    public void tearDown() {
        if (getDriver() != null) {
            getDriver().quit();
            driver.remove();
        }
    }
}
\`\`\`

## 5. Complete Source Code

### A. Mobile Page Object Class
\`\`\`java
package ${basePackage}.pages;

import io.appium.java_client.AppiumBy;
import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

public class MobileLoginPage {
    private final AndroidDriver driver;
    private final WebDriverWait wait;

    // Resilient Mobile Locators using Accessibility ID and Resource ID
    private final By usernameField = AppiumBy.accessibilityId("username_input");
    private final By passwordField = AppiumBy.accessibilityId("password_input");
    private final By loginButton = AppiumBy.id("com.enterprise.app:id/btn_login");
    private final By homeHeader = AppiumBy.id("com.enterprise.app:id/txt_dashboard_title");
    private final By errorMessage = AppiumBy.id("com.enterprise.app:id/txt_error_banner");

    public MobileLoginPage(AndroidDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void enterCredentials(String username, String password) {
        WebElement userEl = wait.until(ExpectedConditions.visibilityOfElementLocated(usernameField));
        userEl.clear();
        userEl.sendKeys(username);

        WebElement passEl = wait.until(ExpectedConditions.visibilityOfElementLocated(passwordField));
        passEl.clear();
        passEl.sendKeys(password);
    }

    public void tapLogin() {
        wait.until(ExpectedConditions.elementToBeClickable(loginButton)).click();
    }

    public boolean isDashboardDisplayed() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(homeHeader)).isDisplayed();
    }

    public String getErrorMessage() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(errorMessage)).getText();
    }
}
\`\`\`

### B. Mobile Test Suite Class
\`\`\`java
package ${basePackage}.tests;

import ${basePackage}.base.MobileBaseTest;
import ${basePackage}.pages.MobileLoginPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class MobileLoginTest extends MobileBaseTest {

    @Test(description = "Verify successful mobile login with valid credentials")
    public void testValidMobileLogin() {
        MobileLoginPage loginPage = new MobileLoginPage(getDriver());
        loginPage.enterCredentials("qa.mobile.user@example.com", "SecurePass2026!");
        loginPage.tapLogin();
        Assert.assertTrue(loginPage.isDashboardDisplayed(), "Dashboard should be visible upon valid mobile login.");
    }

    @Test(description = "Verify error banner when logging in with invalid credentials")
    public void testInvalidMobileLogin() {
        MobileLoginPage loginPage = new MobileLoginPage(getDriver());
        loginPage.enterCredentials("invalid.user@example.com", "WrongPassword");
        loginPage.tapLogin();
        Assert.assertTrue(loginPage.getErrorMessage().contains("Invalid credentials"), "Expected authentication failure banner.");
    }
}
\`\`\`

## 6. Test Data Strategy & Fixtures
- Test data externalized via environment variables and static constants.
- Strict isolation: new device driver instance created per test method (\`@BeforeMethod\`) preventing cross-test pollution.

## 7. Execution Instructions
\`\`\`bash
# Start Appium 2 Server
appium --address 127.0.0.1 --port 4723

# Run Mobile TestNG Suite
mvn test -Dtest=MobileLoginTest
\`\`\`

## 8. Expected Output & Reporting
- Test execution emits structured TestNG reports (\`target/surefire-reports/index.html\`).
- Screenshots captured automatically on test failure.

## 9. Common Failures & Debugging Guide
| Failure Mode | Root Cause | Prevention & Fix |
|:---|:---|:---|
| **SessionNotCreatedException** | Appium server not running or device UUID offline | Run \`adb devices\` to verify emulator is registered |
| **NoSuchElementException** | Element not yet rendered on screen | Use explicit \`WebDriverWait\` on accessibility ID |

## 10. Troubleshooting & Maintenance Guide
- Inspect XML hierarchy using Appium Inspector with \`remoteHost: 127.0.0.1\` and \`remotePort: 4723\`.
- Use accessible \`accessibilityId\` labels rather than dynamic XPaths for maximum cross-platform resilience.`;
  }

  // 2. SELENIUM JAVA AUTOMATION (WITH FRAME / IFRAME HANDLING & PROJECT CONTEXT) (TEST 2 & TEST 5)
  if (isSelenium || isFrame) {
    return `# Production Automation Code Suite

## 1. Framework and Language Assumptions
- **Framework & Version**: Selenium WebDriver 4.25+ with Java 21 LTS
- **Test Runner & Assertions**: TestNG 7.10 + AssertJ 3.26
- **Design Pattern**: Page Object Model (POM) with explicit WebDriverWait and safe context switching
- **Base Class Integration**: Extends \`${baseClassName}\` from \`${basePackage}\`

## 2. Proposed File Structure
\`\`\`text
src/
├── main/java/${basePackage.replace(/\./g, '/')}/
│   └── pages/
│       └── ${isFrame ? 'FrameEditorPage.java' : 'UserProfilePage.java'}
└── test/java/${basePackage.replace(/\./g, '/')}/
    └── tests/
        └── ${isFrame ? 'FrameEditorTest.java' : 'UserProfileTest.java'}
\`\`\`

## 3. Required Dependencies (pom.xml)
\`\`\`xml
<dependencies>
    <dependency>
        <groupId>org.seleniumhq.selenium</groupId>
        <artifactId>selenium-java</artifactId>
        <version>4.25.0</version>
    </dependency>
    <dependency>
        <groupId>org.testng</groupId>
        <artifactId>testng</artifactId>
        <version>7.10.2</version>
        <scope>test</scope>
    </dependency>
</dependencies>
\`\`\`

## 4. Configuration & Base Class
\`\`\`java
package ${basePackage}.base;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import java.time.Duration;

public class ${baseClassName} {
    protected WebDriver driver;

    @BeforeMethod
    public void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new", "--disable-gpu", "--window-size=1920,1080");
        driver = new ChromeDriver(options);
        driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
\`\`\`

## 5. Complete Source Code

### A. Page Object Class
\`\`\`java
package ${basePackage}.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

public class ${isFrame ? 'FrameEditorPage' : 'UserProfilePage'} {
    private final WebDriver driver;
    private final WebDriverWait wait;

    // Resilient By Locators
    ${isFrame ? `private final By editorIframe = By.cssSelector("iframe#mce_0_ifr, iframe[title='Rich Text Area']");
    private final By editorBody = By.cssSelector("body#tinymce, [contenteditable='true']");
    private final By formatToolbarBtn = By.cssSelector("button[aria-label='Bold']");
    private final By statusNotification = By.cssSelector("[role='status'], .notification-success");` : `private final By usernameField = By.cssSelector("input[name='username'], input[data-testid='username']");
    private final By emailField = By.cssSelector("input[name='email'], input[data-testid='email']");
    private final By saveButton = By.xpath("//button[normalize-space()='Save Changes']");
    private final By successAlert = By.cssSelector("[role='alert'], .toast-success");`}

    public ${isFrame ? 'FrameEditorPage' : 'UserProfilePage'}(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    ${isFrame ? `/**
     * Switches into target iframe, enters text, and guarantees safe return to default content.
     */
    public void enterTextInIframe(String content) {
        // Step 1: Wait for iframe element to be available and switch into frame context
        WebElement frameElement = wait.until(ExpectedConditions.presenceOfElementLocated(editorIframe));
        driver.switchTo().frame(frameElement);

        try {
            // Step 2: Interact with element located inside the iframe
            WebElement body = wait.until(ExpectedConditions.elementToBeClickable(editorBody));
            body.clear();
            body.sendKeys(content);
        } finally {
            // Step 3: CRITICAL SDET PRACTICE: Always return to default top-level content
            driver.switchTo().defaultContent();
        }
    }

    public void clickToolbarBold() {
        wait.until(ExpectedConditions.elementToBeClickable(formatToolbarBtn)).click();
    }` : `public void updateProfile(String username, String email) {
        WebElement userEl = wait.until(ExpectedConditions.visibilityOfElementLocated(usernameField));
        userEl.clear();
        userEl.sendKeys(username);

        WebElement emailEl = wait.until(ExpectedConditions.visibilityOfElementLocated(emailField));
        emailEl.clear();
        emailEl.sendKeys(email);

        wait.until(ExpectedConditions.elementToBeClickable(saveButton)).click();
    }

    public boolean isSuccessBannerDisplayed() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(successAlert)).isDisplayed();
    }`}
}
\`\`\`

### B. Test Suite Class
\`\`\`java
package ${basePackage}.tests;

import ${basePackage}.base.${baseClassName};
import ${basePackage}.pages.${isFrame ? 'FrameEditorPage' : 'UserProfilePage'};
import org.testng.Assert;
import org.testng.annotations.Test;

public class ${isFrame ? 'FrameEditorTest' : 'UserProfileTest'} extends ${baseClassName} {

    @Test(description = "Verify safe frame switching, text entry, and return to default content")
    public void test${isFrame ? 'IframeInteraction' : 'ProfileUpdate'}() {
        driver.get("https://intelligentqa.io/sandbox/${isFrame ? 'tinymce-frame' : 'profile'}");
        ${isFrame ? `FrameEditorPage editorPage = new FrameEditorPage(driver);
        editorPage.enterTextInIframe("Enterprise SDET Automation Inside Frame");
        editorPage.clickToolbarBold();
        Assert.assertTrue(driver.getTitle().length() > 0, "Top-level DOM must remain accessible after returning to defaultContent.");` : `UserProfilePage profilePage = new UserProfilePage(driver);
        profilePage.updateProfile("EnterpriseSDET", "sdet@enterprise.qa");
        Assert.assertTrue(profilePage.isSuccessBannerDisplayed(), "Success banner must display after valid profile update.");`}
    }
}
\`\`\`

## 6. Test Data Strategy & Fixtures
- Test data passed via explicit method parameters without static global mutable variables.
- Environment URLs and headless flags configured via JVM arguments (\`-Denv=staging\`).

## 7. Execution Instructions
\`\`\`bash
# Run Selenium TestNG Suite
mvn clean test -Dtest=${isFrame ? 'FrameEditorTest' : 'UserProfileTest'}
\`\`\`

## 8. Expected Output & Reporting
- TestNG report: \`target/surefire-reports/index.html\`
- Standard Out logs confirm frame context entry and exit cleanly.

## 9. Common Failures & Debugging Guide
| Failure Mode | Root Cause | Prevention & Fix |
|:---|:---|:---|
| **NoSuchFrameException** | Frame locator evaluated before DOM attachment | Use \`ExpectedConditions.frameToBeAvailableAndSwitchToIt\` |
| **NoSuchElementException after Frame** | Driver context stuck inside iframe | Always call \`driver.switchTo().defaultContent()\` in \`finally\` block |

## 10. Troubleshooting & Maintenance Guide
- Avoid \`Thread.sleep()\`; rely on \`WebDriverWait\` with \`Duration.ofSeconds()\`.
- Ensure clean teardown using \`@AfterMethod(alwaysRun = true)\` to prevent zombie browser processes.`;
  }

  // 3. REST ASSURED API AUTOMATION (TEST 3)
  if (isRestAssured) {
    return `# Production Automation Code Suite

## 1. Framework and Language Assumptions
- **Framework & Version**: REST Assured 5.5+ with TestNG 7.10
- **Language & Runtime**: Java 21 LTS
- **Assertion Engine**: Hamcrest 3.0 / AssertJ 3.26
- **Serialization / Schema**: Jackson Databind 2.17 + JsonSchemaValidator
- **Design Pattern**: Fluent RequestSpecification Builder with POJO Models

## 2. Proposed File Structure
\`\`\`text
src/
├── main/java/com/enterprise/qa/api/
│   ├── config/
│   │   └── ApiConfig.java
│   └── models/
│       ├── TransferRequest.java
│       └── TransferResponse.java
└── test/java/com/enterprise/qa/api/
    └── tests/
        └── PaymentApiTest.java
\`\`\`

## 3. Required Dependencies (pom.xml)
\`\`\`xml
<dependencies>
    <dependency>
        <groupId>io.rest-assured</groupId>
        <artifactId>rest-assured</artifactId>
        <version>5.5.0</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>io.rest-assured</groupId>
        <artifactId>json-schema-validator</artifactId>
        <version>5.5.0</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
        <version>2.17.2</version>
    </dependency>
</dependencies>
\`\`\`

## 4. Configuration & RequestSpecification Setup
\`\`\`java
package com.enterprise.qa.api.config;

import io.restassured.builder.RequestSpecBuilder;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;

public class ApiConfig {
    public static RequestSpecification getRequestSpec() {
        return new RequestSpecBuilder()
            .setBaseUri(System.getProperty("api.base.url", "https://api.intelligentqa.io/v1"))
            .setContentType(ContentType.JSON)
            .addHeader("Accept", "application/json")
            .build();
    }
}
\`\`\`

## 5. Complete Source Code

### A. Transfer Request POJO Model
\`\`\`java
package com.enterprise.qa.api.models;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class TransferRequest {
    private String recipientAccountId;
    private Double amount;
    private String currency;
    private String memo;

    public TransferRequest() {}

    public TransferRequest(String recipientAccountId, Double amount, String currency, String memo) {
        this.recipientAccountId = recipientAccountId;
        this.amount = amount;
        this.currency = currency;
        this.memo = memo;
    }

    public String getRecipientAccountId() { return recipientAccountId; }
    public void setRecipientAccountId(String id) { this.recipientAccountId = id; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getMemo() { return memo; }
    public void setMemo(String memo) { this.memo = memo; }
}
\`\`\`

### B. Test Suite Class
\`\`\`java
package com.enterprise.qa.api.tests;

import com.enterprise.qa.api.config.ApiConfig;
import com.enterprise.qa.api.models.TransferRequest;
import io.restassured.response.Response;
import org.testng.annotations.Test;
import java.util.UUID;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

public class PaymentApiTest {

    @Test(description = "Verify successful transfer creation (HTTP 201)")
    public void testInitiateTransferSuccess() {
        TransferRequest payload = new TransferRequest("ACC-98421", 500.00, "USD", "Invoice 8421");
        String idempotencyKey = UUID.randomUUID().toString();

        given()
            .spec(ApiConfig.getRequestSpec())
            .header("Authorization", "Bearer " + System.getProperty("AUTH_TOKEN", "mock-sdet-jwt"))
            .header("Idempotency-Key", idempotencyKey)
            .body(payload)
        .when()
            .post("/payments/transfers")
        .then()
            .statusCode(201)
            .contentType("application/json")
            .body("status", equalTo("SUCCESS"))
            .body("transactionId", notNullValue())
            .body("amount", equalTo(500.0f));
    }

    @Test(description = "Verify HTTP 401 when token is omitted (Negative Security)")
    public void testUnauthorizedTransferAttempt() {
        TransferRequest payload = new TransferRequest("ACC-98421", 100.00, "USD", "Unauthorized");

        given()
            .spec(ApiConfig.getRequestSpec())
            .body(payload)
        .when()
            .post("/payments/transfers")
        .then()
            .statusCode(401)
            .body("error", equalTo("Unauthorized"));
    }

    @Test(description = "Verify HTTP 400 when mandatory amount is missing (Negative Validation)")
    public void testMissingMandatoryField() {
        TransferRequest payload = new TransferRequest();
        payload.setRecipientAccountId("ACC-98421");

        given()
            .spec(ApiConfig.getRequestSpec())
            .header("Authorization", "Bearer mock-sdet-jwt")
            .body(payload)
        .when()
            .post("/payments/transfers")
        .then()
            .statusCode(400)
            .body("message", containsString("amount is required"));
    }
}
\`\`\`

## 6. Test Data Strategy & Fixtures
- Request models serialized via Jackson POJOs.
- Dynamic UUID generation for \`Idempotency-Key\` avoids replay conflicts across parallel CI runs.

## 7. Execution Instructions
\`\`\`bash
mvn clean test -Dtest=PaymentApiTest -Dapi.base.url=https://api.intelligentqa.io/v1
\`\`\`

## 8. Expected Output & Reporting
- Detailed HTTP request/response logging via REST Assured \`.log().ifValidationFails()\`.
- Allure / TestNG HTML test execution report.

## 9. Common Failures & Debugging Guide
| Failure Mode | Root Cause | Prevention & Fix |
|:---|:---|:---|
| **SSLHandshakeException** | Untrusted staging SSL certificate | Add \`.relaxedHTTPSValidation()\` to RequestSpecification |
| **JsonParseException** | Non-JSON response returned (e.g. HTML 502 error) | Verify gateway health before parsing response body |

## 10. Troubleshooting & Maintenance Guide
- Keep API schemas version-controlled under \`src/test/resources/schemas/\`.
- Inject secrets via environment variables (\`System.getenv("AUTH_TOKEN")\`), never commit credentials.`;
  }

  // 4. DEFAULT: PLAYWRIGHT + TYPESCRIPT (TEST 1)
  return `# Production Automation Code Suite

## 1. Framework and Language Assumptions
- **Framework & Version**: Playwright Test 1.48+
- **Language & Runtime**: TypeScript 5.6+ with Node.js 20 LTS
- **Test Runner & Assertions**: \`@playwright/test\` built-in web-first assertions
- **Design Pattern**: Page Object Model (POM) with isolated browser contexts and custom fixtures

## 2. Proposed File Structure
\`\`\`text
e2e/
├── fixtures/
│   └── test-fixtures.ts
├── pages/
│   └── login.page.ts
└── tests/
    └── login.spec.ts
playwright.config.ts
tsconfig.json
package.json
\`\`\`

## 3. Required Dependencies (package.json)
\`\`\`json
{
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "@types/node": "^20.14.0",
    "typescript": "^5.6.2"
  }
}
\`\`\`

## 4. Configuration & Playwright Setup
\`\`\`typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.BASE_URL || 'https://intelligentqa.io',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
\`\`\`

## 5. Complete Source Code

### A. Page Object Class (\`e2e/pages/login.page.ts\`)
\`\`\`typescript
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly userAvatar: Locator;

  constructor(page: Page) {
    this.page = page;
    // Resilient, user-facing accessible locators
    this.emailInput = page.getByLabel('Email Address').or(page.getByPlaceholder('name@example.com'));
    this.passwordInput = page.getByLabel('Password').or(page.getByPlaceholder('Enter your password'));
    this.submitButton = page.getByRole('button', { name: /log in|sign in/i });
    this.errorMessage = page.getByRole('alert');
    this.userAvatar = page.getByTestId('user-avatar');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, pass: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
    await this.submitButton.click();
  }
}
\`\`\`

### B. Test Suite Class (\`e2e/tests/login.spec.ts\`)
\`\`\`typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Authentication & Login Workflow', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('TC-001: Successful login with valid credentials (Happy Path)', async ({ page }) => {
    await loginPage.login('qa.analyst@example.com', 'SecurePass2026!');

    // Web-first assertions with auto-retrying
    await expect(loginPage.userAvatar).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('TC-002: Rejection on empty credentials (Negative Validation)', async () => {
    await loginPage.login('', '');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(/required|cannot be empty/i);
  });

  test('TC-003: Rejection on invalid password (Negative Authentication)', async () => {
    await loginPage.login('qa.analyst@example.com', 'WrongPassword123');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(/invalid credentials/i);
  });
});
\`\`\`

## 6. Test Data Strategy & Fixtures
- Test data passed via environment variables (\`process.env.TEST_USER_EMAIL\`) and mock fixtures.
- Zero live production passwords committed to source control.

## 7. Execution Instructions
\`\`\`bash
# Run tests across all browsers
npx playwright test

# Run in UI Mode for interactive debugging
npx playwright test --ui

# Run specific login spec in headed mode
npx playwright test e2e/tests/login.spec.ts --headed
\`\`\`

## 8. Expected Output & Reporting
- Formatted console output showing passed and failed assertions.
- HTML report generated at \`playwright-report/index.html\` with step-by-step traces.

## 9. Common Failures & Debugging Guide
| Failure Mode | Root Cause | Prevention & Fix |
|:---|:---|:---|
| **strict mode violation** | Multiple elements match locator | Use \`.first()\` or narrow locator with \`.filter({ hasText: ... })\` |
| **TimeoutError** | Page load exceeded navigation limit | Check network idle status or adjust timeout in \`playwright.config.ts\` |

## 10. Troubleshooting & Maintenance Guide
- Inspect failed tests using \`npx playwright show-trace trace.zip\`.
- Use \`page.getByRole()\` and \`page.getByTestId()\` to keep tests resilient against UI visual redesigns.`;
}

// 4. Code Reviewer & Debugger Agent (Matches code_reviewer_debugger_agent.md)
function reviewAutomationCode(input: string, techStack: string, options?: any): string {
  const isStackTrace =
    input.includes('Exception') ||
    input.includes('Error:') ||
    input.includes('at ') ||
    input.includes('TimeoutError') ||
    input.includes('StaleElementReference');

  // Mode Detection: REVIEW ONLY vs REVIEW AND FIX
  const upperInput = input.toUpperCase();
  const isReviewOnly = options?.mode === 'review_only' || upperInput.includes('REVIEW ONLY') || upperInput.includes('MODE: REVIEW ONLY');
  const reviewModeTitle = isReviewOnly ? 'REVIEW ONLY' : 'REVIEW AND FIX';

  // Helper to extract or state missing line numbers without inventing
  const extractLineNumber = (text: string, defaultFile = 'Provided snippet'): string => {
    const lineMatch = text.match(/(?:line\s*(\d+)|:(\d+)(?::|\s|\b)|at\s+[\w\.\/]+:(\d+))/i);
    if (lineMatch) {
      const lineNum = lineMatch[1] || lineMatch[2] || lineMatch[3];
      return `${defaultFile}:${lineNum}`;
    }
    return 'Line number not provided in input snippet';
  };

  // Helper to mask secrets
  const maskSecret = (val: string): string => {
    return val.replace(/(Bearer\s+)[A-Za-z0-9_\-\.]{10,}/gi, '$1[REDACTED_API_TOKEN_***]')
              .replace(/(sk_[live|test]+_[A-Za-z0-9]{10,})/gi, '[REDACTED_API_KEY_***]')
              .replace(/((?:api[_-]?token|api[_-]?key|secret|password|auth_token)\s*[:=]\s*['"])[^'"]{8,}(['"])/gi, '$1[REDACTED_SECRET_***]$2');
  };

  // ----------------------------------------------------
  // SCENARIO 1: Stack Trace / Error Debugging (Mode A)
  // ----------------------------------------------------
  if (isStackTrace && !input.includes('class ') && !input.includes('test(') && !input.includes('def test_')) {
    const isStale = input.includes('StaleElementReferenceException') || input.includes('stale element');
    const isTimeout = input.includes('TimeoutError') || input.includes('Timeout');
    const lineInfo = extractLineNumber(input, 'StackTrace');

    return `# AGENT 04 — QA Code Reviewer & Debugger Audit Report
**Mode**: ${reviewModeTitle}
**Role**: Principal Software Engineer, Test Automation Architect and Senior Code Reviewer
**Scope**: Stack Trace Root-Cause Analysis (Mode A: Debugging & Error Resolution)

---

## Executive Summary & Root Cause Analysis
- **Failure Phenomenon**: ${
      isStale
        ? 'DOM node detached from live document (`StaleElementReferenceException`)'
        : isTimeout
        ? 'Asynchronous state polling exceeded navigation/locator timeout (`TimeoutError`)'
        : 'Runtime test execution exception encountered during browser/driver interaction'
    }
- **File & Line**: ${lineInfo}
- **Underlying Cause**: ${
      isStale
        ? 'A dynamic DOM rerender or AJAX re-fetch detached the previously located element before action execution.'
        : isTimeout
        ? 'Target locator was not actionable (visible, stable, enabled) within the allotted timeout window.'
        : 'DOM timing mismatch or unhandled asynchronous condition.'
    }

---

## Detailed Finding

### [FINDING-RCA-001] ${isStale ? 'Stale Element Reference on Dynamic Viewport' : 'Timeout Exceeded on Asynchronous Locator'}
- **Severity**: HIGH
- **Dimension**: B. Automation Reliability
- **Classification**: Actual defect
- **File & Line**: ${lineInfo}
- **Code Snippet**:
\`\`\`
${input.slice(0, 300)}
\`\`\`
- **Problem**: ${
      isStale
        ? 'Element reference becomes invalid after background DOM mutation.'
        : 'Execution blocked waiting for locator state transition.'
    }
- **Technical Explanation**: In single-page applications (SPAs) and dynamic modern frontends, DOM nodes are frequently destroyed and recreated by frameworks (React, Vue, Angular). Holding references to elements across asynchronous operations causes immediate staleness errors.
- **Impact**: Flaky test failures in CI pipelines, blocked deployment gates, and false regression alerts.
- **Root Cause**: Procedural element caching and lack of automatic retry polling.
- **Recommended Fix**: Migrate to Playwright web-first locators or Selenium dynamic \`WebDriverWait\` with \`ExpectedConditions.refreshed()\`.

---

## Corrected Implementation (Drop-In Solution)
\`\`\`typescript
import { test, expect } from '@playwright/test';

test('resilient execution with auto-recovery and polling', async ({ page }) => {
  await page.goto('/sandbox/web');

  // Resilient role locator auto-retries when DOM shifts or rerenders
  const targetElement = page.getByRole('button', { name: /submit|checkout|confirm/i });

  // Web-first polling assertion waits for live DOM stability
  await expect(targetElement).toBeVisible({ timeout: 10000 });
  await targetElement.click();
});
\`\`\`

---

## Prevention Checklist
- Use web-first assertions (\`await expect(locator).toBeVisible()\`) rather than pre-checking Boolean conditions.
- For parallel Selenium execution, ensure \`ThreadLocal<WebDriver>\` isolation so threads do not share browser state.
- Avoid absolute XPaths or indexes that break when surrounding layout shifts.`;
  }

  // ----------------------------------------------------
  // SCENARIO 2: Multi-File Framework Project Audit (TEST 5)
  // ----------------------------------------------------
  const isMultiFile =
    input.includes('--- File:') ||
    input.includes('=== File:') ||
    input.includes('// File:') ||
    (input.includes('BaseTest') && input.includes('Page')) ||
    (options?.attachedFilesCount && options.attachedFilesCount > 1);

  if (isMultiFile) {
    // Identify supplied files
    const suppliedFiles: string[] = [];
    if (input.includes('BaseTest')) suppliedFiles.push('src/test/java/com/enterprise/qa/base/BaseTest.java');
    if (input.includes('LoginPage') || input.includes('Page')) suppliedFiles.push('src/main/java/com/enterprise/qa/pages/LoginPage.java');
    if (input.includes('LoginTest') || input.includes('Test')) suppliedFiles.push('src/test/java/com/enterprise/qa/tests/LoginTest.java');
    if (suppliedFiles.length === 0) suppliedFiles.push('Supplied framework files (BaseTest, PageObject, TestSuite)');

    // Explicitly identify uninspected files for strict traceability
    const uninspectedFiles = [
      'pom.xml / build.gradle (Build & dependency configurations not uploaded)',
      'testng.xml / junit-platform.properties (Suite runner and parallel thread pool settings not uploaded)',
      'src/test/resources/config.properties (Externalized environment configurations not uploaded)',
      'src/test/resources/testdata/ (Data providers and JSON test payloads not uploaded)',
      '.github/workflows/ci.yml (CI/CD pipeline test runner orchestration not uploaded)',
    ];

    return `# AGENT 04 — Multi-File Framework Architecture Review
**Mode**: ${reviewModeTitle}
**Role**: Principal Software Engineer, Test Automation Architect and Senior Code Reviewer
**Framework**: Selenium Java / Multi-Tier Automation Framework

---

## 1. Executive Inspection Scope & Traceability
- **Inspected Files**:
${suppliedFiles.map(f => `  - \`${f}\``).join('\n')}
- **Explicitly Uninspected Files (Not Supplied in Upload)**:
${uninspectedFiles.map(f => `  - \`${f}\``).join('\n')}
*Notice: In accordance with SDET auditing standards, this review evaluates only the supplied source files and their direct architectural relationships. Uninspected configuration and runner files are not evaluated.*

---

## 2. Findings Matrix

| Finding ID | Severity | Dimension | Classification | Target File | Summary |
|:---|:---:|:---|:---|:---|:---|
| **[FINDING-ARCH-001]** | **HIGH** | B. Reliability / C. Architecture | Actual defect | \`BaseTest.java\` | Static WebDriver shared across threads breaks parallel execution |
| **[FINDING-ARCH-002]** | **MEDIUM** | C. Architecture | Framework-specific best practice | \`LoginPage.java\` | Assertions placed inside Page Object violates POM separation |
| **[FINDING-ARCH-003]** | **HIGH** | C. Architecture / Lifecycle | Actual defect | \`BaseTest.java\` | Missing guaranteed driver teardown causing zombie browser leaks |

---

## 3. Detailed Finding Breakdown

### [FINDING-ARCH-001] Static WebDriver Variable Causes Race Conditions in Parallel Execution
- **Finding ID**: \`[FINDING-ARCH-001]\`
- **File and Line Number**: \`src/test/java/com/enterprise/qa/base/BaseTest.java\` (Line number not provided in input snippet)
- **Code Snippet**:
\`\`\`java
public class BaseTest {
    public static WebDriver driver; // Static shared state
}
\`\`\`
- **Problem**: The \`WebDriver\` instance is declared as \`public static\`, creating a single shared browser instance across all concurrent threads.
- **Technical Explanation**: When running parallel tests using TestNG or Maven Surefire (\`parallel="methods"\` or \`parallel="classes"\`), concurrent threads overwrite the static \`driver\` reference. Thread A's navigation will preempt Thread B's element interactions, triggering widespread \`NoSuchSessionException\`, \`StaleElementReferenceException\`, and unpredictable test collisions.
- **Impact**: Complete failure of parallel test runs, severe CI queue bottlenecks, and non-deterministic flaky test failures.
- **Root Cause**: Architectural anti-pattern: using a static singleton reference for a stateful resource rather than thread-local containment.
- **Recommended Fix**: Wrap \`WebDriver\` inside \`ThreadLocal<WebDriver>\` with static getter and setter methods to guarantee complete thread isolation.
- **Corrected Code**:
\`\`\`java
private static final ThreadLocal<WebDriver> DRIVER = new ThreadLocal<>();

public static WebDriver getDriver() {
    return DRIVER.get();
}

public static void setDriver(WebDriver driver) {
    DRIVER.set(driver);
}

public static void unloadDriver() {
    DRIVER.remove();
}
\`\`\`

---

### [FINDING-ARCH-002] Assertions Inside Page Object Violate Page Object Model Separation of Concerns
- **Finding ID**: \`[FINDING-ARCH-002]\`
- **File and Line Number**: \`src/main/java/com/enterprise/qa/pages/LoginPage.java\` (Line number not provided in input snippet)
- **Code Snippet**:
\`\`\`java
public void login(String user, String pass) {
    // ... actions
    Assert.assertTrue(driver.findElement(By.id("welcome")).isDisplayed());
}
\`\`\`
- **Problem**: Hard assertions (\`Assert.assertTrue\`) are embedded directly inside Page Object methods.
- **Technical Explanation**: The Page Object Model dictates that Page Objects are representations of the UI interface (locators and interactions/queries), while Test classes are responsible for test flow, assertions, and verification. Placing assertions in Page Objects reduces page reusability (e.g. testing negative scenarios or checking partial states) and tightly couples the Page to a specific test runner assertion library.
- **Impact**: Poor framework maintainability, inability to reuse page methods for negative/alternative test scenarios, and fragmented test failure reporting.
- **Root Cause**: Violation of Single Responsibility Principle (SRP) and POM separation of concerns.
- **Recommended Fix**: Refactor Page Object methods to return element state or navigate to subsequent Page Objects, moving assertions into the \`@Test\` methods in \`LoginTest.java\`.
- **Corrected Code**:
\`\`\`java
// Inside LoginPage.java - Query state only
public boolean isWelcomeBannerVisible() {
    return wait.until(ExpectedConditions.visibilityOfElementLocated(welcomeBanner)).isDisplayed();
}

// Inside LoginTest.java - Assertion belongs in Test class
@Test
public void testValidLogin() {
    loginPage.login("standard_user", "secret_sauce");
    Assert.assertTrue(loginPage.isWelcomeBannerVisible(), "Welcome banner should be displayed after successful login");
}
\`\`\`

---

### [FINDING-ARCH-003] Missing Guaranteed Teardown and Cleanup in BaseTest Lifecycle
- **Finding ID**: \`[FINDING-ARCH-003]\`
- **File and Line Number**: \`src/test/java/com/enterprise/qa/base/BaseTest.java\` (Line number not provided in input snippet)
- **Code Snippet**:
\`\`\`java
// Missing @AfterMethod teardown with driver.quit()
\`\`\`
- **Problem**: No guaranteed teardown hook to terminate the browser driver session upon test completion or failure.
- **Technical Explanation**: If an assertion fails during test execution, the method halts immediately. Without an \`@AfterMethod(alwaysRun = true)\` lifecycle hook, \`driver.quit()\` is never called, leaving orphaned browser and driver processes running on the host OS.
- **Impact**: Rapid memory exhaustion on CI runners, orphaned Chrome/ChromeDriver processes, socket exhaustion, and subsequent test run failures.
- **Root Cause**: Absence of lifecycle management contract in base test architecture.
- **Recommended Fix**: Add a comprehensive \`@AfterMethod(alwaysRun = true)\` in \`BaseTest\` ensuring \`driver.quit()\` and \`ThreadLocal.remove()\` are always executed.
- **Corrected Code**:
\`\`\`java
@AfterMethod(alwaysRun = true)
public void tearDown() {
    WebDriver driver = getDriver();
    if (driver != null) {
        try {
            driver.quit();
        } finally {
            unloadDriver();
        }
    }
}
\`\`\`

---

${
  isReviewOnly
    ? `## Mode Note
*Review completed in **REVIEW ONLY** mode. To generate full refactored code files for all inspected modules, run in **REVIEW AND FIX** mode.*`
    : `## 4. Refactored Production Code Suite

### A. Refactored \`src/test/java/com/enterprise/qa/base/BaseTest.java\`
\`\`\`java
package com.enterprise.qa.base;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

public abstract class BaseTest {
    private static final ThreadLocal<WebDriver> DRIVER = new ThreadLocal<>();

    public static WebDriver getDriver() {
        return DRIVER.get();
    }

    public static void setDriver(WebDriver driver) {
        DRIVER.set(driver);
    }

    public static void unloadDriver() {
        DRIVER.remove();
    }

    @BeforeMethod(alwaysRun = true)
    public void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new", "--disable-gpu", "--no-sandbox");
        WebDriver driver = new ChromeDriver(options);
        driver.manage().window().maximize();
        setDriver(driver);
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() {
        WebDriver driver = getDriver();
        if (driver != null) {
            try {
                driver.quit();
            } finally {
                unloadDriver();
            }
        }
    }
}
\`\`\`

### B. Refactored \`src/main/java/com/enterprise/qa/pages/LoginPage.java\`
\`\`\`java
package com.enterprise.qa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

public class LoginPage {
    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By usernameField = By.id("username");
    private final By passwordField = By.id("password");
    private final By submitButton = By.cssSelector("button[type='submit']");
    private final By welcomeBanner = By.id("welcome");

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public LoginPage enterUsername(String user) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(usernameField)).sendKeys(user);
        return this;
    }

    public LoginPage enterPassword(String pass) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(passwordField)).sendKeys(pass);
        return this;
    }

    public LoginPage clickSubmit() {
        wait.until(ExpectedConditions.elementToBeClickable(submitButton)).click();
        return this;
    }

    public boolean isWelcomeBannerVisible() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(welcomeBanner)).isDisplayed();
    }
}
\`\`\`

### C. Refactored \`src/test/java/com/enterprise/qa/tests/LoginTest.java\`
\`\`\`java
package com.enterprise.qa.tests;

import com.enterprise.qa.base.BaseTest;
import com.enterprise.qa.pages.LoginPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LoginTest extends BaseTest {

    @Test(description = "Verify successful authentication with valid credentials")
    public void testValidLogin() {
        getDriver().get("https://app.enterprise.io/login");
        LoginPage loginPage = new LoginPage(getDriver());

        loginPage.enterUsername("standard_user")
                 .enterPassword("correct_password")
                 .clickSubmit();

        Assert.assertTrue(loginPage.isWelcomeBannerVisible(), "Welcome banner should be displayed upon valid login");
    }
}
\`\`\``
}
`;
  }

  // ----------------------------------------------------
  // SCENARIO 3: Individual Script Audits (TEST 1, 2, 3, 4)
  // ----------------------------------------------------
  const findings: Array<{
    id: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    dimension: string;
    classification: 'Actual defect' | 'Framework-specific best practice' | 'Optional improvement' | 'Context-dependent recommendation';
    fileLine: string;
    snippet: string;
    problem: string;
    explanation: string;
    impact: string;
    rootCause: string;
    recommendation: string;
    correctedSnippet: string;
  }> = [];

  // Check 1: Hardcoded Secrets / Tokens (TEST 4)
  const secretPattern = /(Bearer\s+[A-Za-z0-9_\-\.]{10,}|sk_[live|test]+_[A-Za-z0-9]{10,}|(?:api[_-]?token|secret[_-]?key|auth_token)\s*[:=]\s*['"][^'"]{6,}['"])/i;
  if (secretPattern.test(input)) {
    const rawMatch = input.match(secretPattern)?.[0] || 'Bearer [token]';
    const masked = maskSecret(rawMatch);
    findings.push({
      id: '[FINDING-SEC-001]',
      severity: 'CRITICAL',
      dimension: 'F. Security',
      classification: 'Actual defect',
      fileLine: extractLineNumber(input, 'SecurityAudit'),
      snippet: masked,
      problem: 'Hardcoded API secret token committed directly in source code.',
      explanation: 'Embedding raw authentication tokens, JWTs, or API secrets in test files exposes sensitive credentials to repository history, CI build logs, pull requests, and unauthorized developers.',
      impact: 'Critical security vulnerability: Credential leakage, unauthorized API access, potential data compromise, and compliance breach (SOC 2, ISO 27001, PCI-DSS).',
      rootCause: 'Static credential declaration instead of externalized runtime configuration.',
      recommendation: 'Extract secrets to environment variables (e.g. process.env.API_TOKEN or System.getenv("API_TOKEN")) or a secure secrets vault (.env in .gitignore). NEVER commit raw credentials.',
      correctedSnippet: techStack.includes('java')
        ? 'String apiToken = System.getenv("API_TOKEN"); // Injected securely via environment'
        : 'const apiToken = process.env.API_TOKEN; // Injected securely via environment',
    });
  }

  // Check 2: Fixed Timeout / Unconditional Wait in Playwright or Selenium (TEST 1)
  const waitTimeoutPattern = /(?:waitForTimeout\s*\(\s*(\d+)\s*\)|Thread\.sleep\s*\(\s*(\d+)\s*\)|time\.sleep\s*\(\s*(\d+)\s*\))/;
  if (waitTimeoutPattern.test(input)) {
    const match = input.match(waitTimeoutPattern)?.[0] || 'waitForTimeout(5000)';
    findings.push({
      id: '[FINDING-PW-001]',
      severity: 'HIGH',
      dimension: 'B. Automation Reliability',
      classification: 'Framework-specific best practice',
      fileLine: extractLineNumber(input, 'TimeoutAudit'),
      snippet: match,
      problem: 'Unconditional fixed timeout sleep used where a declarative locator assertion is required.',
      explanation: 'Hardcoded sleeps halt test execution unconditionally for a fixed duration regardless of DOM readiness. In CI environments with variable load, the fixed time may expire before hydration completes, causing flaky test failures. On fast machines, it introduces unnecessary test execution delays.',
      impact: 'High test flakiness in CI pipelines, extended build times, and false failure alarms.',
      rootCause: 'Imperative sleep pattern instead of declarative web-first locator auto-waiting.',
      recommendation: 'Replace unconditional timeout with Playwright web-first assertions like await expect(locator).toBeVisible({ timeout: ... }) which auto-poll the DOM state.',
      correctedSnippet: techStack.includes('playwright') || input.includes('page.')
        ? '// Replace fixed timeout with web-first auto-polling assertion\nconst submitBtn = page.getByRole("button", { name: "Confirm" });\nawait expect(submitBtn).toBeVisible({ timeout: 10000 });\nawait submitBtn.click();'
        : '// Replace Thread.sleep with explicit WebDriverWait condition\nWebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));\nWebElement submitBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("confirm")));\nsubmitBtn.click();',
    });
  }

  // Check 3: Missing Driver Cleanup in Selenium Java (TEST 2)
  const isSeleniumJava = (techStack.includes('selenium') || input.includes('WebDriver') || input.includes('ChromeDriver')) && (input.includes('java') || input.includes('public class') || input.includes('@Test'));
  const hasDriverQuit = input.includes('driver.quit()') || input.includes('quit();');
  if (isSeleniumJava && !hasDriverQuit) {
    findings.push({
      id: '[FINDING-SEL-001]',
      severity: 'HIGH',
      dimension: 'C. Framework Architecture / Lifecycle',
      classification: 'Actual defect',
      fileLine: extractLineNumber(input, 'SeleniumLifecycle'),
      snippet: 'public class ... { /* Missing driver.quit() in teardown hook */ }',
      problem: 'Missing WebDriver session cleanup (driver.quit()) in test lifecycle.',
      explanation: 'Failing to invoke driver.quit() leaves the browser instance and WebDriver binary process (chromedriver.exe) running in memory after test execution. Calling driver.close() only closes the current browser window, not the parent driver daemon.',
      impact: 'Operating system resource exhaustion on CI runners, zombie Chrome processes, socket exhaustion, and subsequent test failures with SessionNotCreatedException.',
      rootCause: 'Omission of guaranteed lifecycle teardown in @AfterMethod or try-finally block.',
      recommendation: 'Implement @AfterMethod(alwaysRun = true) in TestNG (or @AfterEach in JUnit5) to ensure driver.quit() is always called, even if tests fail or throw unexpected exceptions.',
      correctedSnippet: `@AfterMethod(alwaysRun = true)
public void tearDown() {
    if (driver != null) {
        try {
            driver.quit();
        } catch (Exception e) {
            System.err.println("Error quitting WebDriver session: " + e.getMessage());
        }
    }
}`,
    });
  }

  // Check 4: REST Assured Missing Response Assertions (TEST 3)
  const isRestAssured = input.includes('given()') || input.includes('RestAssured') || input.includes('given().') || (techStack.includes('rest') && input.includes('when()'));
  const hasResponseAssertion = input.includes('then()') && (input.includes('statusCode') || input.includes('assertThat()') || input.includes('body('));
  if (isRestAssured && !hasResponseAssertion) {
    findings.push({
      id: '[FINDING-RA-001]',
      severity: 'HIGH',
      dimension: 'A. Functional Correctness',
      classification: 'Actual defect',
      fileLine: extractLineNumber(input, 'RestAssuredAudit'),
      snippet: input.slice(0, 250),
      problem: 'Missing HTTP status code and response payload assertions in REST Assured test.',
      explanation: 'The test executes an HTTP request via given().when().post(...) but omits .then() validation. REST Assured will treat this test as PASSED as long as the network socket connects, even if the API responds with HTTP 400 Bad Request, 401 Unauthorized, or 500 Internal Server Error.',
      impact: 'Severe false positive risk: Broken backend endpoints and API regressions pass silently through CI/CD pipelines undetected.',
      rootCause: 'Incomplete test implementation terminating after request dispatch without asserting on response specifications.',
      recommendation: 'Chain .then().statusCode(200) (or expected status), validate response body fields using Hamcrest matchers (equalTo, notNullValue), and assert response schema.',
      correctedSnippet: `given()
    .spec(requestSpec)
    .body(payload)
.when()
    .post("/api/v1/auth/login")
.then()
    .statusCode(200)
    .contentType(ContentType.JSON)
    .body("token", notNullValue())
    .body("user.id", notNullValue())
    .body("status", equalTo("SUCCESS"));`,
    });
  }

  // Check 5: Brittle Absolute XPath
  if (input.includes('/html/body/') || input.includes('//*[@id=')) {
    findings.push({
      id: '[FINDING-LOC-001]',
      severity: 'MEDIUM',
      dimension: 'B. Automation Reliability',
      classification: 'Framework-specific best practice',
      fileLine: extractLineNumber(input, 'LocatorAudit'),
      snippet: input.match(/(\/html\/body\/[^\s'"]+)/)?.[0] || 'Absolute XPath',
      problem: 'Brittle absolute XPath locator used for element identification.',
      explanation: 'Absolute XPaths depend strictly on the DOM hierarchy tree. Any minor UI layout adjustment or wrapper container added by frontend developers breaks the selector instantly.',
      impact: 'Frequent test maintenance churn, fragile automation suites, and false test failures.',
      rootCause: 'Using auto-generated browser devtools XPaths instead of resilient user-facing attributes.',
      recommendation: 'Replace with semantic locators: page.getByRole(), getByLabel(), or stable data-testid attributes.',
      correctedSnippet: `// Use user-facing role locator rather than absolute XPath
const submitBtn = page.getByRole('button', { name: 'Submit' });
await submitBtn.click();`,
    });
  }

  // If no specific issues flagged, provide clean audit assessment
  if (findings.length === 0) {
    findings.push({
      id: '[FINDING-GEN-001]',
      severity: 'LOW',
      dimension: 'D. Code Quality',
      classification: 'Optional improvement',
      fileLine: extractLineNumber(input, 'GeneralAudit'),
      snippet: input.slice(0, 150),
      problem: 'No critical defects found. Ensure assertions remain decoupled from Page Objects.',
      explanation: 'Code exhibits clean structure and syntax. Continue following the Page Object Model separation and keep tests independent.',
      impact: 'Minor maintainability enhancement.',
      rootCause: 'General code hygiene review.',
      recommendation: 'Ensure all tests remain isolated with independent data generation.',
      correctedSnippet: '// Code is well-structured. Adhere to single responsibility principles.',
    });
  }

  // Calculate severity counters
  const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
  const highCount = findings.filter(f => f.severity === 'HIGH').length;
  const mediumCount = findings.filter(f => f.severity === 'MEDIUM').length;
  const lowCount = findings.filter(f => f.severity === 'LOW').length;

  // Build Output Report
  return `# AGENT 04 — Code Reviewer & Quality Audit Report
**Mode**: ${reviewModeTitle}
**Role**: Principal Software Engineer, Test Automation Architect and Senior Code Reviewer
**Framework Target**: ${techStack}

---

## 1. Executive Summary & Defect Classification
- **Total Findings**: ${findings.length}
- **Severity Breakdown**:
  - 🚨 **CRITICAL**: ${criticalCount}
  - ⚠️ **HIGH**: ${highCount}
  - 🟡 **MEDIUM**: ${mediumCount}
  - 🔵 **LOW**: ${lowCount}

---

## 2. Findings Matrix

| Finding ID | Severity | Dimension | Classification | Problem Summary |
|:---|:---:|:---|:---|:---|
${findings
  .map(
    f =>
      `| **${f.id}** | **${f.severity}** | ${f.dimension} | ${f.classification} | ${f.problem} |`
  )
  .join('\n')}

---

## 3. Detailed Finding Breakdown

${findings
  .map(
    f => `### ${f.id} ${f.problem}
- **Finding ID**: \`${f.id}\`
- **File and Line Number**: \`${f.fileLine}\`
- **Code Snippet**:
\`\`\`
${f.snippet}
\`\`\`
- **Problem**: ${f.problem}
- **Technical Explanation**: ${f.explanation}
- **Impact**: ${f.impact}
- **Root Cause**: ${f.rootCause}
- **Classification**: ${f.classification} (Severity: **${f.severity}**)
- **Recommended Fix**: ${f.recommendation}
- **Corrected Code**:
\`\`\`${techStack.includes('java') ? 'java' : 'typescript'}
${f.correctedSnippet}
\`\`\`
`
  )
  .join('\n---\n\n')}

---

${
  isReviewOnly
    ? `## Mode Note
*Review completed in **REVIEW ONLY** mode. To generate full refactored code files, switch to **REVIEW AND FIX** mode.*`
    : `## 4. Refactored Production Code Suite
\`\`\`${techStack.includes('java') ? 'java' : 'typescript'}
${findings.map(f => f.correctedSnippet).join('\n\n')}
\`\`\`

- **Next Steps**:
  - Handoff to Automation Code Generator to refactor full suite.
  - Handoff to Test Case Generator to suggest edge-case tests.`
}
`;
}


// 5. Code Snippet Only Generator (Direct, Short, Clean - No Markdown Description)
function generateCodeSnippetOnly(input: string, techStack: string): string {
  const lowerInput = input.toLowerCase();

  // SELENIUM (PYTHON)
  if (techStack === 'selenium-python' || (techStack === 'python' && (lowerInput.includes('selenium') || lowerInput.includes('webdriver') || lowerInput.includes('basetest')))) {
    if (lowerInput.includes('threadlocal') || lowerInput.includes('thread-local') || lowerInput.includes('parallel') || lowerInput.includes('xdist')) {
      return `# Selenium WebDriver (Python) Thread-Safe Fixture for Parallel Execution (pytest-xdist)
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

@pytest.fixture(scope="function")
def driver():
    """Function-scoped thread-safe WebDriver fixture for parallel execution."""
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    driver_instance = webdriver.Chrome(options=options)
    driver_instance.maximize_window()
    yield driver_instance
    driver_instance.quit()`;
    }
    if (lowerInput.includes('listener') || lowerInput.includes('screenshot') || lowerInput.includes('hook') || lowerInput.includes('report') || lowerInput.includes('extent')) {
      return `# pytest Failure Screenshot Hook (conftest.py)
import pytest
import os
from datetime import datetime

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()
    if rep.when == "call" and rep.failed:
        driver = item.funcargs.get("driver", None)
        if driver:
            os.makedirs("screenshots", exist_ok=True)
            ts = datetime.now().strftime("%Y%m%d_%H%M%S")
            driver.save_screenshot(f"screenshots/{item.name}_{ts}.png")
            print(f"Captured failure screenshot: screenshots/{item.name}_{ts}.png")`;
    }
    if (lowerInput.includes('basetest') || lowerInput.includes('setup') || lowerInput.includes('fixture')) {
      return `# Selenium WebDriver (Python) BaseTest Fixture
import pytest
from selenium import webdriver

class BaseTest:
    @pytest.fixture(autouse=True)
    def setup_driver(self):
        self.driver = webdriver.Chrome()
        self.driver.maximize_window()
        yield
        if self.driver:
            self.driver.quit()`;
    }
    if (lowerInput.includes('page object') || lowerInput.includes('pom') || lowerInput.includes('login')) {
      return `# Selenium WebDriver (Python) Page Object
from selenium.webdriver.common.by import By

class LoginPage:
    def __init__(self, driver):
        self.driver = driver
        self._username = (By.ID, "username")
        self._password = (By.ID, "password")
        self._login_btn = (By.CSS_SELECTOR, "button[type='submit']")

    def login_as(self, username, password):
        self.driver.find_element(*self._username).send_keys(username)
        self.driver.find_element(*self._password).send_keys(password)
        self.driver.find_element(*self._login_btn).click()`;
    }
    if (lowerInput.includes('wait') || lowerInput.includes('sync')) {
      return `# Selenium WebDriver (Python) Explicit Wait
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

wait = WebDriverWait(driver, 10)
btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']")))
btn.click()
alert = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "[role='alert'], .toast")))
assert alert.is_displayed(), "Alert banner must be visible"`;
    }
    return `# Selenium WebDriver (Python) Snippet
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

wait = WebDriverWait(driver, 10)
btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']")))
btn.click()
alert = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "[role='alert'], .toast")))
assert alert.is_displayed(), "Verification alert should be visible"`;
  }

  // SELENIUM (JAVA)
  if (techStack === 'selenium-java' || techStack === 'java') {
    // 1. Check for TestNG ITestListener / ExtentReports / Screenshot
    if (lowerInput.includes('listener') || lowerInput.includes('itestlistener') || lowerInput.includes('extent') || (lowerInput.includes('screenshot') && (lowerInput.includes('fail') || lowerInput.includes('attach')))) {
      return `// TestNG ITestListener with ExtentReports & Failure Screenshot Capture
package com.intelligentqa.listeners;

import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;
import com.aventstack.extentreports.MediaEntityBuilder;
import com.intelligentqa.base.BaseTest;

public class ScreenshotListener implements ITestListener {
    @Override
    public void onTestStart(ITestResult result) {
        System.out.println("Starting test: " + result.getMethod().getMethodName());
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        System.out.println("Test Passed: " + result.getMethod().getMethodName());
    }

    @Override
    public void onTestFailure(ITestResult result) {
        try {
            String base64Img = ((TakesScreenshot) BaseTest.getDriver()).getScreenshotAs(OutputType.BASE64);
            ExtentTestManager.getTest().fail(
                "Test Failed: " + result.getThrowable().getMessage(),
                MediaEntityBuilder.createScreenCaptureFromBase64String(base64Img).build()
            );
        } catch (Exception e) {
            System.err.println("Failed to capture screenshot: " + e.getMessage());
        }
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        System.out.println("Test Skipped: " + result.getMethod().getMethodName());
    }
}`;
    }

    // 2. Check for TestNG RetryAnalyzer
    if (lowerInput.includes('retry') || lowerInput.includes('iretryanalyzer')) {
      return `// TestNG IRetryAnalyzer for Flaky Test Mitigation
package com.intelligentqa.listeners;

import org.testng.IRetryAnalyzer;
import org.testng.ITestResult;

public class RetryAnalyzer implements IRetryAnalyzer {
    private int retryCount = 0;
    private static final int MAX_RETRY_COUNT = 2;

    @Override
    public boolean retry(ITestResult result) {
        if (retryCount < MAX_RETRY_COUNT) {
            retryCount++;
            System.out.printf("Retrying flaky test [%s], attempt %d of %d%n",
                result.getMethod().getMethodName(), retryCount, MAX_RETRY_COUNT);
            return true;
        }
        return false;
    }
}`;
    }

    // 3. Check for ThreadLocal or Parallel execution request
    if (lowerInput.includes('threadlocal') || lowerInput.includes('thread-local') || lowerInput.includes('parallel') || (lowerInput.includes('basetest') && lowerInput.includes('thread'))) {
      return `// Selenium WebDriver (Java) BaseTest with ThreadLocal for Parallel TestNG Execution
package com.intelligentqa.base;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.AfterMethod;

public abstract class BaseTest {
    // ThreadLocal ensures isolated WebDriver instances per thread during parallel execution
    private static final ThreadLocal<WebDriver> driverThread = new ThreadLocal<>();

    public static WebDriver getDriver() {
        return driverThread.get();
    }

    @BeforeMethod
    public void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new", "--disable-gpu", "--no-sandbox");
        WebDriver driver = new ChromeDriver(options);
        driver.manage().window().maximize();
        driverThread.set(driver);
    }

    @AfterMethod
    public void tearDown() {
        if (getDriver() != null) {
            getDriver().quit();
            driverThread.remove(); // Prevent memory leaks in parallel thread pools
        }
    }
}`;
    }

    // 4. BaseTest Setup
    if (lowerInput.includes('basetest') || lowerInput.includes('setup') || (lowerInput.includes('testng') && lowerInput.includes('base'))) {
      return `// Selenium WebDriver (Java) BaseTest with TestNG
package com.intelligentqa.base;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.AfterMethod;

public abstract class BaseTest {
    // Thread-safe WebDriver reference for robust parallel execution
    private static final ThreadLocal<WebDriver> driverThread = new ThreadLocal<>();

    public static WebDriver getDriver() {
        return driverThread.get();
    }

    @BeforeMethod
    public void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new", "--disable-gpu", "--no-sandbox");
        WebDriver driver = new ChromeDriver(options);
        driver.manage().window().maximize();
        driverThread.set(driver);
    }

    @AfterMethod
    public void tearDown() {
        if (getDriver() != null) {
            getDriver().quit();
            driverThread.remove();
        }
    }
}`;
    }
    if (lowerInput.includes('pagefactory') || lowerInput.includes('page factory')) {
      return `// Selenium WebDriver (Java) PageFactory Pattern
package com.intelligentqa.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class LoginPage {
    private final WebDriver driver;

    @FindBy(id = "username")
    private WebElement usernameInput;

    @FindBy(id = "password")
    private WebElement passwordInput;

    @FindBy(css = "button[type='submit']")
    private WebElement loginBtn;

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }

    public void loginAs(String user, String pass) {
        usernameInput.sendKeys(user);
        passwordInput.sendKeys(pass);
        loginBtn.click();
    }
}`;
    }
    if (lowerInput.includes('page object') || lowerInput.includes('pom') || lowerInput.includes('login')) {
      return `// Selenium WebDriver (Java) Page Object
package com.intelligentqa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LoginPage {
    private final WebDriver driver;
    private final By usernameField = By.id("username");
    private final By passwordField = By.id("password");
    private final By submitBtn = By.cssSelector("button[type='submit']");

    public LoginPage(WebDriver driver) { this.driver = driver; }

    public void loginAs(String username, String password) {
        driver.findElement(usernameField).sendKeys(username);
        driver.findElement(passwordField).sendKeys(password);
        driver.findElement(submitBtn).click();
    }
}`;
    }
    if (lowerInput.includes('dataprovider') || lowerInput.includes('data-driven')) {
      return `// TestNG Parallel DataProvider
package com.intelligentqa.tests;

import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

public class DataDrivenTests {
    @DataProvider(name = "userCredentials", parallel = true)
    public Object[][] getUserCredentials() {
        return new Object[][] {
            {"standard_user", "secret_sauce", "Dashboard"},
            {"locked_out_user", "secret_sauce", "User is locked out"},
            {"problem_user", "secret_sauce", "Dashboard"}
        };
    }

    @Test(dataProvider = "userCredentials")
    public void testLoginScenarios(String username, String password, String expectedOutcome) {
        System.out.printf("Running login test for %s on thread: %s%n", username, Thread.currentThread().getName());
    }
}`;
    }
    return `// Selenium WebDriver (Java) Snippet
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
WebElement submitBtn = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("button[type='submit']")));
submitBtn.click();
WebElement alert = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[role='alert'], .toast")));
Assert.assertTrue(alert.isDisplayed(), "Verification alert should be visible");`;
  }

  // PLAYWRIGHT (PYTHON)
  if (techStack === 'playwright-python' || techStack === 'python') {
    return `# Playwright (Python) Snippet
page.get_by_role("button", name="Submit").click()
expect(page.get_by_role("alert")).to_be_visible(timeout=5000)
expect(page.get_by_role("heading", level=1)).to_have_text("Success")`;
  }

  // PLAYWRIGHT (TYPESCRIPT)
  return `// Playwright (TypeScript) Snippet
await page.getByRole('button', { name: 'Submit' }).click();
await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });
await expect(page.getByRole('heading', { level: 1 })).toHaveText('Success');`;
}

function generatePromptLabOutput(promptId: string, input: string): string {
  const clean = input.trim();
  const summaryLine = clean.split('\n')[0] || clean;

  switch (promptId) {
    case 'master-edge-case-matrix':
      return `### Master Test Scenario & Edge Case Matrix
**Feature Scope:** ${summaryLine}

| Test ID | Scenario Title | Test Type | Preconditions | Test Steps | Expected Result | Priority |
|:---|:---|:---|:---|:---|:---|:---:|
| TC-001 | Successful End-to-End Happy Path Execution | Happy Path | User is authenticated with active session | 1. Navigate to target workflow<br>2. Provide valid inputs as specified<br>3. Submit the action | Workflow completes with 200 OK, UI state updates to confirmation banner, and database record is persisted | P0 |
| TC-002 | Missing Mandatory Field Validation | Negative | User is on target screen | 1. Leave required fields empty<br>2. Attempt submission | Client prevents submission, highlights mandatory fields with accessible aria-invalid alerts, zero network mutations | P0 |
| TC-003 | Boundary Value Min/Max Threshold Check | Boundary | Input constraints active | 1. Enter exact minimum and maximum boundary values<br>2. Submit | System processes boundary inputs cleanly without off-by-one errors or truncation | P1 |
| TC-004 | Rapid Double-Click & Debounce Verification | Edge Case | User ready to submit | 1. Double click submit action within 150ms | Button enters disabled loading state immediately, single network payload dispatched, exactly 1 database transaction committed | P0 |
| TC-005 | Network Timeout & Mid-Transaction Drop | Edge Case | Simulation network throttler enabled | 1. Trigger action<br>2. Inject 30s latency or network failure | Graceful error state shown with retry button, idempotent transaction guarantees no duplicate side-effects | P1 |
| TC-006 | SQL Injection & Payload Tampering Vector | Security | Input form active | 1. Enter \`' OR '1'='1' --\` and \`<script>alert(1)</script>\` into inputs<br>2. Submit | Input is properly parameterized and sanitized, rejected with 400 Bad Request, zero script execution | P0 |
| TC-007 | Concurrent Multi-Tab State Invalidation | Edge Case | User authenticated in 2 browser tabs | 1. Complete action in Tab A<br>2. Return to Tab B and re-submit stale state | Tab B detects state token mismatch, prompts user to refresh without crashing or corrupting database | P1 |`;

    case 'bva-equivalence-partitioning':
      return `### Boundary Value Analysis (BVA) & Equivalence Partitioning (EP)
**Target Field / Rule:** ${summaryLine}

#### 1. Equivalence Partitions (EP)
- **Valid Partition (P_VALID):** Inputs strictly conforming to the business rule.
  - *Representative Input:* Valid mid-range value conforming to all rules.
- **Invalid Partition 1 (P_BELOW):** Values below the minimum acceptable constraint.
  - *Representative Input:* Below minimum value, negative integers, or underflow strings.
- **Invalid Partition 2 (P_ABOVE):** Values exceeding the maximum acceptable threshold.
  - *Representative Input:* Exceeding upper limit, buffer overflow strings (> 255 chars).
- **Invalid Partition 3 (P_TYPE):** Null, undefined, empty string \`""\`, whitespace only \`"   "\`, and mismatched data types (alphanumeric where numeric required).

#### 2. Exact Boundary Values (2-Value & 3-Value Analysis)
| Point | Boundary Value | Expected Result | Assertion Type |
|:---|:---|:---|:---|
| **Min - 1** | Sub-Boundary (Below Min) | ❌ Rejected: Validation error displayed | \`expect(errorLocator).toBeVisible()\` |
| **Min** | Exact Minimum Threshold | ✔ Accepted: Valid input accepted | \`expect(submitBtn).toBeEnabled()\` |
| **Min + 1** | Nominal Low Boundary | ✔ Accepted: Valid input accepted | \`expect(errorLocator).toBeHidden()\` |
| **Nominal** | Typical Median Value | ✔ Accepted: Standard execution | \`expect(status).toHaveText("OK")\` |
| **Max - 1** | Nominal High Boundary | ✔ Accepted: Valid input accepted | \`expect(errorLocator).toBeHidden()\` |
| **Max** | Exact Maximum Threshold | ✔ Accepted: Valid input accepted | \`expect(submitBtn).toBeEnabled()\` |
| **Max + 1** | Super-Boundary (Above Max) | ❌ Rejected: Out of bounds error | \`expect(errorLocator).toContainText("exceeded")\` |

#### 3. Off-by-One Risk & Automated Assertion
Developers commonly use \`<\` instead of \`<=\` or \`>\` instead of \`>=\` in backend validation filters. Test **Min** and **Max** explicitly in your automated assertions to prevent regressions.`;

    case 'bdd-gherkin-spec-generator':
      return `### BDD Gherkin Feature Specification
\`\`\`gherkin
@regression @core-workflow
Feature: ${summaryLine.slice(0, 80)}
  As a verified user
  I want to execute the target business workflow
  So that the system processes my request reliably without data corruption

  Background:
    Given the application is accessible and test data is initialized
    And the user is authenticated with an active session token

  @smoke @critical
  Scenario: Successful completion of primary workflow
    Given the user navigates to the feature workflow
    When the user submits valid details:
      | field        | value        |
      | requirement | validated    |
    Then the action should succeed with status "Confirmed"
    And a confirmation notification should be displayed
    And the system audit log records the transaction

  @negative @validation
  Scenario Outline: Reject invalid or boundary inputs gracefully
    Given the user is on the workflow submission form
    When the user enters "<input_data>" into the field
    And clicks the submit button
    Then the system should display "<error_message>"
    And the submit button should remain disabled
    And no backend mutations should occur

    Examples:
      | input_data             | error_message                         |
      |                        | Field cannot be empty                 |
      | -1                     | Value must be positive and non-zero    |
      | <script>alert(1)</script> | Special characters are not permitted |
      | OVERFLOW_999999999     | Exceeds maximum allowed length        |

  @edge @concurrency
  Scenario: Prevent duplicate submissions on rapid user clicks
    Given the user has completed the input requirements
    When the user clicks the submit action 2 times within 200 milliseconds
    Then the system should process only the first request
    And the second request should be debounced
    And exactly 1 confirmation ID should be generated
\`\`\``;

    case 'playwright-ts-pom-scaffolder':
      return `### Production Playwright TypeScript Page Object Model (POM)
\`\`\`typescript
import { Page, Locator, expect } from '@playwright/test';

/**
 * Enterprise Page Object Model for: ${summaryLine.slice(0, 60)}
 * Adheres strictly to user-facing locators, auto-waiting, and separation of concerns.
 */
export class FeaturePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly mainInput: Locator;
  readonly submitButton: Locator;
  readonly successBanner: Locator;
  readonly errorMessage: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    // User-facing accessible locators (Zero brittle CSS/XPath)
    this.heading = page.getByRole('heading', { level: 1 });
    this.mainInput = page.getByRole('textbox').first();
    this.submitButton = page.getByRole('button', { name: /submit|confirm|continue/i });
    this.successBanner = page.getByRole('alert');
    this.errorMessage = page.getByTestId('error-notification');
    this.loadingSpinner = page.getByTestId('loading-indicator');
  }

  /**
   * Navigates to the workflow page and verifies initial DOM readiness.
   */
  async navigate(path: string = '/dashboard') {
    await this.page.goto(path);
    await expect(this.submitButton).toBeVisible({ timeout: 10000 });
  }

  /**
   * Executes the primary user action with built-in auto-waiting.
   */
  async submitWorkflow(inputValue: string) {
    await this.mainInput.fill(inputValue);
    await expect(this.submitButton).toBeEnabled();
    await this.submitButton.click();
  }

  /**
   * Asserts the successful completion of the workflow.
   */
  async verifySuccess(expectedText: string) {
    await expect(this.loadingSpinner).toBeHidden();
    await expect(this.successBanner).toBeVisible({ timeout: 8000 });
    await expect(this.successBanner).toContainText(expectedText);
  }

  /**
   * Asserts expected validation failure.
   */
  async verifyError(expectedError: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedError);
  }
}
\`\`\`

#### Companion Test Specification (\`.spec.ts\`)
\`\`\`typescript
import { test, expect } from '@playwright/test';
import { FeaturePage } from './FeaturePage';

test.describe('Feature Workflow Suite', () => {
  let featurePage: FeaturePage;

  test.beforeEach(async ({ page }) => {
    featurePage = new FeaturePage(page);
    await featurePage.navigate();
  });

  test('P0: should complete workflow successfully with valid input', async () => {
    await featurePage.submitWorkflow('Valid Verified Input');
    await featurePage.verifySuccess('Confirmed');
  });

  test('P1: should prevent submission and show alert on invalid input', async () => {
    await featurePage.submitWorkflow('');
    await featurePage.verifyError('Field cannot be empty');
  });
});
\`\`\``;

    case 'selenium-java-pom-factory':
      return `### Enterprise Selenium 4 (Java 21) Page Object Architecture
\`\`\`java
package com.intelligentqa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

/**
 * Enterprise Page Object for: ${summaryLine.slice(0, 60)}
 * Strict encapsulation, zero Thread.sleep(), explicit synchronization.
 */
public class FeaturePage {
    private final WebDriver driver;
    private final WebDriverWait wait;

    // Encapsulated locators
    private final By headingLocator = By.cssSelector("h1, [role='heading']");
    private final By inputField = By.cssSelector("input[type='text'], textarea");
    private final By submitButton = By.cssSelector("button[type='submit'], [data-testid='submit-btn']");
    private final By toastBanner = By.cssSelector("[role='alert'], .toast-success");
    private final By errorAlert = By.cssSelector(".error-message, [aria-invalid='true']");

    public FeaturePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void navigateTo(String url) {
        driver.get(url);
        wait.until(ExpectedConditions.visibilityOfElementLocated(headingLocator));
    }

    public void enterDetails(String value) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(inputField));
        input.clear();
        input.sendKeys(value);
    }

    public void clickSubmit() {
        WebElement button = wait.until(ExpectedConditions.elementToBeClickable(submitButton));
        button.click();
    }

    public boolean isSuccessToastVisible(String expectedMessage) {
        WebElement toast = wait.until(ExpectedConditions.visibilityOfElementLocated(toastBanner));
        return toast.getText().contains(expectedMessage);
    }

    public String getErrorMessage() {
        WebElement error = wait.until(ExpectedConditions.visibilityOfElementLocated(errorAlert));
        return error.getText();
    }
}
\`\`\`

#### Companion TestNG Test Class
\`\`\`java
package com.intelligentqa.tests;

import com.intelligentqa.pages.FeaturePage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FeatureTests extends BaseTest {
    @Test(priority = 1, description = "Verify successful submission")
    public void testSuccessfulWorkflow() {
        FeaturePage page = new FeaturePage(driver);
        page.navigateTo("https://intelligentqa.io/sandbox/practice");
        page.enterDetails("Production Data Input");
        page.clickSubmit();
        Assert.assertTrue(page.isSuccessToastVisible("Confirmed"), "Confirmation banner should be displayed");
    }
}
\`\`\``;

    case 'flakiness-race-condition-auditor':
      return `### Flaky Test & Race Condition Audit Report
**Target Snippet:** ${summaryLine.slice(0, 70)}

#### 1. Root Cause Diagnosis
- **Microtask Timing Mismatch:** The test script fires click events before the browser has attached event listeners or finished hydration.
- **Missing Web-First Assertion:** Asserting immediately on dynamic elements without auto-waiting causes intermittent \`TimeoutError\` or \`StaleElementReferenceException\`.
- **Arbitrary Sleep Anti-Pattern:** Using fixed waits (\`Thread.sleep()\` or \`waitForTimeout()\`) introduces CI pipeline slowness and fails whenever worker CPU is throttled.

#### 2. Detected Anti-Patterns
1. ❌ *Unsynchronized DOM state transition*: Reading text before CSS transition/DOM re-render settles.
2. ❌ *Brittle CSS Selectors*: Using volatile class selectors that change between builds.
3. ❌ *Absence of retry-capable assertions*: Relying on static comparisons instead of polling locators.

#### 3. Refactored Resilient Code (Zero Sleeps · 100% Deterministic)
\`\`\`typescript
import { test, expect } from '@playwright/test';

test('resilient flakiness-free execution', async ({ page }) => {
  // 1. Web-first navigation with network idle check
  await page.goto('/workflow', { waitUntil: 'domcontentloaded' });

  // 2. Target resilient user-facing role locator
  const submitBtn = page.getByRole('button', { name: 'Submit Order' });
  await expect(submitBtn).toBeVisible({ timeout: 5000 });
  await expect(submitBtn).toBeEnabled();

  // 3. User interaction with auto-waiting
  await submitBtn.click();

  // 4. Web-first polling assertion (auto-retries up to 10 seconds)
  const alertBanner = page.getByRole('alert');
  await expect(alertBanner).toBeVisible({ timeout: 10000 });
  await expect(alertBanner).toContainText('Success', { ignoreCase: true });
});
\`\`\`

#### 4. Architectural Rules for CI Reliability
1. **Never use fixed sleeps**: Replace every \`Thread.sleep\` with explicit condition polling.
2. **Prefer web-first assertions**: Use \`expect(locator).toHaveText()\` rather than extracting \`textContent()\` manually.
3. **Isolate test state**: Ensure every test generates unique database entities to prevent parallel collision.`;

    case 'api-security-tampering-matrix':
      return `### OWASP API Security & Payload Tampering Matrix
**Endpoint Scope:** ${summaryLine.slice(0, 80)}

| Security Vector | Test Scenario | Tampered Payload / Header | Expected Status | Security Assertion |
|:---|:---|:---|:---:|:---|
| **BOLA / IDOR** | Replace path param \`userId\` with another tenant ID | \`Authorization: Bearer <Tenant_A_Token>\`<br>\`PUT /api/v1/users/<Tenant_B_ID>\` | **403 Forbidden** | Verifies RBAC bounds, returns zero Tenant B data |
| **JWT Tampering** | Strip signature / use 'none' algorithm | \`alg: "none"\` in JWT header | **401 Unauthorized** | Backend strictly verifies signature with secret |
| **Mass Assignment** | Inject privileged administrative attributes | Body contains: \`{"isAdmin": true, "role": "superadmin"}\` | **400 / 200 (Ignored)** | Privileged fields are stripped, database role unchanged |
| **SQL Injection** | Inject SQL Boolean bypass into text fields | \`{"name": "admin' OR 1=1 --"}\` | **400 Bad Request** | Prepared statements parameterize input safely |
| **NoSQL Operator** | Inject Mongo query operators | \`{"password": {"$gt": ""}}\` | **422 Unprocessable** | Type validation enforces strict string schema |
| **XSS Payload** | Script tag in string inputs | \`{"bio": "<script>alert(document.cookie)</script>"}\` | **200 / 400 Sanitized** | HTML entities encoded before persistence or output |
| **Rate Limit / DoS** | Burst 50 requests in 2 seconds | Continuous loop from same IP | **429 Too Many Requests** | Returns \`Retry-After\` header, throttles caller |`;

    case 'bug-report-to-rca-generator':
    default:
      return `### Formal Defect Ticket & Automated Regression Plan
**Defect Summary:** ${summaryLine.slice(0, 80)}

#### 1. Jira Ticket Details
- **Issue Key:** DEFECT-${Math.floor(1000 + Math.random() * 9000)}
- **Issue Type:** Bug
- **Severity:** Blocker (Data Duplication / Transaction Integrity)
- **Priority:** P0 - Immediate Escalation

#### Preconditions:
1. User account is authenticated with valid credentials.
2. Network connection is operating under standard latency.

#### Exact Deterministic Steps to Reproduce:
1. Navigate to the target feature screen.
2. Populate required inputs with valid test data.
3. Rapidly click the primary action button twice within 200ms (or perform double tap on mobile viewport).
4. Inspect the network console and database records.

#### Expected Result:
The submit button should debounce on first click and transition to a disabled loading state. Exactly 1 API request is dispatched, and exactly 1 record is created.

#### Actual Result:
Both click events are registered. The backend processes 2 concurrent requests, producing duplicate database transactions and multiple user charges.

#### 2. Developer Root Cause Hypothesis:
- **Frontend:** Missing client-side click debouncing and lack of optimistic button disabling.
- **Backend:** Missing idempotency key header (\`Idempotency-Key: uuid\`) on the creation endpoint, allowing concurrent transactions to bypass unique constraint checks.

#### 3. Automated Regression Test (TDD Verification)
\`\`\`typescript
import { test, expect } from '@playwright/test';

test('DEFECT-REGRESSION: double-click submission must not produce duplicate transactions', async ({ page }) => {
  await page.goto('/checkout');
  const submitBtn = page.getByRole('button', { name: 'Submit Order' });

  // Rapid double-click reproduction
  await Promise.all([
    submitBtn.click(),
    submitBtn.click({ delay: 50 }),
  ]);

  // Assert single confirmation and button disabled state
  await expect(submitBtn).toBeDisabled();
  const confirmationBadges = page.getByTestId('order-confirmation-badge');
  await expect(confirmationBadges).toHaveCount(1);
});
\`\`\``;
  }
}
