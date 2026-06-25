import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { listLearnerCredentials } from "@/lib/credentials/list";
import { EmptyState } from "@/components/states/empty-state";
import { formatLocaleDate } from "@/lib/i18n/format";
import { FreighterConnectPanel } from "@/components/wallet/freighter-connect-panel";
import { IconAward, IconArrowRight } from "@/components/icons";

export default async function LearnerCredentialsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const t = await getTranslations("Learner");
  const tc = await getTranslations("Credentials");
  const locale = await getLocale();
  const supabase = await createClient();
  const credentials = await listLearnerCredentials(supabase, user.id);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-growth-strong-brand">
        {tc("eyebrow")}
      </p>
      <h1 className="mt-2 text-2xl font-bold text-soil-brand sm:text-3xl">
        {tc("walletTitle")}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-text-muted-brand sm:text-base">
        {tc("walletSubtitle")}
      </p>

      <FreighterConnectPanel className="mt-6" surface="learner" />

      {credentials.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<IconAward />}
            text={tc("empty")}
            action={
              <Link
                href="/learner/courses"
                prefetch={false}
                className="btn btn-primary btn-sm"
              >
                {t("browseCourses")}
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {credentials.map((cred) => (
            <li key={cred.id}>
              <Link
                href={`/learner/credentials/${cred.id}`}
                prefetch={false}
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
                        date: formatLocaleDate(locale, cred.issued_at),
                      })}
                      {cred.final_score !== null &&
                        ` · ${tc("score", { score: cred.final_score })}`}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-growth-strong-brand">
                      {tc("viewVerify")}
                      <IconArrowRight
                        className="transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
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
