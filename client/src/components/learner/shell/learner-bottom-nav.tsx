import { NavItem } from "@/components/shell/nav-item";
import {
  IconHome,
  IconBook,
  IconAward,
  IconUser,
} from "@/components/icons";

export interface LearnerBottomNavProps {
  pathname: string;
  navLabels: {
    home: string;
    courses: string;
    credentials: string;
    profile: string;
  };
  ariaLabel: string;
}

function isHomeActive(pathname: string): boolean {
  return pathname === "/learner";
}

function isCoursesActive(pathname: string): boolean {
  return pathname.startsWith("/learner/courses");
}

function isCredentialsActive(pathname: string): boolean {
  return pathname.startsWith("/learner/credentials");
}

function isProfileActive(pathname: string): boolean {
  return pathname.startsWith("/learner/profile");
}

export function LearnerBottomNav({
  pathname,
  navLabels,
  ariaLabel,
}: LearnerBottomNavProps) {
  return (
    <nav className="dashboard-bottom-nav" aria-label={ariaLabel}>
      <NavItem
        href="/learner"
        label={navLabels.home}
        icon={<IconHome />}
        active={isHomeActive(pathname)}
        variant="bottom"
      />
      <NavItem
        href="/learner/courses"
        label={navLabels.courses}
        icon={<IconBook />}
        active={isCoursesActive(pathname)}
        variant="bottom"
      />
      <NavItem
        href="/learner/credentials"
        label={navLabels.credentials}
        icon={<IconAward />}
        active={isCredentialsActive(pathname)}
        variant="bottom"
      />
      <NavItem
        href="/learner/profile"
        label={navLabels.profile}
        icon={<IconUser />}
        active={isProfileActive(pathname)}
        variant="bottom"
      />
    </nav>
  );
}
