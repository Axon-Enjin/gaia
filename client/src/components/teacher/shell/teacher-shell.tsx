"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { TeacherSidebar } from "@/components/teacher/shell/teacher-sidebar";
import { TeacherBottomNav } from "@/components/teacher/shell/teacher-bottom-nav";

export interface TeacherShellProps {
  children: React.ReactNode;
  displayName: string | null;
  email: string;
  roleLabel: string;
  navLabels: { home: string; courses: string; profile: string };
  ariaLabels: { shellNav: string; mainNav: string; brandHome: string };
}

/** Hybrid teacher chrome — sidebar on md+, bottom tabs on mobile. */
export function TeacherShell({
  children,
  displayName,
  email,
  roleLabel,
  navLabels,
  ariaLabels,
}: TeacherShellProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`teacher-shell product-page ${isCollapsed ? "is-sidebar-collapsed" : ""}`}>
      <TeacherSidebar
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
      <TeacherBottomNav
        pathname={pathname}
        navLabels={navLabels}
        ariaLabel={ariaLabels.shellNav}
      />
    </div>
  );
}
