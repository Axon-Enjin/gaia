import Link from "next/link";
import { PublishButton } from "@/components/publish-button";
import { DeleteCourseButton } from "@/components/teacher/delete-course-button";
import { IconArrowRight, IconExternalLink } from "@/components/icons";

export interface TeacherCourseCardProps {
  id: string;
  title: string;
  industry: string;
  lessonCount: number;
  status: "draft" | "published";
  lessonsLabel: string;
  previewLabel: string;
  editLabel: string;
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
  editLabel,
  statusPublishedLabel,
  statusDraftLabel,
  viewPublicLabel,
}: TeacherCourseCardProps) {
  const initial = industry.trim().charAt(0) || "C";
  const isPublished = status === "published";

  return (
    <li className="rounded-2xl border border-border-brand bg-surface-brand p-6 transition hover:border-soil-brand/30 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Link
          href={isPublished ? `/teacher/courses/${id}` : `/teacher/courses/${id}/edit`}
          className="min-w-0 flex-1"
        >
          <div className="flex items-start gap-4">
            <div className="course-thumb text-base h-12 w-12 flex-shrink-0 flex items-center justify-center" aria-hidden>
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-2.5 flex flex-wrap items-center gap-2">
                <span className="industry-pill text-xs px-2.5 py-1">{industry}</span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    isPublished
                      ? "bg-growth-brand/12 text-growth-strong-brand"
                      : "bg-warning-brand/12 text-warning-brand"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isPublished ? "bg-growth-strong-brand" : "bg-warning-brand"}`}
                    aria-hidden
                  />
                  {isPublished ? statusPublishedLabel : statusDraftLabel}
                </span>
                {lessonCount > 0 && (
                  <span className="text-xs text-text-muted-brand font-medium">
                    {lessonsLabel}
                  </span>
                )}
              </div>
              <h2 className="text-base md:text-lg font-bold text-text-brand hover:text-soil-brand">
                {title}
              </h2>
              <p className="mt-2.5 inline-flex items-center gap-1 text-base font-semibold text-growth-strong-brand">
                {isPublished ? previewLabel : editLabel}
                <IconArrowRight aria-hidden="true" />
              </p>
            </div>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-3">
          {!isPublished ? (
            <PublishButton courseId={id} />
          ) : (
            <Link
              href={`/courses/${id}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-primary-brand/10 text-primary-brand transition"
              title={viewPublicLabel}
              aria-label={viewPublicLabel}
            >
              <IconExternalLink className="text-lg" />
            </Link>
          )}
          <DeleteCourseButton courseId={id} courseTitle={title} variant="icon" />
        </div>
      </div>
    </li>
  );
}
