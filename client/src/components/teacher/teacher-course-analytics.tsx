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
    <section className="rounded-xl border border-border-brand bg-surface-brand p-5">
      <h2 className="text-lg font-semibold text-soil-brand">{labels.title}</h2>
      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <dt className="text-xs text-text-muted-brand">{labels.enrollments}</dt>
          <dd className="text-2xl font-bold text-text-brand">
            {analytics.enrollmentCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-text-muted-brand">{labels.completed}</dt>
          <dd className="text-2xl font-bold text-growth-brand">
            {analytics.completedCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-text-muted-brand">{labels.avgScore}</dt>
          <dd className="text-2xl font-bold text-text-brand">
            {analytics.averageScore !== null
              ? `${analytics.averageScore}%`
              : labels.noScore}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-text-muted-brand">{labels.credentials}</dt>
          <dd className="text-2xl font-bold text-primary-brand">
            {analytics.credentialCount}
          </dd>
        </div>
      </dl>
    </section>
  );
}
