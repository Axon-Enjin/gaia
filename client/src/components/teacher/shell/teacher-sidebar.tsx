import Link from "next/link";
import { AccountBlock } from "@/components/shell/account-block";
import { NavItem } from "@/components/shell/nav-item";

export interface TeacherSidebarProps {
  pathname: string;
  displayName: string | null;
  email: string;
  roleLabel: string;
  navLabels: { home: string; courses: string; profile: string };
}

function isHomeActive(pathname: string): boolean {
  return pathname === "/teacher";
}

function isCoursesActive(pathname: string): boolean {
  return pathname.startsWith("/teacher/courses");
}

function isProfileActive(pathname: string): boolean {
  return pathname.startsWith("/teacher/profile");
}

export function TeacherSidebar({
  pathname,
  displayName,
  email,
  roleLabel,
  navLabels,
}: TeacherSidebarProps) {
  return (
    <aside className="dashboard-sidebar" aria-label="Teacher navigation">
      <div className="border-b border-border-brand px-4 py-4">
        <Link
          href="/teacher"
          className="text-lg font-bold tracking-tight text-soil-brand"
        >
          Aniskwela
        </Link>
      </div>

      <nav className="dashboard-sidebar-nav" aria-label="Main">
        <NavItem
          href="/teacher"
          label={navLabels.home}
          icon="⌂"
          active={isHomeActive(pathname)}
        />
        <NavItem
          href="/teacher/courses"
          label={navLabels.courses}
          icon="☰"
          active={isCoursesActive(pathname)}
        />
        <NavItem
          href="/teacher/profile"
          label={navLabels.profile}
          icon="◉"
          active={isProfileActive(pathname)}
        />
      </nav>

      <div className="dashboard-sidebar-footer">
        <AccountBlock
          href="/teacher/profile"
          displayName={displayName}
          email={email}
          roleLabel={roleLabel}
        />
      </div>
    </aside>
  );
}
