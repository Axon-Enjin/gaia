import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env";

/**
 * SSR Supabase client for Server Components, Route Handlers, and Server Actions.
 *
 * `cookies()` must be awaited (Next.js 16). Always pair reads with a server-side
 * ownership / RLS check — never trust a client-supplied identity.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // `setAll` was called from a Server Component (read-only cookies).
          // Session refresh is handled in proxy.ts, so this is safe to ignore.
        }
      },
    },
  });
}
