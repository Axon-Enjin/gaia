import { connection } from "next/server";
import { LandingPage, resolveDashboardHref } from "@/components/landing/landing-page";

export default async function Home() {
  await connection();
  const { user, dashboardHref } = await resolveDashboardHref();
  return <LandingPage user={user} dashboardHref={dashboardHref} />;
}
