import type { SVGProps } from "react";

type BrandMarkProps = SVGProps<SVGSVGElement> & {
  /** "color" uses brand fills; "mono"/"reversed" follow currentColor. */
  variant?: "color" | "mono" | "reversed";
  title?: string;
};

/**
 * Aniskwela mark — a sprout rising from a soil baseline, set on a banig weave
 * tick. Ties the name (harvest + school), the growth ladder, and the woven
 * textile motif from DSD §0. Pure SVG, no raster bytes.
 */
export function BrandMark({
  variant = "color",
  title = "Aniskwela",
  ...props
}: BrandMarkProps) {
  const mono = variant !== "color";
  const soil = mono ? "currentColor" : "#6B4F3A";
  const stem = mono ? "currentColor" : "#2F7548";
  const leaf = mono ? "currentColor" : "#3F8E5B";

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>{title}</title>
      {/* banig weave ticks under the soil line */}
      <g stroke={soil} strokeWidth="1" opacity={mono ? 0.5 : 0.35}>
        <path d="M5 22.5h2M9 22.5h2M13 22.5h2M17 22.5h2" strokeLinecap="round" />
      </g>
      {/* soil baseline */}
      <path
        d="M4 20h16"
        stroke={soil}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* stem */}
      <path
        d="M12 20V9.5"
        stroke={stem}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* right leaf */}
      <path
        d="M12 13.2c0.2-3.4 2.6-5.7 5.6-6 0.1 3.4-2.4 5.8-5.6 6z"
        fill={leaf}
      />
      {/* left leaf */}
      <path
        d="M12 15.2c-0.3-2.9-2.4-4.9-5-5.2-0.1 2.9 2.1 5 5 5.2z"
        fill={stem}
      />
      {/* bud */}
      <circle cx="12" cy="7.4" r="1.5" fill={leaf} />
    </svg>
  );
}

type BrandLockupProps = {
  className?: string;
  markClassName?: string;
  wordClassName?: string;
  word?: string;
  variant?: BrandMarkProps["variant"];
};

/** Mark + wordmark lockup for headers and sidebars. */
export function BrandLockup({
  className,
  markClassName = "brand-lockup-mark",
  wordClassName = "brand-lockup-word",
  word = "Aniskwela",
  variant = "color",
}: BrandLockupProps) {
  return (
    <span className={className ?? "brand-lockup"}>
      <BrandMark className={markClassName} variant={variant} aria-hidden="true" />
      <span className={wordClassName}>{word}</span>
    </span>
  );
}
