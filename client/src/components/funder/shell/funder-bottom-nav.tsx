import { NavItem } from "@/components/shell/nav-item";
import { IconCompass, IconUser } from "@/components/icons";

export interface FunderBottomNavProps {
  pathname: string;
  navLabels: { programs: string; profile: string };
}

function isProgramsActive(pathname: string): boolean {
  return pathname === "/funder" || pathname.startsWith("/funder/programs");
}

function isProfileActive(pathname: string): boolean {
  return pathname.startsWith("/funder/profile");
}

export function FunderBottomNav({
  pathname,
  navLabels,
}: FunderBottomNavProps) {
  return (
    <nav className="dashboard-bottom-nav" aria-label="Funder navigation">
      <NavItem
        href="/funder"
        label={navLabels.programs}
        icon={<IconCompass />}
        active={isProgramsActive(pathname)}
        variant="bottom"
      />
      <NavItem
        href="/funder/profile"
        label={navLabels.profile}
        icon={<IconUser />}
        active={isProfileActive(pathname)}
        variant="bottom"
      />
    </nav>
  );
}
