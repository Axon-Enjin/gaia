import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import {
  getFunderProgram,
  getLatestDisbursement,
} from "@/lib/grants/programs";
import { GrantProgramBuilder } from "@/components/funder/grant-program-builder";
import { SimulateDisburseButton } from "@/components/funder/simulate-disburse-button";
import { DeleteGrantProgramButton } from "@/components/funder/delete-grant-program-button";
import { IconArrowRight } from "@/components/icons";

export default async function GrantProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return null;

  const t = await getTranslations("Funder");
  const supabase = await createClient();
  const program = await getFunderProgram(supabase, user.id, id);

  if (!program) notFound();

  const latest = await getLatestDisbursement(supabase, user.id, id);

  return (
    <>
      <div className="mb-6">
        <Link
          href="/funder"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-brand hover:underline"
        >
          {t("backToPrograms")} <IconArrowRight className="rotate-180" aria-hidden="true" />
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-soil-brand sm:text-3xl">
          {program.name}
        </h1>
        {latest && (
          <p className="mt-2 text-sm text-text-muted-brand">
            {t("lastDisbursement", {
              count: latest.recipient_count,
              date: new Date(latest.created_at).toLocaleDateString(),
            })}
          </p>
        )}
      </div>

      <section
        className="mb-8 rounded-[var(--radius-surface)] border border-warning-brand/30 bg-warning-brand/8 px-4 py-3 text-sm text-soil-brand"
        role="note"
      >
        {t("simulationNotice")}
      </section>

      <GrantProgramBuilder mode="edit" program={program} />

      <SimulateDisburseButton programId={program.id} />

      <div className="mt-10 border-t border-border-brand pt-8">
        <DeleteGrantProgramButton programId={program.id} programName={program.name} />
      </div>
    </>
  );
}
