import { LandingPage, resolveDashboardHref } from "@/components/landing/landing-page";

export default async function Home() {
  const { user, dashboardHref } = await resolveDashboardHref();
  return <LandingPage user={user} dashboardHref={dashboardHref} />;
}
