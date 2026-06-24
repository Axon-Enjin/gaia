import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { listLearnerCredentials } from "@/lib/credentials/list";

export default async function LearnerCredentialsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const t = await getTranslations("Learner");
  const tc = await getTranslations("Credentials");
  const supabase = await createClient();
  const credentials = await listLearnerCredentials(supabase, user.id);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-growth-brand">
        {tc("eyebrow")}
      </p>
      <h1 className="mt-2 text-2xl font-bold text-soil-brand sm:text-3xl">
        {tc("walletTitle")}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-text-muted-brand sm:text-base">
        {tc("walletSubtitle")}
      </p>

      {credentials.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border-brand bg-surface-brand px-6 py-10 text-center">
          <p className="text-text-muted-brand">{tc("empty")}</p>
          <Link
            href="/learner/courses"
            className="site-btn-primary mt-6 inline-flex"
          >
            {t("browseCourses")}
          </Link>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {credentials.map((cred) => (
            <li key={cred.id}>
              <Link
                href={`/learner/credentials/${cred.id}`}
                className="course-card group block"
              >
                <div className="flex items-start gap-4">
                  <div className="course-thumb" aria-hidden>
                    {cred.course_industry.trim().charAt(0) || "C"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="industry-pill">{cred.course_industry}</span>
                      {cred.network === "mock" && (
                        <span className="text-xs text-text-muted-brand">
                          {tc("mockBadge")}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold text-text-brand group-hover:text-soil-brand">
                      {cred.course_title}
                    </h2>
                    <p className="mt-2 text-sm text-text-muted-brand">
                      {tc("issuedOn", {
                        date: new Date(cred.issued_at).toLocaleDateString(),
                      })}
                      {cred.final_score !== null &&
                        ` · ${tc("score", { score: cred.final_score })}`}
                    </p>
                    <p className="mt-2 text-sm font-medium text-growth-brand">
                      {tc("viewVerify")}
                      <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">
                        →
                      </span>
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
