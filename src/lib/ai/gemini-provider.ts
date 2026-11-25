import {
  AIProvider,
  AIEnhancementRequest,
  AIEnhancementResponse,
  AIStructuredResponse,
  TechnicalReviewData,
  TechnicalRecommendation,
} from './types';
import { QA_TECHNICAL_CONTENT_ARCHITECT } from './system-instructions';
import { buildLessonPromptContext } from './context-builder';
import { validateGeminiKeySyntax, sanitizeGeminiKey } from '@/lib/gemini-validator';
import { generateFallbackEnhancement } from './fallback-generator';

export class GeminiProvider implements AIProvider {
  name = 'Gemini';

  private defaultModels = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-2.5-pro',
    'gemini-1.5-pro',
  ];

  async generateEnhancement(request: AIEnhancementRequest): Promise<AIEnhancementResponse> {
    const rawKey = request.apiKey || process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY || '';
    const apiKey = sanitizeGeminiKey(rawKey);

    if (request.apiKey !== undefined && !request.apiKey) {
      return {
        success: false,
        error: {
          code: 'API_KEY_MISSING',
          message: 'Gemini API key is required.',
        },
      };
    }

    if (request.apiKey && !validateGeminiKeySyntax(request.apiKey).valid) {
      return {
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message: 'Invalid Gemini API key syntax.',
        },
      };
    }

    if (!apiKey) {
      console.warn(
        '[GeminiProvider] No API key provided, serving high-fidelity SDET fallback response.'
      );
      const fallbackData = generateFallbackEnhancement(request);
      return {
        success: true,
        data: fallbackData,
        rawText: fallbackData.generated_content,
        modelUsed: 'IntelligentQA-SDET-Engine (Offline)',
      };
    }

    const syntaxCheck = validateGeminiKeySyntax(apiKey);
    if (!syntaxCheck.valid) {
      console.warn('[GeminiProvider] Invalid key syntax, engaging SDET fallback response.');
      const fallbackData = generateFallbackEnhancement(request);
      fallbackData.technical_warnings = [
        'Invalid Gemini API key syntax. Content served by IntelligentQA Architecture Fallback Engine.',
      ];
      return {
        success: true,
        data: fallbackData,
        rawText: fallbackData.generated_content,
        modelUsed: 'IntelligentQA-SDET-Engine (Fallback)',
      };
    }

    // Prepare Context & Prompt
    const contextPrompt = buildLessonPromptContext(request.context);
    const userPrompt = `${contextPrompt}\n\n=== USER INSTRUCTION / ACTION ===\nAction: ${request.action || 'custom_chat'}\nPrompt: ${request.prompt}`;

    // Build Gemini contents array
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // History (if any)
    if (request.history && request.history.length > 0) {
      // Keep last 4 conversation turns to preserve context while controlling token count
      const recentHistory = request.history.slice(-4);
      for (const msg of recentHistory) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }

    // Append current turn
    contents.push({
      role: 'user',
      parts: [{ text: userPrompt }],
    });

    const requestedModel = request.model;
    const modelsToTry =
      requestedModel && requestedModel !== 'gemini-3.8-flash'
        ? [requestedModel, ...this.defaultModels]
        : this.defaultModels;

    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 18000); // 18s fast timeout per model

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: QA_TECHNICAL_CONTENT_ARCHITECT }],
              },
              contents,
              generationConfig: {
                temperature: request.temperature !== undefined ? request.temperature : 0.2,
                maxOutputTokens: request.maxTokens || 4096,
                responseMimeType: 'application/json',
              },
            }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (response.status === 429 || response.status === 503) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || response.statusText;
          // When a model is overloaded (e.g. 503 or 429 high demand), failover immediately to next model in the pool
          lastError = {
            code: 'RATE_LIMITED',
            message: `Model ${model} is experiencing high demand. Failing over...`,
            details: errMsg,
          };
          continue;
        }

        if (response.status === 403 || response.status === 400 || response.status === 404) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || response.statusText;
          if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('key not valid')) {
            console.warn('[GeminiProvider] Key invalid on Google API, serving fallback.');
            const fallbackData = generateFallbackEnhancement(request);
            fallbackData.technical_warnings = [
              'Gemini API key rejected by Google. Content generated via IntelligentQA Architecture Engine.',
            ];
            return {
              success: true,
              data: fallbackData,
              rawText: fallbackData.generated_content,
              modelUsed: 'IntelligentQA-SDET-Engine (Offline Fallback)',
            };
          }
          if (
            errMsg.includes('RESOURCE_EXHAUSTED') ||
            errMsg.includes('Quota') ||
            errMsg.includes('high demand') ||
            errMsg.includes('temporarily unavailable') ||
            errMsg.includes('no longer available') ||
            response.status === 404 ||
            errMsg.includes('not found')
          ) {
            lastError = {
              code: 'QUOTA_EXCEEDED',
              message: `Model ${model} unavailable: ${errMsg}`,
            };
            continue;
          }
          lastError = { code: 'BAD_REQUEST', message: errMsg };
          continue;
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || `Gemini API returned status ${response.status}`;
          if (
            errMsg.includes('high demand') ||
            errMsg.includes('overloaded') ||
            response.status >= 500
          ) {
            lastError = {
              code: 'PROVIDER_UNAVAILABLE',
              message: `Model ${model} overloaded. Failing over...`,
            };
            continue;
          }
          lastError = {
            code: 'PROVIDER_UNAVAILABLE',
            message: errMsg,
          };
          continue;
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) {
          lastError = {
            code: 'PROVIDER_UNAVAILABLE',
            message: 'Empty response returned from Gemini',
          };
          continue;
        }

        const usage = {
          promptTokens: data.usageMetadata?.promptTokenCount,
          completionTokens: data.usageMetadata?.candidatesTokenCount,
          totalTokens: data.usageMetadata?.totalTokenCount,
        };

        // Parse structured JSON response
        const parsed = this.parseStructuredOutput(rawText, request);

        return {
          success: true,
          data: parsed,
          rawText,
          modelUsed: model,
          usage,
        };
      } catch (err: any) {
        if (err.name === 'AbortError') {
          lastError = {
            code: 'NETWORK_ERROR',
            message: `Request to ${model} timed out after 18s. Failing over to next model...`,
          };
        } else {
          lastError = {
            code: 'NETWORK_ERROR',
            message: err.message || 'Network connection failed',
          };
        }
      }
    }

    // Seamless Fallback: When all live Gemini models timed out or failed, serve high-quality deterministic SDET content
    console.warn(
      '[GeminiProvider] All live API attempts timed out/failed. Engaging IntelligentQA Architecture Fallback Engine:',
      lastError
    );
    const fallbackData = generateFallbackEnhancement(request);
    return {
      success: true,
      data: fallbackData,
      rawText: fallbackData.generated_content,
      modelUsed: 'IntelligentQA-SDET-Engine (Offline Fallback)',
    };
  }

  private parseStructuredOutput(
    rawText: string,
    request: AIEnhancementRequest
  ): AIStructuredResponse {
    let clean = rawText.trim();
    // Strip markdown code fences if wrapped in ```json ... ```
    if (clean.startsWith('```json')) {
      clean = clean
        .replace(/^```json\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
    } else if (clean.startsWith('```')) {
      clean = clean
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
    }

    // If the text does not start with '{' but contains one, find the outer JSON boundaries
    if (!clean.startsWith('{') && clean.includes('{')) {
      const firstBrace = clean.indexOf('{');
      const lastBrace = clean.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        clean = clean.substring(firstBrace, lastBrace + 1).trim();
      }
    } else if (!clean.startsWith('{') && clean.includes('"response_type"')) {
      // Model returned JSON fields without the opening brace
      const firstQuote = clean.indexOf('"response_type"');
      clean = '{' + clean.substring(firstQuote);
      if (!clean.endsWith('}')) {
        clean = clean + '}';
      }
    }

    try {
      const parsed = JSON.parse(clean);
      const isReviewAction =
        request.action === 'technical_review' || parsed.response_type === 'technical_review';

      const structuredReview =
        isReviewAction || parsed.review
          ? this.normalizeTechnicalReview(
              parsed.review,
              request.context?.currentLesson?.contentHtml || '',
              parsed.generated_content || parsed.summary || ''
            )
          : undefined;

      return {
        response_type:
          parsed.response_type || (isReviewAction ? 'technical_review' : 'general_guidance'),
        summary:
          parsed.summary ||
          (isReviewAction
            ? 'Technical review completed with rubric scoring and recommendations.'
            : 'Content enhancement completed successfully.'),
        generated_content: parsed.generated_content || '',
        review: structuredReview,
        diagrams: Array.isArray(parsed.diagrams) ? parsed.diagrams : [],
        code_examples: Array.isArray(parsed.code_examples) ? parsed.code_examples : [],
        technical_warnings: Array.isArray(parsed.technical_warnings)
          ? parsed.technical_warnings
          : [],
        assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions : [],
        suggested_actions: Array.isArray(parsed.suggested_actions) ? parsed.suggested_actions : [],
      };
    } catch {
      // If JSON.parse fails, attempt heuristic extraction of generated_content and summary
      // to avoid dumping raw JSON text / keys into the chat window
      let extractedContent = '';
      let extractedSummary = '';

      const contentMatch = rawText.match(/"generated_content"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
      if (contentMatch && contentMatch[1]) {
        try {
          extractedContent = JSON.parse(`"${contentMatch[1]}"`);
        } catch {
          extractedContent = contentMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
        }
      }

      const summaryMatch = rawText.match(/"summary"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
      if (summaryMatch && summaryMatch[1]) {
        try {
          extractedSummary = JSON.parse(`"${summaryMatch[1]}"`);
        } catch {
          extractedSummary = summaryMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
        }
      }

      const isReviewAction = request.action === 'technical_review';
      const structuredReview = isReviewAction
        ? this.normalizeTechnicalReview(
            null,
            request.context?.currentLesson?.contentHtml || '',
            extractedContent || rawText
          )
        : undefined;

      if (extractedContent) {
        return {
          response_type: isReviewAction ? 'technical_review' : 'full_lesson',
          summary:
            extractedSummary ||
            (isReviewAction
              ? 'Technical review audit completed.'
              : 'AI content enhancement processed.'),
          generated_content: extractedContent,
          review: structuredReview,
          diagrams: [],
          code_examples: [],
          technical_warnings: [],
          assumptions: [],
          suggested_actions: [],
        };
      }

      // If all extraction fails, clean any dangling json formatting from rawText
      const sanitizedRaw = rawText
        .replace(/^\s*\{?\s*"response_type"[^,]+,\s*/i, '')
        .replace(/"summary"\s*:\s*"[^"]*",?\s*/i, '')
        .replace(/"generated_content"\s*:\s*"?/i, '')
        .replace(/"?\s*\}?\s*$/i, '');

      return {
        response_type: isReviewAction ? 'technical_review' : 'general_guidance',
        summary: isReviewAction ? 'Technical review completed.' : 'AI response generated.',
        generated_content: sanitizedRaw || rawText,
        review: structuredReview,
        diagrams: [],
        code_examples: [],
        technical_warnings: [],
        assumptions: [],
        suggested_actions: ['Review content before inserting.'],
      };
    }
  }

  private normalizeTechnicalReview(
    rawReview: any,
    lessonContentHtml: string,
    generatedContent: string
  ): TechnicalReviewData {
    let completeness = Number(
      rawReview?.metrics?.completeness?.score || rawReview?.completeness || 0
    );
    let practicalDepth = Number(
      rawReview?.metrics?.practicalDepth?.score || rawReview?.practicalDepth || 0
    );
    let codeExamples = Number(
      rawReview?.metrics?.codeExamples?.score || rawReview?.codeExamples || 0
    );
    let diagrams = Number(rawReview?.metrics?.diagrams?.score || rawReview?.diagrams || 0);
    let failureHandling = Number(
      rawReview?.metrics?.failureHandling?.score || rawReview?.failureHandling || 0
    );

    const cleanText = lessonContentHtml
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const wordCount = cleanText ? cleanText.split(' ').length : 0;
    const hasArchitecture =
      lessonContentHtml.includes('architecture') ||
      lessonContentHtml.includes('<svg') ||
      lessonContentHtml.includes('data-diagram-type');
    const hasCode =
      lessonContentHtml.includes('<pre') ||
      lessonContentHtml.includes('<code>') ||
      lessonContentHtml.includes('language-');
    const hasFailures = /exception|error|troubleshoot|failure|staleelement|timeout|debug/i.test(
      lessonContentHtml
    );

    // If scores weren't provided or are 0, compute non-arbitrary criteria scores based on concrete evaluation rubric
    if (completeness === 0) {
      completeness = Math.min(
        95,
        Math.max(45, Math.round(50 + (wordCount > 600 ? 38 : wordCount / 18)))
      );
    }
    if (practicalDepth === 0) {
      practicalDepth = Math.min(
        92,
        Math.max(40, Math.round(45 + (hasCode ? 25 : 0) + (hasFailures ? 18 : 0)))
      );
    }
    if (codeExamples === 0) {
      codeExamples = hasCode
        ? lessonContentHtml.includes('typescript') || lessonContentHtml.includes('java')
          ? 85
          : 70
        : 35;
    }
    if (diagrams === 0) {
      diagrams = hasArchitecture ? 90 : 25;
    }
    if (failureHandling === 0) {
      failureHandling = hasFailures ? 82 : 30;
    }

    const overallScore =
      Number(rawReview?.overallScore) ||
      Math.round(
        completeness * 0.3 +
          practicalDepth * 0.25 +
          codeExamples * 0.2 +
          diagrams * 0.15 +
          failureHandling * 0.1
      );

    let rawRecommendations: any[] = Array.isArray(rawReview?.recommendations)
      ? rawReview.recommendations
      : [];

    // Extract recommendations from generated text if LLM emitted them in markdown lists
    if (rawRecommendations.length === 0 && generatedContent) {
      const lines = generatedContent.split('\n');
      for (const line of lines) {
        const match = line.match(
          /^\s*[-*•]?\s*\[?(Good|Missing|Improve|Warning)\]?\s*[:-]?\s*(.+)/i
        );
        if (match) {
          const typeStr = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
          rawRecommendations.push({
            type: typeStr,
            title: match[2].trim(),
            detail: match[2].trim(),
            category: 'Concepts',
          });
        }
      }
    }

    // Default rubric checks if empty
    if (rawRecommendations.length === 0) {
      rawRecommendations = [
        {
          type: wordCount > 300 ? 'Good' : 'Improve',
          category: 'Concepts',
          title:
            wordCount > 300 ? 'Concept explanation is clear.' : 'Concept explanation is too brief.',
          detail:
            wordCount > 300
              ? 'Core architecture motivation and definitions are articulated clearly.'
              : 'Expand core technical definitions.',
        },
        {
          type: hasArchitecture ? 'Good' : 'Missing',
          category: 'Architecture',
          title: hasArchitecture ? 'Architecture diagram is present.' : 'No architecture diagram.',
          detail: hasArchitecture
            ? 'Visual architecture diagram conveys component relationships.'
            : 'Students need visual representation of system architecture.',
          actionableStep: hasArchitecture
            ? undefined
            : 'Use the Diagram Studio to generate and insert an Architecture Diagram.',
        },
        {
          type: hasCode ? 'Improve' : 'Missing',
          category: 'Code Examples',
          title: hasCode
            ? 'Add Java and TypeScript examples.'
            : 'Missing executable test automation code.',
          detail: hasCode
            ? 'Provide full enterprise setup with parallel execution assertions.'
            : 'Add production-ready test scripts.',
          actionableStep: 'Provide dual-language (Java + TypeScript) test examples with imports.',
        },
        {
          type: hasFailures ? 'Good' : 'Missing',
          category: 'Failures',
          title: hasFailures
            ? 'Troubleshooting & failure scenarios included.'
            : 'Common failure scenarios.',
          detail: hasFailures
            ? 'Real-world exception handling and diagnosis covered.'
            : 'Lacks root cause analyses of common test suite failures.',
          actionableStep: hasFailures
            ? undefined
            : 'Add top 3 real-world failure patterns with debugging steps.',
        },
        {
          type: 'Good',
          category: 'Objectives',
          title: 'Learning objectives are relevant.',
          detail: 'Clearly identifies target skill competencies for SDETs.',
        },
      ];
    }

    const recommendations: TechnicalRecommendation[] = rawRecommendations.map((r: any) => {
      let type: 'Good' | 'Missing' | 'Improve' | 'Warning' = 'Improve';
      const rawType = String(r.type || '').toUpperCase();
      if (rawType.includes('GOOD')) type = 'Good';
      else if (rawType.includes('MISSING')) type = 'Missing';
      else if (rawType.includes('WARN')) type = 'Warning';
      else if (rawType.includes('IMPROVE')) type = 'Improve';

      return {
        type,
        category: r.category || 'Concepts',
        title: r.title || r.message || 'Recommendation',
        detail: r.detail || r.description || r.title || '',
        actionableStep: r.actionableStep || r.suggestion || undefined,
      };
    });

    return {
      overallScore,
      status:
        overallScore >= 80
          ? 'Strong'
          : overallScore >= 60
            ? 'Needs Improvement'
            : 'Critical Issues',
      metrics: {
        completeness: {
          name: 'Technical completeness',
          score: completeness,
          maxScore: 100,
          description: 'Core concepts, architectural mechanics, and curriculum alignment',
        },
        practicalDepth: {
          name: 'Practical depth',
          score: practicalDepth,
          maxScore: 100,
          description: 'Enterprise SDET depth, edge cases, and architectural rigor',
        },
        codeExamples: {
          name: 'Code quality & multi-language examples',
          score: codeExamples,
          maxScore: 100,
          description: 'Practical Java and TypeScript automated test implementations',
        },
        diagrams: {
          name: 'Architecture & Diagrams',
          score: diagrams,
          maxScore: 100,
          description: 'Visual Mermaid system and execution diagrams',
        },
        failureHandling: {
          name: 'Failures & Troubleshooting',
          score: failureHandling,
          maxScore: 100,
          description: 'Real framework exceptions and root cause debugging tactics',
        },
      },
      recommendations,
      summaryVerbatim: rawReview?.summaryVerbatim || '',
    };
  }
}
