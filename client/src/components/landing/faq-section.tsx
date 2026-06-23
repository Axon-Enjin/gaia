import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/landing/section-heading";

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-lg border border-border-brand bg-surface-brand">
      <summary className="cursor-pointer list-none px-4 py-3 font-medium text-text-brand marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-2">
          {question}
          <span
            className="shrink-0 text-growth-brand transition group-open:rotate-45"
            aria-hidden
          >
            +
          </span>
        </span>
      </summary>
      <p className="border-t border-border-brand px-4 py-3 text-sm leading-relaxed text-text-muted-brand">
        {answer}
      </p>
    </details>
  );
}

export async function FaqSection() {
  const t = await getTranslations("Landing");

  return (
    <section className="section-pad">
      <SectionHeading title={t("faqTitle")} />
      <div className="flex flex-col gap-3">
        <FaqItem question={t("faq1Q")} answer={t("faq1A")} />
        <FaqItem question={t("faq2Q")} answer={t("faq2A")} />
        <FaqItem question={t("faq3Q")} answer={t("faq3A")} />
        <FaqItem question={t("faq4Q")} answer={t("faq4A")} />
      </div>
    </section>
  );
}
