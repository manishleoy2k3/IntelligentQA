import { NextRequest, NextResponse } from 'next/server';
import { validateGeminiKeySyntax, sanitizeGeminiKey } from '@/lib/gemini-validator';
import {
  searchQAKnowledge,
  formatCrispChatAnswer,
  synthesizeDynamicAnswer,
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

      const systemPrompt = `You are IntelligentQA's Principal SDET & AI Test Automation Mentor.
A Manual QA professional is asking you a question.
CRITICAL FORMATTING & CONTENT RULES:
1. Provide a SHORT, CRISP, HIGH-VALUE, and DIRECT answer (maximum 120-160 words).
2. Answer their exact question directly in the very first sentence. NO conversational filler, no pleasantries, and no generic intros like "Thanks for reaching out" or "As an SDET...".
3. Use 2-3 concise bullet points with concrete facts, actionable advice, or direct technology comparisons.
4. If code or syntax is helpful, include only a 2-4 line minimal snippet.
5. Reassure manual testers with practical, pragmatic advice (e.g. you do NOT need a CS degree or deep DSA).
6. Output in clean, scannable GitHub-flavored markdown.`;

      for (const model of modelsToTry) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeApiKey}`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 7000);

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
                maxOutputTokens: 512,
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

    // 2. Deterministic Local Knowledge Engine Response (Zero-Cost, Zero-Latency Fallback)
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

    // 3. Dynamic Context-Aware Semantic Synthesis (Never returns generic canned text!)
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
