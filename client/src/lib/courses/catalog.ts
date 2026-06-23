import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

/** Tag used to invalidate the catalog when a course is published/unpublished. */
export const COURSES_CACHE_TAG = "published-courses";

export interface CatalogCourse {
  id: string;
  title: string;
  industry: string;
}

/**
 * Published-course catalog (learner read path, PRD-F: browse courses).
 *
 * Explicit, opt-in caching (AGENTS.md guardrail — no implicit fetch caching):
 *   * '/use cache/' caches the rendered list. Requires `cacheComponents: true`.
 *   * Reads NO cookies (cookieless public client), so it is safely cacheable.
 *   * Tagged so a future publish action can `revalidateTag(COURSES_CACHE_TAG)`.
 *
 * Cost-gating: this is a learner read path — it touches the DB only, NEVER the
 * AI pipeline. AI is isolated to the teacher creation flow.
 */
export async function getPublishedCourses(): Promise<CatalogCourse[]> {
  "use cache";
  cacheTag(COURSES_CACHE_TAG);
  cacheLife("hours");

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, title, industry")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    // Fail closed for a public read: an empty catalog, never a crash.
    return [];
  }
  return data ?? [];
}
