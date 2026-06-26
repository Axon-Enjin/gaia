import type { ReactNode } from "react";
import Link from "next/link";

export interface NavItemProps {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  variant?: "sidebar" | "bottom";
  collapsed?: boolean;
}

/** Shared nav link for dashboard shells (sidebar + bottom tabs). */
export function NavItem({
  href,
  label,
  icon,
  active,
  variant = "sidebar",
  collapsed = false,
}: NavItemProps) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={`dashboard-nav-item ${active ? "is-active" : ""}`}
      aria-current={active ? "page" : undefined}
      data-variant={variant}
    >
      <span className="dashboard-nav-icon" aria-hidden>
        {icon}
      </span>
      <span className={collapsed ? "sr-only" : ""}>{label}</span>
    </Link>
  );
}
