import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './env';

let browserClient: SupabaseClient | null = null;

/**
 * Client-safe Supabase client initialized with anonymous public key.
 * Strictly uses NEXT_PUBLIC_SUPABASE_ANON_KEY and adheres to Row Level Security (RLS).
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (browserClient) return browserClient;

  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  browserClient = createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });

  return browserClient;
}
