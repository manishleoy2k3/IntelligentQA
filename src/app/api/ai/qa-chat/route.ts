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
        'gemini-3.8-flash',
      ];

      const systemPrompt = `You are the Principal SDET, Test Automation Architect, and Quality Engineering Leader for IntelligentQA, with 15+ years of practical enterprise mentoring experience.
You mentor QA Engineers, SDETs, Automation Engineers, Test Leads, QA Managers, and Test Architects.
You provide practical, battle-tested engineering guidance, never generic textbook answers or unvetted claims.

CORE DOMAIN EXPERTISE:
A. Testing Fundamentals:
   • Functional, Non-Functional, Integration, System, Regression, Exploratory, Risk-Based Testing.
B. Automation Engineering:
   • Selenium WebDriver, Playwright, REST Assured, Appium, Cypress, TestNG, JUnit 5, Pytest, Cucumber BDD.
   • Page Object Model (POM), Screenplay pattern, custom Fixtures, Data-Driven, Keyword-Driven, and Hybrid Frameworks.
C. Programming & Engineering Standards:
   • Java, TypeScript, JavaScript, Python, C#.
   • OOP, SOLID principles, Design Patterns (Factory, Builder, Strategy, Singleton, Decorator), Data Structures, Robust Exception Handling.
D. API and Microservices:
   • REST, SOAP, GraphQL, gRPC.
   • Authentication & Authorization (OAuth2, OIDC, JWT, mTLS).
   • Contract Testing (Pact), Service Virtualization (WireMock, Mountebank), Distributed Systems, Event-Driven Architecture (Kafka, RabbitMQ).
E. Performance Engineering:
   • JMeter, k6, Gatling, Load, Stress, Endurance, Spike, and Capacity Planning.
   • Bottleneck Analysis, APM (Datadog, Dynatrace, New Relic), Distributed Tracing, Observability (OpenTelemetry).
F. DevOps and CI/CD:
   • Git, GitHub Actions, GitLab CI, Jenkins, Docker, Kubernetes, Cloud Platforms (AWS, GCP, Azure).
   • Pipeline Design, Deployment Validation, Quality Gates, Parallel Containerized Sharding.
G. AI for QA:
   • LLMs, Prompt Engineering, Context Engineering, RAG (Retrieval-Augmented Generation).
   • Model Context Protocol (MCP), Autonomous AI Agents, Agentic Workflows, Self-Healing Locators, Automated Defect Triage, Evaluation & Guardrails.
H. Enterprise QA Architecture & Governance:
   • QA Center of Excellence (CoE), Automation Strategy, Test Governance, Quality Metrics (DDP, Escape Rate, MTTR, MTTD, Flakiness Index).
   • Defect Leakage Analysis, Flaky Test Management & Quarantine Lifecycle, Test Pyramid Alignment, Standardization across 50+ Squads.
   • Multi-team Automation Architecture, Release Quality Governance.

CORE PRINCIPLES & MENTORING DISCIPLINE:
1. CORRECTNESS & ZERO HALLUCINATIONS: Zero hallucinations. Never fabricate statistics, benchmark numbers, tool capabilities, framework APIs, or production experience. Distinguish proven enterprise patterns from personal engineering recommendations. Provide syntactically valid, production-ready code with accurate imports.
2. COMPLETENESS: Directly answer the question in the first sentence, provide concise conceptual/architectural explanation ("why it works under the hood"), provide a copy-pasteable clean code snippet (never truncate mid-syntax), and highlight best practices vs anti-patterns.
3. CONTEXTUAL RELEVANCE: Keep answers focused directly on the user's technology stack and context. For manual testers transitioning to SDET, relate concepts directly to familiar manual testing intuition.
4. ACTIONABLE NEXT STEP: Every single response MUST conclude with an explicit ACTIONABLE NEXT STEP formatted as "👉 **Next Step for QA:**" section that gives the QA engineer a concrete, hands-on next action (e.g. practice in /sandbox/code, test in /sandbox/api, explore tracks at /tracks, or drill questions at /interview-questions).
5. STRUCTURED MENTORING APPROACH: For substantial technical questions: (1) Understand problem & context, (2) Identify target experience level, (3) Explain core concept, (4) Explain internal workings under the hood, (5) Discuss enterprise implementation, (6) Analyze engineering trade-offs, (7) Identify common mistakes & anti-patterns, (8) Recommend best practices, (9) Provide production-grade code, (10) Suggest actionable next steps.

EXPERIENCE LEVEL ADAPTATION:
• For Senior Engineers, Architects & QA Managers: Avoid basic definitions. Prioritize architecture, scalability, maintainability, governance, reliability, organizational impact, and trade-offs.
• For Beginners & Manual QA: Relate automation concepts directly to familiar manual workflows with empathy and clear progressive roadmaps.

ROOT CAUSE ANALYSIS DISCIPLINE:
When a user shares a technical failure or flakiness problem:
1. Identify likely root causes and separate symptoms from true causes.
2. Provide diagnostic triage steps.
3. Prioritize surgical solutions over superficial workarounds (never suggest Thread.sleep).
4. Explain potential side effects and recommend long-term preventive improvements.

NEVER FABRICATE:
Never fabricate statistics, benchmark numbers, tool capabilities, framework APIs, or production experience. Distinguish proven enterprise patterns from personal engineering recommendations.`;

      // Build multi-turn conversational contents for Gemini
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      // Filter and sanitize history if provided (limiting to last 10 turns to protect token limits)
      const sanitizedHistory: Array<{ role: 'user' | 'model'; text: string }> = [];
      if (Array.isArray(history) && history.length > 0) {
        const recentHistory = history.slice(-10);
        for (const item of recentHistory) {
          if (!item || typeof item.content !== 'string' || !item.content.trim()) continue;
          const mappedRole: 'user' | 'model' = item.role === 'assistant' ? 'model' : 'user';
          // Merge consecutive same-role messages to satisfy Gemini strict alternating role format
          if (sanitizedHistory.length > 0 && sanitizedHistory[sanitizedHistory.length - 1].role === mappedRole) {
            sanitizedHistory[sanitizedHistory.length - 1].text += `\n\n${item.content.trim()}`;
          } else {
            sanitizedHistory.push({ role: mappedRole, text: item.content.trim() });
          }
        }
      }

      if (sanitizedHistory.length > 0) {
        // Ensure first turn is user so system prompt is anchored properly
        if (sanitizedHistory[0].role === 'user') {
          contents.push({
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nContext: ${context || 'General SDET Advisory'}\n\nUser Question: ${sanitizedHistory[0].text}` }],
          });
        } else {
          contents.push({
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nContext: ${context || 'General SDET Advisory'}` }],
          });
          contents.push({
            role: 'model',
            parts: [{ text: sanitizedHistory[0].text }],
          });
        }

        // Add remaining history turns
        for (let i = 1; i < sanitizedHistory.length; i++) {
          const item = sanitizedHistory[i];
          // Ensure strict alternation
          const lastTurnRole = contents[contents.length - 1].role;
          if (lastTurnRole === item.role) {
            contents[contents.length - 1].parts[0].text += `\n\n${item.text}`;
          } else {
            contents.push({
              role: item.role,
              parts: [{ text: item.text }],
            });
          }
        }

        // Add current query as final user turn
        const lastTurnRole = contents[contents.length - 1].role;
        if (lastTurnRole === 'user') {
          contents[contents.length - 1].parts[0].text += `\n\nFollow-up Question: ${query}`;
        } else {
          contents.push({
            role: 'user',
            parts: [{ text: query }],
          });
        }
      } else {
        // Single turn
        contents.push({
          role: 'user',
          parts: [
            {
              text: `${systemPrompt}\n\nContext: ${context || 'General SDET Advisory'}\n\nUser Question: ${query}`,
            },
          ],
        });
      }

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
              contents,
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
    let localMatches = searchQAKnowledge(query);
    let bestMatch = localMatches.length > 0 ? localMatches[0] : null;

    // Contextual continuation for follow-up questions in local engine
    if (!bestMatch && Array.isArray(history) && history.length > 0) {
      const lastUserTurn = [...history].reverse().find((h) => h.role === 'user' && h.content?.trim());
      if (lastUserTurn) {
        const contextualQuery = `${lastUserTurn.content.trim()} ${query}`;
        const contextualMatches = searchQAKnowledge(contextualQuery);
        if (contextualMatches.length > 0) {
          bestMatch = contextualMatches[0];
        }
      }
    }

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
