import Link from "next/link";

import { AccountBlock } from "@/components/shell/account-block";
import { NavItem } from "@/components/shell/nav-item";
import { BrandLockup } from "@/components/brand/brand-mark";
import {
  IconHome,
  IconBook,
  IconAward,
  IconUser,
} from "@/components/icons";

export interface LearnerSidebarProps {
  pathname: string;
  displayName: string | null;
  email: string;
  levelLabel: string;
  navLabels: {
    home: string;
    courses: string;
    credentials: string;
    profile: string;
  };
  ariaLabels: { shellNav: string; mainNav: string; brandHome: string };
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

export function LearnerSidebar({
  pathname,
  displayName,
  email,
  levelLabel,
  navLabels,
  ariaLabels,
}: LearnerSidebarProps) {
  return (
    <aside className="dashboard-sidebar" aria-label={ariaLabels.shellNav}>
      <div className="border-b border-border-brand px-4 py-4">
        <Link
          href="/learner"
          prefetch={false}
          aria-label={ariaLabels.brandHome}
        >
          <BrandLockup />
        </Link>
      </div>

      <nav className="dashboard-sidebar-nav" aria-label={ariaLabels.mainNav}>
        <NavItem
          href="/learner"
          label={navLabels.home}
          icon={<IconHome />}
          active={isHomeActive(pathname)}
        />
        <NavItem
          href="/learner/courses"
          label={navLabels.courses}
          icon={<IconBook />}
          active={isCoursesActive(pathname)}
        />
        <NavItem
          href="/learner/credentials"
          label={navLabels.credentials}
          icon={<IconAward />}
          active={isCredentialsActive(pathname)}
        />
        <NavItem
          href="/learner/profile"
          label={navLabels.profile}
          icon={<IconUser />}
          active={isProfileActive(pathname)}
        />
      </nav>

      <div className="dashboard-sidebar-footer">
        <AccountBlock
          href="/learner/profile"
          displayName={displayName}
          email={email}
          roleLabel={levelLabel}
        />
      </div>
    </aside>
  );
}
