import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "@/lib/env";

/**
 * Next.js 16 Proxy (replaces middleware.ts).
 *
 * Scope is intentionally narrow: refresh the Supabase auth session cookie so
 * Server Components see a fresh token. Actual authorization (role + ownership)
 * lives in layouts, Server Actions, and RLS — NOT here (AGENTS.md guardrail).
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Dev ergonomics: avoid auth refresh churn on every document request.
  // Login/logout still work because Server Actions write cookies directly.
  // Production keeps the refresh path enabled for expiring sessions.
  if (process.env.NODE_ENV === "development") {
    return response;
  }

  // If Supabase isn't configured yet (local bootstrap), do nothing.
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Touch the session so expired tokens are refreshed into the response cookies.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on everything except static assets and metadata files, so token
     * refresh never blocks CSS/JS/image delivery (low-resource constraint).
     * Skip router/browser prefetch traffic so speculative requests do not keep
     * touching auth cookies and amplifying duplicate-tab or hover-triggered
     * request noise on dynamic dashboard routes.
     */
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
