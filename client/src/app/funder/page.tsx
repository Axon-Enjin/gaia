import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { listFunderPrograms } from "@/lib/grants/programs";
import { GrantProgramCard } from "@/components/funder/grant-program-card";
import { EmptyState } from "@/components/states/empty-state";
import { FreighterConnectPanel } from "@/components/wallet/freighter-connect-panel";
import { IconCompass, IconPlus, IconArrowRight } from "@/components/icons";

export default async function FunderHomePage() {
  const t = await getTranslations("Funder");
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();
  const programs = await listFunderPrograms(supabase, user.id);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-growth-strong-brand">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-soil-brand sm:text-4xl lg:text-5xl">
            {t("dashboardTitle")}
          </h1>
          <p className="mt-3 max-w-2xl text-base lg:text-lg text-text-muted-brand">
            {t("homeSubtitle")}
          </p>
        </div>
        <Link
          href="/funder/programs/new"
          prefetch={false}
          className="btn btn-primary shrink-0"
        >
          <IconPlus aria-hidden="true" />
          {t("newProgram")}
        </Link>
      </div>

      <section
        className="mb-8 rounded-2xl border border-warning-brand/30 bg-warning-brand/8 p-5 text-base text-soil-brand font-medium"
        role="note"
      >
        {t("simulationNotice")}
      </section>

      <FreighterConnectPanel className="mb-8" surface="funder" />

      {programs.length === 0 ? (
        <EmptyState
          icon={<IconCompass />}
          text={t("emptyPrograms")}
          action={
            <Link
              href="/funder/programs/new"
              prefetch={false}
              className="btn btn-primary btn-sm"
            >
              {t("createFirstProgram")}
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {programs.map((program) => (
            <li key={program.id}>
              <GrantProgramCard program={program} />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-10 text-sm text-text-muted-brand">
        <Link
          href="/funder/programs/new"
          prefetch={false}
          className="inline-flex items-center gap-1 font-medium text-primary-brand hover:underline"
        >
          {t("newProgram")} <IconArrowRight aria-hidden="true" />
        </Link>
      </p>
    </>
  );
}
