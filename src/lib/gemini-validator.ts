/**
 * Google AI Studio / Gemini API Key Validation Utility
 *
 * Enforces production-grade validation for user-provided Gemini API keys:
 * - Structural format validation (prefix, exact length, charset)
 * - Diagnostic error reporting
 * - Sanitization
 */

export interface KeyValidationResult {
  valid: boolean;
  error?: string;
  code?:
    | 'EMPTY'
    | 'INVALID_PREFIX'
    | 'INVALID_LENGTH'
    | 'INVALID_CHARACTERS'
    | 'API_KEY_INVALID'
    | 'QUOTA_EXCEEDED';
  details?: string;
}

/**
 * Validates the syntax and structure of a Google AI Studio Gemini API Key.
 *
 * Official Google API key specifications:
 * - Prefix: Always starts with 'AIzaSy' (or legacy 'AIza')
 * - Length: Exactly 39 characters
 * - Character set: Base64URL safe ([A-Za-z0-9_-])
 */
export function validateGeminiKeySyntax(rawKey: unknown): KeyValidationResult {
  if (typeof rawKey !== 'string') {
    return {
      valid: false,
      code: 'EMPTY',
      error: 'API key must be a valid string.',
    };
  }

  const trimmed = rawKey.trim();

  if (!trimmed) {
    return {
      valid: false,
      code: 'EMPTY',
      error: 'API key cannot be empty.',
    };
  }

  // 1. Prefix Validation: Google API keys always begin with 'AIza' (typically 'AIzaSy')
  if (!trimmed.startsWith('AIza')) {
    const preview = trimmed.length > 10 ? `${trimmed.slice(0, 10)}...` : trimmed;
    return {
      valid: false,
      code: 'INVALID_PREFIX',
      error: `Invalid key format: Google AI Studio keys must begin with "AIzaSy" (received "${preview}").`,
      details: 'Please obtain an authentic free key from https://aistudio.google.com/app/apikey',
    };
  }

  // 2. Length Validation: Standard Google API key length is exactly 39 characters
  if (trimmed.length !== 39) {
    return {
      valid: false,
      code: 'INVALID_LENGTH',
      error: `Invalid key length: Google AI Studio keys are exactly 39 characters (received ${trimmed.length} characters).`,
      details: 'Ensure you copied the entire key without missing characters or trailing spaces.',
    };
  }

  // 3. Character Set Validation: Base64URL characters only (A-Z, a-z, 0-9, _, -)
  const validCharsetRegex = /^AIza[A-Za-z0-9_-]{35}$/;
  if (!validCharsetRegex.test(trimmed)) {
    return {
      valid: false,
      code: 'INVALID_CHARACTERS',
      error:
        'Invalid characters: Google API keys contain only letters, numbers, hyphens, and underscores.',
      details: 'Remove any spaces, quotes, or accidental symbols from your key.',
    };
  }

  return { valid: true };
}

/**
 * Normalizes and strips unwanted whitespace or quotes that can occur during copy-paste.
 */
export function sanitizeGeminiKey(rawKey: string): string {
  if (!rawKey) return '';
  return rawKey.trim().replace(/^["']|["']$/g, '');
}
