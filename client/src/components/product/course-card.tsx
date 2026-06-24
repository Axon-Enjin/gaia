import Link from "next/link";

export interface CourseCardProps {
  id: string;
  title: string;
  industry: string;
  lessonCount: number;
  lessonsLabel: string;
  viewLabel: string;
  /** Course link prefix — public `/courses` or learner `/learner/courses`. */
  basePath?: string;
}

/** Catalog card — industry thumb, meta, and hover affordance. */
export function CourseCard({
  id,
  title,
  industry,
  lessonCount,
  lessonsLabel,
  viewLabel,
  basePath = "/courses",
}: CourseCardProps) {
  const initial = industry.trim().charAt(0) || "C";

  return (
    <li>
      <Link href={`${basePath}/${id}`} className="course-card group">
        <div className="flex items-start gap-4">
          <div className="course-thumb" aria-hidden>
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="industry-pill">{industry}</span>
              {lessonCount > 0 && (
                <span className="text-xs text-text-muted-brand">
                  {lessonsLabel}
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold leading-snug text-text-brand group-hover:text-soil-brand">
              {title}
            </h2>
            <p className="mt-2 text-sm font-medium text-growth-brand">
              {viewLabel}
              <span
                className="ml-1 inline-block transition-transform group-hover:translate-x-0.5"
                aria-hidden
              >
                →
              </span>
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
}
