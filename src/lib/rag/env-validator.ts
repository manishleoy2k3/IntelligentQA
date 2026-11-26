import { getSupabaseConfig, isSupabaseConfigured } from '../supabase/env';

export interface RAGEnvValidationReport {
  supabaseConfigured: boolean;
  supabaseUrlValid: boolean;
  supabaseServiceRoleConfigured: boolean;
  geminiKeyConfigured: boolean;
  geminiKeyValidFormat: boolean;
  cronSecretConfigured: boolean;
  mockEmbeddingsAllowed: boolean;
  localStorageFallbackAllowed: boolean;
  isFullyProductionReady: boolean;
  missingRequirements: string[];
}

export function validateRAGProductionEnv(): RAGEnvValidationReport {
  const supabaseConfig = getSupabaseConfig();
  const rawGeminiKey = process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY || '';
  const cronSecret = process.env.CRON_SECRET || '';

  const supabaseConfigured = isSupabaseConfigured();
  const supabaseUrlValid = Boolean(
    supabaseConfig?.url &&
    (supabaseConfig.url.startsWith('https://') || supabaseConfig.url.startsWith('http://'))
  );
  const supabaseServiceRoleConfigured = Boolean(
    supabaseConfig?.serviceRoleKey && supabaseConfig.serviceRoleKey.length > 20
  );

  const isGeminiPlaceholder = rawGeminiKey === '<API_KEY>' || rawGeminiKey.includes('<');
  const geminiKeyConfigured = Boolean(rawGeminiKey && !isGeminiPlaceholder);
  const geminiKeyValidFormat = Boolean(
    geminiKeyConfigured && rawGeminiKey.startsWith('AIza') && rawGeminiKey.length === 39
  );

  const cronSecretConfigured = Boolean(cronSecret && cronSecret.length >= 16);
  const mockEmbeddingsAllowed = process.env.ALLOW_MOCK_EMBEDDINGS === 'true';
  const localStorageFallbackAllowed = process.env.ALLOW_LOCAL_STORAGE_FALLBACK === 'true';

  const missingRequirements: string[] = [];

  if (!supabaseUrlValid) {
    missingRequirements.push('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL');
  }
  if (!supabaseServiceRoleConfigured) {
    missingRequirements.push('SUPABASE_SERVICE_ROLE_KEY must be configured for server persistence');
  }
  if (!geminiKeyConfigured || !geminiKeyValidFormat) {
    missingRequirements.push(
      'GEMINI_API_KEY is not configured with a valid 39-character AIzaSy... key (current value is placeholder or missing)'
    );
  }
  if (!cronSecretConfigured) {
    missingRequirements.push(
      'CRON_SECRET must be configured with a high-entropy string (min 16 chars) for Vercel Cron protection'
    );
  }

  const isFullyProductionReady = missingRequirements.length === 0;

  return {
    supabaseConfigured,
    supabaseUrlValid,
    supabaseServiceRoleConfigured,
    geminiKeyConfigured,
    geminiKeyValidFormat,
    cronSecretConfigured,
    mockEmbeddingsAllowed,
    localStorageFallbackAllowed,
    isFullyProductionReady,
    missingRequirements,
  };
}
