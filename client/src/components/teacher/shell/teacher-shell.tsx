"use client";

import { usePathname } from "next/navigation";
import { TeacherSidebar } from "@/components/teacher/shell/teacher-sidebar";
import { TeacherBottomNav } from "@/components/teacher/shell/teacher-bottom-nav";

export interface TeacherShellProps {
  children: React.ReactNode;
  displayName: string | null;
  email: string;
  roleLabel: string;
  navLabels: { home: string; courses: string; profile: string };
}

/** Hybrid teacher chrome — sidebar on md+, bottom tabs on mobile. */
export function TeacherShell({
  children,
  displayName,
  email,
  roleLabel,
  navLabels,
}: TeacherShellProps) {
  const pathname = usePathname();

  return (
    <div className="teacher-shell product-page">
      <TeacherSidebar
        pathname={pathname}
        displayName={displayName}
        email={email}
        roleLabel={roleLabel}
        navLabels={navLabels}
      />
      <div className="dashboard-main">
        <div className="dashboard-main-inner">{children}</div>
      </div>
      <TeacherBottomNav pathname={pathname} navLabels={navLabels} />
    </div>
  );
}
