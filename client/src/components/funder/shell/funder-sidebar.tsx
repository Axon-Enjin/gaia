import Link from "next/link";
import { AccountBlock } from "@/components/shell/account-block";
import { NavItem } from "@/components/shell/nav-item";
import { BrandLockup, BrandMark } from "@/components/brand/brand-mark";
import { signOutAction } from "@/app/actions/auth";
import { IconCompass, IconUser } from "@/components/icons";

export interface FunderSidebarProps {
  pathname: string;
  displayName: string | null;
  email: string;
  roleLabel: string;
  navLabels: { programs: string; profile: string };
  ariaLabels: { shellNav: string; mainNav: string; brandHome: string };
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

function isProgramsActive(pathname: string): boolean {
  return pathname === "/funder" || pathname.startsWith("/funder/programs");
}

function isProfileActive(pathname: string): boolean {
  return pathname.startsWith("/funder/profile");
}

const IconChevronLeft = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const IconChevronRight = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const IconLogOut = () => (
  <svg width="1.1em" height="1.1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export function FunderSidebar({
  pathname,
  displayName,
  email,
  roleLabel,
  navLabels,
  ariaLabels,
  isCollapsed = false,
  onToggleCollapse,
}: FunderSidebarProps) {
  return (
    <aside className="dashboard-sidebar" aria-label={ariaLabels.shellNav}>
      <div className="border-b border-border-brand px-4 py-4 flex items-center justify-between relative min-h-[73px]">
        {isCollapsed ? (
          <div className="flex flex-col items-center w-full gap-3">
            <Link
              href="/funder"
              prefetch={false}
              aria-label={ariaLabels.brandHome}
              className="mx-auto"
            >
              <BrandMark className="brand-lockup-mark" aria-hidden="true" />
            </Link>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="text-text-muted-brand hover:text-text-brand p-1.5 rounded hover:bg-soil-brand/10 transition"
                aria-label="Expand sidebar"
              >
                <IconChevronRight />
              </button>
            )}
          </div>
        ) : (
          <>
            <Link
              href="/funder"
              prefetch={false}
              aria-label={ariaLabels.brandHome}
            >
              <BrandLockup />
            </Link>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="text-text-muted-brand hover:text-text-brand p-1.5 rounded hover:bg-soil-brand/10 transition flex items-center justify-center"
                aria-label="Collapse sidebar"
              >
                <IconChevronLeft />
              </button>
            )}
          </>
        )}
      </div>

      <nav className="dashboard-sidebar-nav" aria-label={ariaLabels.mainNav}>
        <NavItem
          href="/funder"
          label={navLabels.programs}
          icon={<IconCompass />}
          active={isProgramsActive(pathname)}
          collapsed={isCollapsed}
        />
        <NavItem
          href="/funder/profile"
          label={navLabels.profile}
          icon={<IconUser />}
          active={isProfileActive(pathname)}
          collapsed={isCollapsed}
        />
      </nav>

      {/* Footer block with Account info and Logout button */}
      <div className={`dashboard-sidebar-footer flex ${isCollapsed ? "flex-col items-center gap-3" : "items-center justify-between gap-2"}`}>
        <div className={isCollapsed ? "w-full" : "min-w-0 flex-1"}>
          <AccountBlock
            href="/funder/profile"
            displayName={displayName}
            email={email}
            roleLabel={roleLabel}
            collapsed={isCollapsed}
          />
        </div>
        <form action={signOutAction} className="flex-shrink-0">
          <button
            type="submit"
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-soil-brand/10 text-soil-brand transition"
            title="Log out"
            aria-label="Log out"
          >
            <IconLogOut />
          </button>
        </form>
      </div>
    </aside>
  );
}
