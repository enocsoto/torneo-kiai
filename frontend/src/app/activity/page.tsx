"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nContext";
import { api } from "@/lib/api";
import { getOrCreateGuestId } from "@/lib/guest";
import type { BattleSummary, Warrior } from "@/lib/types";
import { focusRing, pressScale } from "@/lib/ui";
import { playerNumberFromSide } from "@/lib/player-labels";
import { warriorDisplayName } from "@/lib/warrior-label";

type Tab = "partidas" | "ranking";

const PAGE_SIZE = 10;

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SkeletonList({ count, height = "h-20" }: { count: number; height?: string }) {
  return (
    <ul className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <div
            className={`skeleton-pulse ${height} rounded-2xl bg-[var(--surface-ghost)] ring-1 ring-[var(--border-subtle)]`}
            style={{ animationDelay: `${i * 40}ms` }}
          />
        </li>
      ))}
    </ul>
  );
}

function TabPartidas() {
  const { t, locale } = useI18n();
  const [rows, setRows] = useState<BattleSummary[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const hasFiredFlag = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const data = await api.recentBattles(PAGE_SIZE, page * PAGE_SIZE);
        if (!cancelled) {
          setRows(data);
          setHasMore(data.length === PAGE_SIZE);
          // Set flag for existing users who had battles before the flag existed
          if (!hasFiredFlag.current && data.length > 0 && typeof localStorage !== "undefined") {
            localStorage.setItem("torneo-kiai-has-battles", "1");
            hasFiredFlag.current = true;
          }
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : t("history.errorLoad"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [page, t]);

  if (loading) return <SkeletonList count={PAGE_SIZE} />;

  if (error) {
    return (
      <p className="rounded-xl border border-[var(--status-error-border)] bg-[var(--status-error-bg)] px-4 py-3 text-sm text-[var(--status-error-fg-soft)]">
        {error}
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-[var(--muted)]">{t("history.empty")}</p>
        <Link
          href="/"
          className={`mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-muted)] bg-[var(--chip-surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors duration-200 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[var(--chip-surface-hover)] ${focusRing}`}
        >
          {t("nav.selection")}
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-3">
        {rows.map((r, i) => (
          <li key={r.id} className="roster-card-enter" style={{ animationDelay: `${i * 35}ms` }}>
            <Link
              href={`/battle/${r.id}`}
              className={`block rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-glass)] p-4 shadow-lg backdrop-blur-md transition-[border-color,box-shadow] duration-200 [@media(hover:hover)_and_(pointer:fine)]:hover:border-[var(--accent)]/30 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_0_20px_rgba(251,146,60,0.07)] ${focusRing}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">
                  {r.jugador1 ?? "?"}{" "}
                  <span className="text-[var(--muted)]">{t("history.vs")}</span>{" "}
                  {r.jugador2 ?? "?"}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    r.status === "finished"
                      ? "battle-status-pill--finished"
                      : "battle-status-pill--active"
                  }`}
                >
                  {r.status === "finished"
                    ? t("history.statusFinished")
                    : t("history.statusActive")}
                </span>
              </div>
              {r.status === "finished" && r.winnerSide ? (
                <p className="mt-2 text-xs text-[var(--muted)]">
                  {t("history.winner", {
                    n: playerNumberFromSide(r.winnerSide),
                    name: (r.winnerSide === "A" ? r.jugador1 : r.jugador2) ?? "?",
                  })}
                </p>
              ) : null}
              {r.updatedAt ? (
                <p className="mt-1 text-xs tabular-nums text-[var(--muted)]">
                  {new Date(r.updatedAt).toLocaleString(locale === "en" ? "en" : "es")}
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>

      {(page > 0 || hasMore) && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className={`flex items-center gap-1.5 rounded-xl border border-[var(--border-muted)] bg-[var(--chip-surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[var(--chip-surface-hover)] ${pressScale} ${focusRing}`}
          >
            <ChevronLeft /> {t("history.paginationPrev")}
          </button>
          <span className="text-sm tabular-nums text-[var(--muted)]">
            {t("history.paginationPage", { page: page + 1 })}
          </span>
          <button
            type="button"
            disabled={!hasMore}
            onClick={() => setPage((p) => p + 1)}
            className={`flex items-center gap-1.5 rounded-xl border border-[var(--border-muted)] bg-[var(--chip-surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[var(--chip-surface-hover)] ${pressScale} ${focusRing}`}
          >
            {t("history.paginationNext")} <ChevronRight />
          </button>
        </div>
      )}
    </>
  );
}

function TabRanking() {
  const { t } = useI18n();
  const [rows, setRows] = useState<{ slug: string; wins: number }[]>([]);
  const [warriors, setWarriors] = useState<Warrior[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const guest = getOrCreateGuestId();
    if (!guest) {
      setLoading(false);
      setRows([]);
      setWarriors([]);
      setError(null);
      return () => {};
    }
    void (async () => {
      try {
        const [data, catalog] = await Promise.all([
          api.personalWarriorWins(guest, 20),
          api.warriors(),
        ]);
        if (!cancelled) {
          setRows(data);
          setWarriors(catalog);
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : t("rank.errorLoad"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [t]);

  if (loading) return <SkeletonList count={8} height="h-14" />;

  if (error) {
    return (
      <p className="rounded-xl border border-[var(--status-error-border)] bg-[var(--status-error-bg)] px-4 py-3 text-sm text-[var(--status-error-fg-soft)]">
        {error}
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-[var(--muted)]">{t("rank.emptyPersonal")}</p>
      </div>
    );
  }

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <>
      <p className="mb-4 text-sm text-[var(--muted)]">{t("rank.personalHint")}</p>
      <ol className="space-y-2">
      {rows.map((r, i) => (
        <li
          key={r.slug}
          className="roster-card-enter flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-glass)] px-4 py-3 backdrop-blur-md"
          style={{ animationDelay: `${i * 30}ms` }}
        >
          <span className="w-7 shrink-0 text-center text-base leading-none">
            {i < 3 ? medals[i] : (
              <span className="font-medium tabular-nums text-[var(--muted)]">{i + 1}</span>
            )}
          </span>
          <span className="flex-1 min-w-0 truncate font-medium">
            {warriorDisplayName(r.slug, warriors)}
          </span>
          <span className="shrink-0 tabular-nums text-sm text-[var(--foreground-secondary)]">
            {r.wins} {t("rank.wins")}
          </span>
        </li>
      ))}
    </ol>
    </>
  );
}

const TABS: { id: Tab; labelKey: string }[] = [
  { id: "partidas", labelKey: "history.title" },
  { id: "ranking", labelKey: "rank.title" },
];

export default function ActivityPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("partidas");

  return (
    <div className="relative min-h-full overflow-x-clip text-[var(--foreground)]">
      <div className="page-radial pointer-events-none absolute inset-0" aria-hidden />
      <main className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("nav.activity")}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {t("history.subtitle")}
          </p>
        </div>

        {/* Tab bar */}
        <div
          role="tablist"
          aria-label={t("nav.activity")}
          className="mb-6 flex gap-1 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] p-1"
        >
          {TABS.map(({ id, labelKey }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={[
                "flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                tab === id
                  ? "bg-[var(--surface-raised)] text-[var(--foreground)] shadow-sm"
                  : "text-[var(--muted)] [@media(hover:hover)_and_(pointer:fine)]:hover:text-[var(--foreground)]",
                focusRing,
              ].join(" ")}
            >
              {id === "partidas" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                  </svg>
                  {t(labelKey)}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5 7.5 9l3 3L15 7.5l4.5 4.5M3 19h18" />
                  </svg>
                  {t(labelKey)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div role="tabpanel">
          {tab === "partidas" ? <TabPartidas /> : <TabRanking />}
        </div>
      </main>
    </div>
  );
}
