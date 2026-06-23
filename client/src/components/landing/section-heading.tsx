export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  id,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  id?: string;
  className?: string;
}) {
  return (
    <div className={`mb-8 max-w-2xl ${className}`}>
      {eyebrow && (
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-growth-brand">
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className="text-2xl font-bold leading-tight text-soil-brand sm:text-3xl"
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base leading-relaxed text-text-muted-brand sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
