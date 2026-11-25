import { z } from 'zod';

// Ensure WebSocket support in Node.js < 22 environments where Supabase Realtime client initializes
if (typeof window === 'undefined' && typeof globalThis.WebSocket === 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    globalThis.WebSocket = require('ws');
  } catch {
    // fallback dummy class if ws package is unavailable
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalThis.WebSocket = class DummyWebSocket {} as any;
  }
}

const SupabaseEnvSchema = z.object({
  url: z.string().url(),
  anonKey: z.string().min(1).optional(),
  serviceRoleKey: z.string().min(1).optional(),
});

export interface SupabaseConfig {
  url: string;
  anonKey?: string;
  serviceRoleKey?: string;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || (!anonKey && !serviceRoleKey)) {
    return null;
  }

  const result = SupabaseEnvSchema.safeParse({ url, anonKey, serviceRoleKey });
  if (!result.success) {
    console.warn('Invalid Supabase configuration:', result.error.format());
    return null;
  }

  return {
    url,
    anonKey,
    serviceRoleKey,
  };
}

export function isSupabaseConfigured(): boolean {
  const config = getSupabaseConfig();
  return Boolean(config && (config.anonKey || config.serviceRoleKey));
}

export function isSupabaseAdminConfigured(): boolean {
  const config = getSupabaseConfig();
  return Boolean(config && config.serviceRoleKey);
}
