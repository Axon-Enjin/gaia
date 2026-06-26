"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { FunderSidebar } from "@/components/funder/shell/funder-sidebar";
import { FunderBottomNav } from "@/components/funder/shell/funder-bottom-nav";

export interface FunderShellProps {
  children: React.ReactNode;
  displayName: string | null;
  email: string;
  roleLabel: string;
  navLabels: { programs: string; profile: string };
  ariaLabels: { shellNav: string; mainNav: string; brandHome: string };
}

/** Hybrid funder chrome — sidebar on md+, bottom tabs on mobile. */
export function FunderShell({
  children,
  displayName,
  email,
  roleLabel,
  navLabels,
  ariaLabels,
}: FunderShellProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`funder-shell product-page ${isCollapsed ? "is-sidebar-collapsed" : ""}`}>
      <FunderSidebar
        pathname={pathname}
        displayName={displayName}
        email={email}
        roleLabel={roleLabel}
        navLabels={navLabels}
        ariaLabels={ariaLabels}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <main id="main-content" className="dashboard-main">
        <div className="dashboard-main-inner">{children}</div>
      </main>
      <FunderBottomNav
        pathname={pathname}
        navLabels={navLabels}
        ariaLabel={ariaLabels.shellNav}
      />
    </div>
  );
}
