import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './env';

let adminClient: SupabaseClient | null = null;

/**
 * Privileged server-only Supabase client utilizing SUPABASE_SERVICE_ROLE_KEY.
 * Bypasses Row Level Security for admin CMS ingestion, migrations, and verified system writes.
 *
 * CRITICAL SECURITY GUARANTEE:
 * Must NEVER be invoked in client components or exposed in browser bundles!
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (typeof window !== 'undefined') {
    throw new Error('FATAL SECURITY VIOLATION: getSupabaseAdminClient invoked in browser runtime!');
  }

  if (adminClient) return adminClient;

  const config = getSupabaseConfig();
  if (!config || !config.serviceRoleKey) {
    return null;
  }

  adminClient = createClient(config.url, config.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminClient;
}
