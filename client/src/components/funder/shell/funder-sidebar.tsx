import Link from "next/link";
import { AccountBlock } from "@/components/shell/account-block";
import { NavItem } from "@/components/shell/nav-item";
import { BrandLockup } from "@/components/brand/brand-mark";
import { IconCompass, IconUser } from "@/components/icons";

export interface FunderSidebarProps {
  pathname: string;
  displayName: string | null;
  email: string;
  roleLabel: string;
  navLabels: { programs: string; profile: string };
}

function isProgramsActive(pathname: string): boolean {
  return pathname === "/funder" || pathname.startsWith("/funder/programs");
}

function isProfileActive(pathname: string): boolean {
  return pathname.startsWith("/funder/profile");
}

export function FunderSidebar({
  pathname,
  displayName,
  email,
  roleLabel,
  navLabels,
}: FunderSidebarProps) {
  return (
    <aside className="dashboard-sidebar" aria-label="Funder navigation">
      <div className="border-b border-border-brand px-4 py-4">
        <Link href="/funder" aria-label="Aniskwela">
          <BrandLockup />
        </Link>
      </div>

      <nav className="dashboard-sidebar-nav" aria-label="Main">
        <NavItem
          href="/funder"
          label={navLabels.programs}
          icon={<IconCompass />}
          active={isProgramsActive(pathname)}
        />
        <NavItem
          href="/funder/profile"
          label={navLabels.profile}
          icon={<IconUser />}
          active={isProfileActive(pathname)}
        />
      </nav>

      <div className="dashboard-sidebar-footer">
        <AccountBlock
          href="/funder/profile"
          displayName={displayName}
          email={email}
          roleLabel={roleLabel}
        />
      </div>
    </aside>
  );
}
