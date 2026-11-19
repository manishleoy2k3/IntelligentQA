import { NextRequest, NextResponse } from 'next/server';
import { validateGeminiKeySyntax, sanitizeGeminiKey } from '@/lib/gemini-validator';
import {
  searchQAKnowledge,
  formatCrispChatAnswer,
  synthesizeDynamicAnswer,
  diagnoseCodeError,
} from '@/lib/qa-knowledge-base';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { message, history, context, apiKey: clientApiKey } = body as {
      message: string;
      history?: ChatMessage[];
      context?: string;
      apiKey?: string;
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const query = message.trim();

    // Determine Gemini API Key: Header > Body (Strictly user-provided to protect server tokens)
    const rawApiKey =
      req.headers.get('x-gemini-api-key') ||
      clientApiKey ||
      '';
    const activeApiKey = sanitizeGeminiKey(rawApiKey);

    // 1. If Gemini API Key is available and structurally valid, execute multi-model Gemini call
    const keyValidation = activeApiKey ? validateGeminiKeySyntax(activeApiKey) : { valid: false };
    if (activeApiKey && keyValidation.valid) {
      const modelsToTry = [
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-2.5-flash',
        'gemini-flash-lite-latest',
      ];

      const systemPrompt = `You are the master SDET AI Mentor and Principal Quality Engineering Architect for IntelligentQA, functioning as an expert AI Programming & Coding Assistant and Debugging Specialist.
You assist developers, SDETs, and coding learners with any programming queries, QA concepts, automation framework design, and code debugging.
You specialize in Python, JavaScript, TypeScript, Java, and C#, covering variables, loops, conditionals, functions, data structures, algorithms, debugging, OOP, and test automation.

CORE DOMAIN EXPERTISE:
1. QA Concepts & Methodologies:
   • Agile QA, Shift-Left / Shift-Right testing, Test Pyramid, Defect Lifecycle, Root Cause Analysis (RCA), Risk-Based Testing.
   • Test Strategy, Test Plan design, BDD/TDD, Acceptance Criteria mapping, Equivalence Partitioning, Boundary Value Analysis.
2. Web UI Automation Frameworks:
   • Playwright (TypeScript & Python): Built-in auto-waiting actionability matrix, custom Fixtures, Page Object Model (POM), multi-tab/iFrame/Shadow DOM, network interception & mocking, tracing/video, parallel workers.
   • Selenium WebDriver (Java & Python): ThreadLocal WebDriver factory, WebDriverWait / FluentWait synchronization, By locators vs PageFactory, Chrome DevTools Protocol (CDP), Selenium Grid / Docker containers, Cross-browser capabilities.
3. API Automation:
   • REST Assured (Java): Given-When-Then BDD DSL, RequestSpec / ResponseSpec builders, JSON Schema validation, OAuth2 / JWT bearer tokens, POJO serialization/deserialization (Jackson/Gson), Multipart uploads.
   • Playwright APIRequestContext: Fast contract and schema assertion directly within browser or headless test suites.
4. Framework Setup & Architecture:
   • Clean POM, Modular design, Test Data Management (Faker/JSON/CSV), Reporting (Allure, Extent), Parallel multi-thread execution, CI/CD pipeline integration (GitHub Actions, Jenkins).
5. Execution Debugging & Diagnostics:
   • Resolving StaleElementReferenceException, ElementClickInterceptedException, NoSuchElementException, SessionNotFoundException, TimeoutException.
   • Asynchronous promise errors, timing/race conditions, CORS/SSL certificate bypass, headless vs headful layout discrepancies.
6. AI in QA:
   • Model Context Protocol (MCP), Agentic AI workflows, VS Code Playwright agents, Self-healing locator heuristics (>=85% confidence score), automated defect triage.

CORE ANSWER PRINCIPLES:
1. CORRECTNESS: Zero hallucinations. Provide syntactically valid, production-ready code with accurate imports, modern APIs (e.g. getByRole, WebDriverWait with Duration, request specs), and zero deprecated patterns (no Thread.sleep).
2. COMPLETENESS: Directly answer the question in the first sentence, provide concise conceptual/architectural explanation ("why it works under the hood"), provide a copy-pasteable clean code snippet (never truncate mid-syntax), and highlight best practices vs anti-patterns.
3. CONTEXTUAL RELEVANCE: Keep answers focused directly on the user's technology stack and context. For manual testers transitioning to SDET, relate concepts directly to familiar manual testing intuition.
4. ACTIONABLE NEXT STEP: Every single response MUST conclude with an explicit "👉 **Next Step for QA:**" section that gives the QA engineer a concrete, hands-on next action (e.g. practice in /sandbox/web, test in /sandbox/api, explore tracks at /tracks, or drill questions at /interview-questions).
5. CONCISE & SCANNABLE: Format using crisp GitHub-flavored markdown with bold keywords and bullet points.

FRAMEWORK TEMPLATES ACROSS ALL TOOLS:
- When the user asks for a framework template or scaffolding for ANY tool or style (Playwright, Selenium WebDriver, REST Assured, BDD / Cucumber, Cypress, Appium, Pytest, Robot Framework, k6):
  1. LANGUAGE ALIGNMENT: Strictly generate code in the requested language (Java, TypeScript, Python, JavaScript, C#). Never substitute languages.
  2. COMPLETE STRUCTURE: Always provide the complete template with:
     • Recommended directory structure
     • Base/Driver/Config setup class
     • Page Object or API Client class with locators/endpoints and action methods
     • Complete Test Spec / Step Definitions class with real assertions
     • For BDD / Cucumber: Provide the complete Gherkin .feature file (Given/When/Then/Scenario Outline), Step Definitions delegating to Page Objects, and @CucumberOptions Test Runner.
  3. ZERO TRUNCATION: Utilize the 4,096 token output context window to write full, copy-pasteable files without leaving incomplete methods or placeholders.
  4. ACTIONABLE NEXT STEP: Conclude with "👉 **Next Step for QA:**" guiding how to run the suite or verify in our sandboxes.

ERROR & DEBUGGING RULES:
- If the user asks about an error message, exception, traceback, or compiler diagnostic:
  a. DIAGNOSIS: Clearly identify whether it is a:
     • Code Bug / Syntax Error (e.g. unclosed string quote, bad indentation, undefined variable).
     • Runtime Exception (e.g. division by zero, out-of-bounds index, null pointer, StaleElementReferenceException, ElementClickInterceptedException).
     • Environment / Sandbox Infrastructure Error (e.g. catatonit failed to exec pid1, binary missing ENOENT, compiler service unreachable). If so, explicitly state: "This is NOT an error in your code."
  b. ROOT CAUSE: Explain in 1-2 crystal-clear sentences WHY it happens.
  c. THE FIX: Provide the exact working fix with a before/after code snippet or immediate next steps.
  d. NEXT STEP: Conclude with a clear "👉 **Next Step for QA:**" guiding the user on how to verify the fix or proceed with testing.`;

      for (const model of modelsToTry) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeApiKey}`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 25000);

          const geminiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `${systemPrompt}\n\nContext: ${context || 'General SDET Advisory'}\n\nUser Question: ${query}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 4096,
              },
            }),
          });

          clearTimeout(timeoutId);

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.trim().length > 0) {
              return NextResponse.json({
                reply: text.trim(),
                engine: `gemini (${model})`,
                isLiveAI: true,
              });
            }
          }
        } catch (err) {
          // Try next model or fall through to deterministic engine
          console.warn(`Gemini model ${model} failed, checking next model or local fallback:`, err);
        }
      }
    }

    // 2. Direct Code Error & Debugging Diagnosis (Takes precedence over general career FAQs)
    const errorDiagnosis = diagnoseCodeError(query);
    if (errorDiagnosis) {
      return NextResponse.json({
        reply: errorDiagnosis,
        engine: 'code-error-diagnostic-engine',
        isLiveAI: false,
      });
    }

    // 3. Deterministic Local Knowledge Engine Response (Zero-Cost, Zero-Latency Fallback)
    const localMatches = searchQAKnowledge(query);
    const bestMatch = localMatches.length > 0 ? localMatches[0] : null;

    if (bestMatch) {
      const crispAnswer = formatCrispChatAnswer(bestMatch);
      return NextResponse.json({
        reply: crispAnswer,
        engine: 'intelligent-local-kb',
        matchedTopic: bestMatch.topic,
        isLiveAI: false,
      });
    }

    // 4. Dynamic Context-Aware Semantic Synthesis (Never returns generic canned text!)
    const dynamicReply = synthesizeDynamicAnswer(query);
    return NextResponse.json({
      reply: dynamicReply,
      engine: 'dynamic-sdet-synthesizer',
      isLiveAI: false,
    });
  } catch (err) {
    console.error('QA Chat endpoint error:', err);
    return NextResponse.json({ error: 'Internal server error processing chat' }, { status: 500 });
  }
}
