"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nContext";
import { focusRing } from "@/lib/ui";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden px-4 py-16 text-center text-[var(--foreground)]">
      <div
        className="page-radial pointer-events-none absolute inset-0"
        aria-hidden
      />
      <p className="relative text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent-text)]">
        {t("app.title")}
      </p>
      <h1 className="relative mt-4 text-4xl font-semibold tabular-nums tracking-tight">
        404
      </h1>
      <p className="relative mt-3 max-w-sm text-pretty text-[var(--muted)]">
        {t("notFound.message")}
      </p>
      <Link
        href="/"
        className={`relative mt-8 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 text-sm font-semibold text-[var(--on-accent)] shadow-lg shadow-orange-500/20 ${focusRing}`}
      >
        {t("notFound.back")}
      </Link>
    </div>
  );
}
