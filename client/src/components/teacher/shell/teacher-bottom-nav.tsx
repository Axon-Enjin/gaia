import { NavItem } from "@/components/shell/nav-item";
import { IconHome, IconLayers, IconUser } from "@/components/icons";

export interface TeacherBottomNavProps {
  pathname: string;
  navLabels: { home: string; courses: string; profile: string };
  ariaLabel: string;
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
  ariaLabel,
}: TeacherBottomNavProps) {
  return (
    <nav className="dashboard-bottom-nav" aria-label={ariaLabel}>
      <NavItem
        href="/teacher"
        label={navLabels.home}
        icon={<IconHome />}
        active={isHomeActive(pathname)}
        variant="bottom"
      />
      <NavItem
        href="/teacher/courses"
        label={navLabels.courses}
        icon={<IconLayers />}
        active={isCoursesActive(pathname)}
        variant="bottom"
      />
      <NavItem
        href="/teacher/profile"
        label={navLabels.profile}
        icon={<IconUser />}
        active={isProfileActive(pathname)}
        variant="bottom"
      />
    </nav>
  );
}
