import { 
  AIProvider, 
  AIEnhancementRequest, 
  AIEnhancementResponse, 
  AIStructuredResponse 
} from './types';
import { QA_TECHNICAL_CONTENT_ARCHITECT } from './system-instructions';
import { buildLessonPromptContext } from './context-builder';
import { validateGeminiKeySyntax, sanitizeGeminiKey } from '@/lib/gemini-validator';

export class GeminiProvider implements AIProvider {
  name = 'Gemini';

  private defaultModels = [
    'gemini-3.8-flash',
  ];

  async generateEnhancement(request: AIEnhancementRequest): Promise<AIEnhancementResponse> {
    const rawKey = request.apiKey || process.env.GEMINI_API_KEY || '';
    const apiKey = sanitizeGeminiKey(rawKey);

    if (!apiKey) {
      return {
        success: false,
        error: {
          code: 'API_KEY_MISSING',
          message: 'Google Gemini API Key is missing. Please set GEMINI_API_KEY in your environment variables or provide a valid key.',
          details: 'You can generate a free Gemini key at https://aistudio.google.com/app/apikey',
        },
      };
    }

    const syntaxCheck = validateGeminiKeySyntax(apiKey);
    if (!syntaxCheck.valid) {
      return {
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message: syntaxCheck.error || 'The Gemini API Key syntax is invalid.',
          details: syntaxCheck.details,
        },
      };
    }

    // Prepare Context & Prompt
    const contextPrompt = buildLessonPromptContext(request.context);
    const userPrompt = `${contextPrompt}\n\n=== USER INSTRUCTION / ACTION ===\nAction: ${request.action || 'custom_chat'}\nPrompt: ${request.prompt}`;

    // Build Gemini contents array
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // History (if any)
    if (request.history && request.history.length > 0) {
      // Keep last 6 conversation turns to preserve context while controlling token count
      const recentHistory = request.history.slice(-6);
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

    const modelsToTry = request.model ? [request.model, ...this.defaultModels] : this.defaultModels;
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout for large structured lesson generation

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
            details: errMsg 
          };
          continue;
        }

        if (response.status === 403 || response.status === 400 || response.status === 404) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || response.statusText;
          if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('key not valid')) {
            return {
              success: false,
              error: {
                code: 'INVALID_API_KEY',
                message: 'Gemini API Key rejected by Google AI Studio.',
                details: errMsg,
              },
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
            lastError = { code: 'QUOTA_EXCEEDED', message: `Model ${model} unavailable: ${errMsg}` };
            continue;
          }
          lastError = { code: 'BAD_REQUEST', message: errMsg };
          continue;
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || `Gemini API returned status ${response.status}`;
          // If high demand / overloaded message is in non-ok response, failover to next model
          if (errMsg.includes('high demand') || errMsg.includes('overloaded') || response.status >= 500) {
            lastError = { code: 'PROVIDER_UNAVAILABLE', message: `Model ${model} overloaded. Failing over...` };
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
          lastError = { code: 'PROVIDER_UNAVAILABLE', message: 'Empty response returned from Gemini' };
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
          lastError = { code: 'NETWORK_ERROR', message: `Request to ${model} timed out after 90 seconds. Generating full comprehensive lessons with diagrams and structured JSON may require retry or shorter prompt.` };
        } else {
          lastError = { code: 'NETWORK_ERROR', message: err.message || 'Network connection failed' };
        }
      }
    }

    return {
      success: false,
      error: lastError || {
        code: 'PROVIDER_UNAVAILABLE',
        message: 'All configured Gemini models failed to respond. Please check your network and API key.',
      },
    };
  }

  private parseStructuredOutput(rawText: string, request: AIEnhancementRequest): AIStructuredResponse {
    let clean = rawText.trim();
    // Strip markdown code fences if wrapped in ```json ... ```
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
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
      return {
        response_type: parsed.response_type || 'general_guidance',
        summary: parsed.summary || 'Content enhancement completed successfully.',
        generated_content: parsed.generated_content || '',
        diagrams: Array.isArray(parsed.diagrams) ? parsed.diagrams : [],
        code_examples: Array.isArray(parsed.code_examples) ? parsed.code_examples : [],
        technical_warnings: Array.isArray(parsed.technical_warnings) ? parsed.technical_warnings : [],
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

      if (extractedContent) {
        return {
          response_type: 'full_lesson',
          summary: extractedSummary || 'AI content enhancement processed.',
          generated_content: extractedContent,
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
        response_type: 'general_guidance',
        summary: 'AI response generated.',
        generated_content: sanitizedRaw || rawText,
        diagrams: [],
        code_examples: [],
        technical_warnings: [],
        assumptions: [],
        suggested_actions: ['Review content before inserting.'],
      };
    }
  }
}
