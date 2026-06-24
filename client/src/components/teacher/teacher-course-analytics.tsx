import type { CourseAnalytics } from "@/lib/courses/teacher-analytics";

export function TeacherCourseAnalyticsPanel({
  analytics,
  labels,
}: {
  analytics: CourseAnalytics;
  labels: {
    title: string;
    enrollments: string;
    completed: string;
    avgScore: string;
    credentials: string;
    noScore: string;
  };
}) {
  return (
    <section className="rounded-[var(--radius-surface)] border border-border-brand bg-surface-brand p-5">
      <h2 className="text-lg font-semibold text-soil-brand">{labels.title}</h2>
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-[var(--radius-control)] border border-border-brand bg-bg-brand/40 p-3">
          <dt className="text-xs font-medium text-text-muted-brand">
            {labels.enrollments}
          </dt>
          <dd className="mt-1 text-2xl font-bold tabular-nums text-text-brand">
            {analytics.enrollmentCount}
          </dd>
        </div>
        <div className="rounded-[var(--radius-control)] border border-border-brand bg-bg-brand/40 p-3">
          <dt className="text-xs font-medium text-text-muted-brand">
            {labels.completed}
          </dt>
          <dd className="mt-1 text-2xl font-bold tabular-nums text-growth-strong-brand">
            {analytics.completedCount}
          </dd>
        </div>
        <div className="rounded-[var(--radius-control)] border border-border-brand bg-bg-brand/40 p-3">
          <dt className="text-xs font-medium text-text-muted-brand">
            {labels.avgScore}
          </dt>
          <dd className="mt-1 text-2xl font-bold tabular-nums text-text-brand">
            {analytics.averageScore !== null
              ? `${analytics.averageScore}%`
              : labels.noScore}
          </dd>
        </div>
        <div className="rounded-[var(--radius-control)] border border-border-brand bg-bg-brand/40 p-3">
          <dt className="text-xs font-medium text-text-muted-brand">
            {labels.credentials}
          </dt>
          <dd className="mt-1 text-2xl font-bold tabular-nums text-primary-brand">
            {analytics.credentialCount}
          </dd>
        </div>
      </dl>
    </section>
  );
}
