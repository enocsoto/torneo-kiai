"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nContext";
import { api } from "@/lib/api";
import type { BattleSummary } from "@/lib/types";
import { focusRing, pressScale } from "@/lib/ui";
import { playerNumberFromSide } from "@/lib/player-labels";

const PAGE_SIZE = 10;

function ChevronLeft() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M10 12L6 8l4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HistoryPage() {
  const { t, locale } = useI18n();
  const [rows, setRows] = useState<BattleSummary[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : t("history.errorLoad"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, t]);

  function prev() {
    setPage((p) => Math.max(0, p - 1));
  }

  function next() {
    if (hasMore) setPage((p) => p + 1);
  }

  return (
    <div className="relative min-h-full overflow-hidden text-[var(--foreground)]">
      <div className="page-radial pointer-events-none absolute inset-0" aria-hidden />
      <main className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("history.title")}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {t("history.subtitle")}
            </p>
          </div>
          <Link
            href="/"
            className={`rounded-xl border border-[var(--border-muted)] bg-[var(--chip-surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors duration-200 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[var(--chip-surface-hover)] ${focusRing}`}
          >
            {t("history.back")}
          </Link>
        </div>

        {/* Error */}
        {error && (
          <p className="mb-4 rounded-xl border border-[var(--status-error-border)] bg-[var(--status-error-bg)] px-4 py-3 text-sm text-[var(--status-error-fg-soft)]">
            {error}
          </p>
        )}

        {/* Loading shimmer */}
        {loading ? (
          <ul className="space-y-3">
            {Array.from({ length: PAGE_SIZE }, (_, i) => (
              <li key={i}>
                <div
                  className="skeleton-pulse h-20 rounded-2xl bg-[var(--surface-ghost)] ring-1 ring-[var(--border-subtle)]"
                  style={{ animationDelay: `${i * 40}ms` }}
                />
              </li>
            ))}
          </ul>
        ) : rows.length === 0 ? (
          <p className="text-[var(--muted)]">{t("history.empty")}</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((r, i) => (
              <li
                key={r.id}
                className="roster-card-enter"
                style={{ animationDelay: `${i * 35}ms` }}
              >
                <Link
                  href={`/battle/${r.id}`}
                  className={`block rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-glass)] p-4 shadow-lg backdrop-blur-md transition-[border-color,box-shadow] duration-200 [@media(hover:hover)_and_(pointer:fine)]:hover:border-[var(--accent)]/30 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_0_20px_rgba(251,146,60,0.07)] ${focusRing}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">
                      {r.jugador1 ?? "?"}{" "}
                      <span className="text-[var(--muted)]">
                        {t("history.vs")}
                      </span>{" "}
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
                        name:
                          (r.winnerSide === "A"
                            ? r.jugador1
                            : r.jugador2) ?? "?",
                      })}
                    </p>
                  ) : null}
                  {r.updatedAt ? (
                    <p className="mt-1 text-xs tabular-nums text-[var(--muted)]">
                      {new Date(r.updatedAt).toLocaleString(
                        locale === "en" ? "en" : "es",
                      )}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination controls */}
        {!loading && (page > 0 || hasMore) && (
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={page === 0}
              onClick={prev}
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
              onClick={next}
              className={`flex items-center gap-1.5 rounded-xl border border-[var(--border-muted)] bg-[var(--chip-surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[var(--chip-surface-hover)] ${pressScale} ${focusRing}`}
            >
              {t("history.paginationNext")} <ChevronRight />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
