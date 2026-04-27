"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nContext";
import { focusRing, pressScale } from "@/lib/ui";

/** Same idea as the `/support` back control: chevron chip, no “←” in the label. */
export function BackToTournamentLink({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  return (
    <Link
      href="/"
      className={[
        "group inline-flex items-center gap-2 rounded-xl border border-[var(--border-muted)] bg-[var(--surface-glass)] px-3.5 py-2 text-sm font-semibold text-[var(--foreground-secondary)] shadow-[0_4px_24px_rgba(0,0,0,0.12)] backdrop-blur-md",
        "ring-1 ring-[var(--border-subtle)] transition-all duration-200",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:border-[var(--accent)]/35 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[var(--chip-surface-hover)] [@media(hover:hover)_and_(pointer:fine)]:hover:text-[var(--foreground)]",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_8px_28px_rgba(251,146,60,0.12)]",
        focusRing,
        pressScale,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--surface-inset)] text-[var(--accent-text)] ring-1 ring-[var(--border-subtle)] transition-colors duration-200 group-hover:bg-[var(--accent)]/12 group-hover:text-[var(--accent-text)] group-hover:ring-[var(--accent)]/30">
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
          aria-hidden
        >
          <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {t("battle.back")}
    </Link>
  );
}
