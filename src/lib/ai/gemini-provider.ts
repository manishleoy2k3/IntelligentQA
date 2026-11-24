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
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-flash-lite-latest',
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
        const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

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

        if (response.status === 429) {
          lastError = { code: 'RATE_LIMITED', message: 'Gemini API Rate limit reached. Please wait a moment.' };
          continue;
        }

        if (response.status === 403 || response.status === 400) {
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
          if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota')) {
            lastError = { code: 'QUOTA_EXCEEDED', message: 'Gemini API Quota exceeded for model ' + model, details: errMsg };
            continue;
          }
          lastError = { code: 'BAD_REQUEST', message: errMsg };
          continue;
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          lastError = { 
            code: 'PROVIDER_UNAVAILABLE', 
            message: errData.error?.message || `Gemini API returned status ${response.status}`,
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
          lastError = { code: 'NETWORK_ERROR', message: 'Request to Gemini timed out after 45 seconds.' };
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
      // Graceful fallback if model output failed strict JSON parsing
      return {
        response_type: 'general_guidance',
        summary: 'AI response generated (raw formatting preserved).',
        generated_content: rawText,
        diagrams: [],
        code_examples: [],
        technical_warnings: ['Response was not strictly formatted as JSON; rendered raw output.'],
        assumptions: [],
        suggested_actions: ['Review content manually before inserting.'],
      };
    }
  }
}
