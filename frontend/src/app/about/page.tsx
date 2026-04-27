"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nContext";
import { focusRing, pressScale } from "@/lib/ui";

function ProseBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 text-left">
      <h2 className="text-lg font-semibold text-[var(--foreground-secondary)]">
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-[var(--muted)] [&_p]:text-pretty">
        {children}
      </div>
    </section>
  );
}

export default function AboutPage() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[var(--background)] text-[var(--foreground)]">
      <div className="page-radial pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -left-32 -top-24 h-72 w-72 rounded-full bg-orange-500/[0.06] blur-3xl" />
        <div className="absolute -right-24 top-1/3 h-64 w-64 rounded-full bg-amber-400/[0.04] blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-4 py-6 pb-20 sm:px-6 sm:py-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-text)]">
            {t("about.tag")}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
            {t("about.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-[var(--muted)]">
            {t("about.lead")}
          </p>
        </div>

        <ProseBlock title={t("about.sectionWhatTitle")}>
          <p>{t("about.sectionWhatP1")}</p>
          <p>{t("about.sectionWhatP2")}</p>
        </ProseBlock>

        <ProseBlock title={t("about.sectionWhoTitle")}>
          <p>{t("about.sectionWhoP1")}</p>
        </ProseBlock>

        <ProseBlock title={t("about.sectionLegalTitle")}>
          <p>{t("about.sectionLegalP1")}</p>
          <p>{t("about.sectionLegalP2")}</p>
          <p>{t("about.sectionLegalP3")}</p>
        </ProseBlock>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-glass)] p-5 text-center shadow-[var(--shadow-card)]">
          <p className="text-sm font-medium text-[var(--foreground-secondary)]">
            {t("about.supportHint")}
          </p>
          <Link
            href="/support"
            className={`mt-3 inline-flex items-center justify-center rounded-xl border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-5 py-2.5 text-sm font-semibold text-[var(--accent-text)] transition-colors [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[var(--accent)]/18 ${focusRing} ${pressScale}`}
          >
            {t("about.supportCta")}
          </Link>
        </div>

        <p className="text-center text-xs text-[var(--muted)]">
          {t("about.footerLine", { year })}
        </p>
      </main>
    </div>
  );
}
