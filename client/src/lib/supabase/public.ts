import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";

/**
 * Cookieless, anon-key Supabase client for PUBLIC reads only (e.g. the
 * published-course catalog).
 *
 * Why a separate client: it reads no cookies, so its callers are safe to wrap
 * in a `'use cache'` scope (Cache Components forbids cookies()/headers() inside
 * cached functions). RLS still applies — an anon request has a null auth.uid(),
 * so it can only see rows whose policy allows the public (published courses).
 *
 * Never use this for per-user or write paths — those need the SSR client.
 */
export function createPublicClient() {
  return createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
