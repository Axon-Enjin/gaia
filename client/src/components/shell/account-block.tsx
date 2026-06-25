import Link from "next/link";

export interface AccountBlockProps {
  href: string;
  displayName: string | null;
  email: string;
  roleLabel: string;
}

function initials(displayName: string | null, email: string): string {
  if (displayName?.trim()) {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return displayName.trim().slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

/** Compact account summary — sidebar footer, links to profile. */
export function AccountBlock({
  href,
  displayName,
  email,
  roleLabel,
}: AccountBlockProps) {
  const name = displayName?.trim() || email.split("@")[0];

  return (
    <Link href={href} prefetch={false} className="dashboard-account-block">
      <div className="dashboard-account-avatar" aria-hidden>
        {initials(displayName, email)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-brand">{name}</p>
        <p className="truncate text-xs text-growth-brand">{roleLabel}</p>
      </div>
    </Link>
  );
}
