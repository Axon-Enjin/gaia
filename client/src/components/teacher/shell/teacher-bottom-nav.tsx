import { NavItem } from "@/components/shell/nav-item";

export interface TeacherBottomNavProps {
  pathname: string;
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

export function TeacherBottomNav({
  pathname,
  navLabels,
}: TeacherBottomNavProps) {
  return (
    <nav className="dashboard-bottom-nav" aria-label="Teacher navigation">
      <NavItem
        href="/teacher"
        label={navLabels.home}
        icon="⌂"
        active={isHomeActive(pathname)}
        variant="bottom"
      />
      <NavItem
        href="/teacher/courses"
        label={navLabels.courses}
        icon="☰"
        active={isCoursesActive(pathname)}
        variant="bottom"
      />
      <NavItem
        href="/teacher/profile"
        label={navLabels.profile}
        icon="◉"
        active={isProfileActive(pathname)}
        variant="bottom"
      />
    </nav>
  );
}
