import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  text: string;
  action?: ReactNode;
}

/**
 * Canonical empty-state surface (DSD §5). Replaces the ad-hoc `.callout-card`
 * empties scattered across the product routes so every "nothing here yet"
 * moment looks and reads the same.
 */
export function EmptyState({ icon, title, text, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && (
        <span className="empty-state-icon" aria-hidden>
          {icon}
        </span>
      )}
      {title && <p className="empty-state-title">{title}</p>}
      <p className="empty-state-text">{text}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
