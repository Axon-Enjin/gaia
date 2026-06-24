import { ensureProfile, getSessionUser } from "@/lib/auth";
import {
  dashboardHrefFromProfile,
  navCtaHref,
} from "@/lib/auth/nav-cta";

export { dashboardHrefFromProfile, navCtaHref };

/** Session + profile lookup for nav/dashboard links. */
export async function getSessionDashboardHref(): Promise<{
  user: Awaited<ReturnType<typeof getSessionUser>>;
  dashboardHref: string | null;
}> {
  const user = await getSessionUser();
  if (!user) return { user: null, dashboardHref: null };

  const profile = await ensureProfile();
  if (!profile) return { user, dashboardHref: "/courses" };

  return { user, dashboardHref: dashboardHrefFromProfile(profile) };
}
