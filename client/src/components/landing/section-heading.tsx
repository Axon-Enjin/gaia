export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  id,
  className = "",
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  id?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={`max-w-2xl ${compact ? "mb-5" : "mb-8"} ${className}`}>
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h2
        id={id}
        className={`display-font font-bold leading-[1.15] text-soil-brand ${
          compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-2 text-text-muted-brand ${
            compact
              ? "text-sm leading-relaxed"
              : "text-base leading-relaxed sm:text-lg"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
