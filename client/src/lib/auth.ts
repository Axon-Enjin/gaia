import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export type Role = "learner" | "teacher" | "funder";

export interface Profile {
  id: string;
  role: Role;
  display_name: string | null;
  locale: "en" | "fil";
}

/** Current authenticated user, or null. Never throws. Deduplicated per request via React cache. */
export const getSessionUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Load a profile row by id (RLS: a user can read only their own). */
export async function getProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("id, role, display_name, locale")
    .eq("id", userId)
    .maybeSingle();
  return (data as Profile | null) ?? null;
}

/**
 * Ensure the authenticated user has a profile row, creating one on first login
 * (onboarding). The desired role is read from sign-up metadata; defaults to
 * 'learner'. Insert is allowed by RLS policy `profiles_insert_own`.
 *
 * Returns null only if there is no authenticated user.
 */
export const ensureProfile = cache(async (): Promise<Profile | null> => {
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();

  const existing = await getProfile(supabase, user.id);
  if (existing) return existing;

  const metaRole = user.user_metadata?.role;
  const role: Role =
    metaRole === "teacher" || metaRole === "funder" ? metaRole : "learner";
  const displayName =
    (user.user_metadata?.display_name as string | undefined) ?? null;

  const { data, error } = await supabase
    .from("profiles")
    .insert({ id: user.id, role, display_name: displayName })
    .select("id, role, display_name, locale")
    .single();

  if (error || !data) {
    // If a concurrent request created it first, re-read.
    return getProfile(supabase, user.id);
  }
  return data as Profile;
});
