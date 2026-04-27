"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nContext";
import {
  getSupportEmail,
  getTelegramHref,
  resolveContactLinks,
} from "@/lib/contact";
import { focusRing, pressScale } from "@/lib/ui";

/** Telegram mark (Simple Icons, monochrome via `currentColor`). */
function TelegramGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.559z" />
    </svg>
  );
}

function EmailGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 5h16v14H4V5Z" />
      <path d="M4 7l7.1 4.7a2 2 0 0 0 1.8 0L20 7" />
    </svg>
  );
}

function ChevronGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M7 14l6-4-6-4"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.9}
      />
    </svg>
  );
}

const backLinkClass =
  "group inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] " +
  "bg-[var(--chip-surface)] px-3.5 py-2 text-sm font-semibold text-[var(--foreground-secondary)] " +
  "shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-md transition-[color,background-color,border-color,box-shadow,transform] duration-200 " +
  "ring-1 ring-[var(--border-muted)]/60 " +
  "[@media(hover:hover)_and_(pointer:fine)]:hover:border-[var(--accent)]/35 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[var(--chip-surface-hover)] " +
  "[@media(hover:hover)_and_(pointer:fine)]:hover:text-[var(--foreground)] " +
  "dark:shadow-[0_4px_24px_rgba(0,0,0,0.25)] dark:ring-white/10 " +
  "dark:[@media(hover:hover)_and_(pointer:fine)]:hover:border-orange-400/40 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_8px_28px_rgba(251,146,60,0.12)]";

const iconRowClass =
  "mb-4 inline-flex h-16 min-w-[9.25rem] items-center justify-center gap-3 rounded-2xl px-4 " +
  "sm:min-w-[10rem] sm:gap-3.5 sm:px-5 " +
  "border border-[var(--border-subtle)] bg-[var(--surface-glass)] " +
  "shadow-[0_8px_32px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "ring-1 ring-[var(--border-muted)]/50 backdrop-blur-sm " +
  "dark:border-white/15 dark:bg-gradient-to-br dark:from-white/[0.08] dark:to-white/[0.02] " +
  "dark:shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] " +
  "dark:ring-white/15";

