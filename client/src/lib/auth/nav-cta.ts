import type { Profile } from "@/lib/auth";

/** Role-based dashboard path for signed-in users. */
export function dashboardHrefFromProfile(
  profile: Pick<Profile, "role"> | null,
): string | null {
  if (!profile) return null;
  if (profile.role === "teacher") return "/teacher";
  if (profile.role === "funder") return "/courses";
  return "/learner";
}

/** Smart nav CTA target — sign-up when signed out, dashboard when signed in. */
export function navCtaHref(
  signedIn: boolean,
  dashboardHref: string | null,
): string {
  if (signedIn && dashboardHref) return dashboardHref;
  return "/login?mode=sign-up";
}
