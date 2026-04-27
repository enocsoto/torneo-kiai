"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nContext";
import { focusRing } from "@/lib/ui";

export default function SupportSuccessPage() {
  const { t } = useI18n();
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 text-[var(--foreground)] transition-colors duration-200">
      <div className="page-radial pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.08] blur-3xl dark:bg-green-600/10" />
      </div>

      <div className="relative z-10 flex max-w-sm flex-col items-center gap-6 text-center">
        <div className="flex size-20 items-center justify-center rounded-full border border-emerald-200/80 bg-emerald-50 ring-1 ring-emerald-200/60 dark:border-green-500/30 dark:bg-green-500/15 dark:ring-green-500/30">
          <span className="text-4xl leading-none" role="img" aria-hidden>💬</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            {t("coffee.thanks")}
          </h1>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            {t("support.exitoLine")}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 pt-2">
          <Link
            href="/"
            className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3.5 text-sm font-semibold text-[var(--on-accent)] shadow-lg shadow-orange-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:text-white dark:shadow-orange-500/25 ${focusRing}`}
          >
            ⚡ {t("support.homeCta")}
          </Link>
          <Link
            href="/support"
            className={`rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-ghost)] px-6 py-2.5 text-sm font-medium text-[var(--muted)] transition-colors duration-150 [@media(hover:hover)_and_(pointer:fine)]:hover:border-[var(--border-muted)] [@media(hover:hover)_and_(pointer:fine)]:hover:text-[var(--foreground)] ${focusRing}`}
          >
            {t("coffee.navLabel")}
          </Link>
        </div>
      </div>
    </div>
  );
}
