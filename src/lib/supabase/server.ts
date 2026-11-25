import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './env';

/**
 * Server-side reader Supabase client using anonymous public key.
 * Safe for server components and public route handlers under RLS.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config || !config.anonKey) {
    return null;
  }

  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
