import { getTranslations } from "next-intl/server";
import { GrantProgramBuilder } from "@/components/funder/grant-program-builder";

export default async function NewGrantProgramPage() {
  const t = await getTranslations("Funder");

  return (
    <>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-growth-strong-brand">
          {t("builderEyebrow")}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-soil-brand sm:text-3xl">
          {t("newProgramTitle")}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-text-muted-brand">
          {t("newProgramSubtitle")}
        </p>
      </div>

      <GrantProgramBuilder mode="create" />
    </>
  );
}
