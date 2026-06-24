import Link from "next/link";
import { PublishButton } from "@/components/publish-button";

export interface TeacherCourseCardProps {
  id: string;
  title: string;
  industry: string;
  lessonCount: number;
  status: "draft" | "published";
  lessonsLabel: string;
  previewLabel: string;
  statusPublishedLabel: string;
  statusDraftLabel: string;
  viewPublicLabel: string;
}

/** Teacher course row — product styling with preview + publish actions. */
export function TeacherCourseCard({
  id,
  title,
  industry,
  lessonCount,
  status,
  lessonsLabel,
  previewLabel,
  statusPublishedLabel,
  statusDraftLabel,
  viewPublicLabel,
}: TeacherCourseCardProps) {
  const initial = industry.trim().charAt(0) || "C";
  const isPublished = status === "published";

  return (
    <li className="rounded-xl border border-border-brand bg-surface-brand p-4 transition hover:border-soil-brand/30 hover:shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Link href={`/teacher/courses/${id}`} className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <div className="course-thumb text-sm" aria-hidden>
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="industry-pill">{industry}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    isPublished
                      ? "bg-growth-brand/10 text-growth-brand"
                      : "bg-warning-brand/10 text-warning-brand"
                  }`}
                >
                  {isPublished ? statusPublishedLabel : statusDraftLabel}
                </span>
                {lessonCount > 0 && (
                  <span className="text-xs text-text-muted-brand">
                    {lessonsLabel}
                  </span>
                )}
              </div>
              <h2 className="font-semibold text-text-brand hover:text-soil-brand">
                {title}
              </h2>
              <p className="mt-2 text-sm font-medium text-growth-brand">
                {previewLabel} →
              </p>
            </div>
          </div>
        </Link>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {!isPublished ? (
            <PublishButton courseId={id} />
          ) : (
            <Link
              href={`/courses/${id}`}
              className="text-sm font-medium text-primary-brand hover:underline"
            >
              {viewPublicLabel}
            </Link>
          )}
        </div>
      </div>
    </li>
  );
}
