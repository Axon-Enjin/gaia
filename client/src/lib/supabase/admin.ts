import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";

/**
 * Service-role Supabase client — server-only, never import from Client Components.
 * Bypasses RLS; use only for trusted server operations (XP, credentials, dev signup).
 */
export function createAdminClient(serviceRoleKey: string) {
  return createClient(publicEnv.supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
