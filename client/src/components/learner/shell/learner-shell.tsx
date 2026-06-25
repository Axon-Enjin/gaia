"use client";

import { usePathname } from "next/navigation";
import { LearnerSidebar } from "@/components/learner/shell/learner-sidebar";
import { LearnerBottomNav } from "@/components/learner/shell/learner-bottom-nav";

export interface LearnerShellProps {
  children: React.ReactNode;
  displayName: string | null;
  email: string;
  levelLabel: string;
  navLabels: { home: string; courses: string; credentials: string; profile: string };
  ariaLabels: { shellNav: string; mainNav: string; brandHome: string };
}

/** Hybrid learner chrome — sidebar on md+, bottom tabs on mobile. */
export function LearnerShell({
  children,
  displayName,
  email,
  levelLabel,
  navLabels,
  ariaLabels,
}: LearnerShellProps) {
  const pathname = usePathname();

  return (
    <div className="learner-shell product-page">
      <LearnerSidebar
        pathname={pathname}
        displayName={displayName}
        email={email}
        levelLabel={levelLabel}
        navLabels={navLabels}
        ariaLabels={ariaLabels}
      />
      <main id="main-content" className="dashboard-main">
        <div className="dashboard-main-inner">{children}</div>
      </main>
      <LearnerBottomNav
        pathname={pathname}
        navLabels={navLabels}
        ariaLabel={ariaLabels.shellNav}
      />
    </div>
  );
}
