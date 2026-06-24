import Link from "next/link";
import { PublishButton } from "@/components/publish-button";
import { DeleteCourseButton } from "@/components/teacher/delete-course-button";
import { IconArrowRight } from "@/components/icons";

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
    <li className="rounded-xl border border-border-brand bg-surface-brand p-4 transition hover:border-soil-brand/30 hover:shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Link
          href={isPublished ? `/teacher/courses/${id}` : `/teacher/courses/${id}/edit`}
          className="min-w-0 flex-1"
        >
          <div className="flex items-start gap-3">
            <div className="course-thumb text-sm" aria-hidden>
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="industry-pill">{industry}</span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
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
                  <span className="text-xs text-text-muted-brand">
                    {lessonsLabel}
                  </span>
                )}
              </div>
              <h2 className="font-semibold text-text-brand hover:text-soil-brand">
                {title}
              </h2>
              <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-growth-strong-brand">
                {isPublished ? previewLabel : editLabel}
                <IconArrowRight aria-hidden="true" />
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
          <DeleteCourseButton courseId={id} courseTitle={title} />
        </div>
      </div>
    </li>
  );
}