export default function SupportPage() {
  const { t } = useI18n();
  const [tg, setTg] = useState<string | null>(() => getTelegramHref());
  const mailtoHref = `mailto:${getSupportEmail()}`;

  useEffect(() => {
    let alive = true;
    void resolveContactLinks().then((r) => {
      if (!alive) return;
      setTg(r.telegram);
    });
    return () => {
      alive = false;
    };
  }, []);

  const hasTelegram = Boolean(tg);

  return (
    <div
      className="support-page relative flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)] transition-[background-color,color] duration-200 ease-out"
    >
      <div className="page-radial pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-orange-500/[0.05] blur-3xl dark:bg-orange-600/10" />
        <div className="absolute -right-32 top-1/2 h-80 w-80 rounded-full bg-amber-400/[0.04] blur-3xl dark:bg-amber-500/8" />
      </div>

      <header className="support-page-header relative z-10 flex items-center justify-between gap-3 py-5">
        <Link
          href="/"
          className={[backLinkClass, focusRing, pressScale].join(" ")}
        >
          <span
            className="flex size-7 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-ghost)] text-[var(--foreground-secondary)] transition-colors duration-200 group-hover:border-[var(--accent)]/30 group-hover:bg-[var(--accent)]/10 group-hover:text-[var(--accent-text)] dark:border-white/15 dark:bg-black/25 dark:text-white/90 dark:group-hover:border-orange-400/30 dark:group-hover:bg-orange-500/20 dark:group-hover:text-orange-100"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
              aria-hidden
            >
              <path
                d="M10 12L6 8l4-4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          {t("support.back")}
        </Link>
        <span className="shrink-0 text-right text-xs text-[var(--muted)]">
          {t("support.tag")}
        </span>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 pb-20 pt-6 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <div className={iconRowClass} aria-hidden>
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 shadow-[0_4px_14px_rgba(51,65,85,0.45)] ring-2 ring-white/25 dark:ring-white/20">
              <EmailGlyph className="size-[22px] text-white drop-shadow-sm" />
            </span>
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#2AABEE] shadow-[0_4px_14px_rgba(42,171,238,0.4)] ring-2 ring-white/25 dark:ring-white/20">
              <TelegramGlyph className="size-[22px] text-white drop-shadow-sm" />
            </span>
          </div>
          <h1 className="text-2xl font-semibold leading-snug tracking-tight text-[var(--foreground)] sm:text-3xl">
            {t("support.title")}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            {t("support.desc")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:items-stretch lg:gap-8">
          <div
            className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-glass)] shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-2xl lg:h-full lg:flex-row"
          >
            <div className="relative isolate aspect-[4/3] w-full min-h-[200px] shrink-0 sm:aspect-[16/10] sm:min-h-[220px] lg:aspect-auto lg:min-h-[20rem] lg:w-[min(100%,28rem)] lg:max-w-[55%] xl:max-w-[52%]">
              <Image
                src="/images/support-creator.png"
                alt={t("support.creatorPhotoAlt")}
                fill
                priority
                className="z-0 object-cover object-[center_22%]"
                sizes="(max-width: 1023px) 100vw, 28rem"
              />
              <div
                className="pointer-events-none absolute -left-1/2 top-0 z-[1] h-64 w-64 rounded-full bg-amber-400/15 blur-3xl dark:bg-amber-500/25"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-8 -right-8 z-[1] h-48 w-48 rounded-full bg-orange-500/10 blur-3xl dark:bg-orange-500/20"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-[var(--background)] via-[var(--background)]/25 to-transparent sm:bg-gradient-to-r sm:from-[var(--background)]/55 sm:via-[var(--background)]/12 sm:to-transparent"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 z-[2] ring-1 ring-inset ring-[var(--border-subtle)] sm:bg-gradient-to-r sm:from-transparent sm:via-white/[0.04] sm:to-white/[0.02] dark:sm:via-white/[0.04] dark:sm:to-white/[0.02]"
                aria-hidden
              />
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col p-6 sm:p-8">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)]">
                {t("support.contactChannels")}
              </p>

              <div className="flex flex-1 flex-col gap-3">
                <a
                  href={mailtoHref}
                  className={[
                    "group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-slate-400/40 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(51,65,85,0.28),inset_0_1px_0_rgba(255,255,255,0.12)]",
                    "bg-gradient-to-br from-slate-500 via-slate-600 to-slate-800 transition-all duration-200",
                    "hover:-translate-y-0.5 hover:border-slate-300/50 hover:shadow-[0_16px_48px_rgba(51,65,85,0.38)]",
                    "dark:border-white/20",
                    pressScale,
                    focusRing,
                  ].join(" ")}
                >
                  <span
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden
                  />
                  <span className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-black/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-white/25">
                    <EmailGlyph className="size-7 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]" />
                  </span>
                  <span className="relative flex-1 text-left tracking-tight">
                    {t("support.contactEmail")}
                  </span>
                  <ChevronGlyph className="relative size-5 shrink-0 text-white/90" />
                </a>
                {tg ? (
                  <a
                    href={tg}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={[
                      "group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-[#2AABEE]/45 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(42,171,238,0.2),inset_0_1px_0_rgba(255,255,255,0.12)]",
                      "bg-gradient-to-br from-[#229ED9]/90 via-[#2AABEE]/80 to-[#0088cc]/85 backdrop-blur-sm transition-all duration-200",
                      "hover:-translate-y-0.5 hover:border-[#2AABEE]/65 hover:shadow-[0_16px_48px_rgba(42,171,238,0.35)]",
                      pressScale,
                      focusRing,
                    ].join(" ")}
                  >
                    <span
                      className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      aria-hidden
                    />
                    <span className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-black/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] ring-1 ring-white/30">
                      <TelegramGlyph className="size-7 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]" />
                    </span>
                    <span className="relative flex-1 text-left tracking-tight">
                      {t("support.contactTelegram")}
                    </span>
                    <ChevronGlyph className="relative size-5 shrink-0 text-white/90" />
                  </a>
                ) : null}
                {!hasTelegram ? (
                  <p className="rounded-xl border border-[var(--status-warn-border)] bg-[var(--status-warn-bg)] px-4 py-3 text-sm leading-relaxed text-[var(--status-warn-fg)]">
                    {t("support.contactConfigHint")}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div
            className="flex min-h-0 min-w-0 flex-col rounded-2xl border-[1.5px] border-solid border-slate-300 bg-white p-4 shadow-sm dark:border-white/12 dark:bg-white/5 dark:shadow-none sm:p-5 lg:h-full"
          >
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)]">
              {t("support.included")}
            </p>
            <ul className="space-y-2 sm:space-y-2.5">
              {(
                [
                  "support.feat1",
                  "support.feat2",
                  "support.feat3",
                  "support.feat4",
                  "support.feat5",
                  "support.feat6",
                ] as const
              ).map((k) => (
                <li
                  key={k}
                  className="flex items-start gap-2.5 text-[13px] leading-snug text-[var(--foreground-secondary)] sm:text-sm"
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                    aria-hidden
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      opacity="0.3"
                    />
                    <path
                      d="M5 8l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {t(k)}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-center text-[10px] leading-relaxed text-[var(--muted)]/90">
          {t("support.fanDisclaimer")}
        </p>
      </main>
    </div>
  );
}
