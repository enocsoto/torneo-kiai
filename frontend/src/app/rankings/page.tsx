"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nContext";
import { api } from "@/lib/api";
import type { Warrior } from "@/lib/types";
import { focusRing } from "@/lib/ui";
import { warriorDisplayName } from "@/lib/warrior-label";

export default function RankingsPage() {
  const { t } = useI18n();
  const [rows, setRows] = useState<{ slug: string; wins: number }[]>([]);
  const [warriors, setWarriors] = useState<Warrior[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const [data, catalog] = await Promise.all([
          api.warriorRankings(20),
          api.warriors(),
        ]);
        if (!c) {
          setRows(data);
          setWarriors(catalog);
        }
      } catch (e) {
        if (!c)
          setError(
            e instanceof Error ? e.message : t("rank.errorLoad"),
          );
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [t]);

  return (
    <div className="relative min-h-full overflow-hidden text-[var(--foreground)]">
      <div
        className="page-radial pointer-events-none absolute inset-0"
        aria-hidden
      />
      <main className="relative mx-auto max-w-lg px-4 py-12 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("rank.title")}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {t("rank.subtitle")}
            </p>
          </div>
          <Link
            href="/"
            className={`rounded-xl border border-[var(--border-muted)] bg-[var(--chip-surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors duration-200 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[var(--chip-surface-hover)] ${focusRing}`}
          >
            {t("nav.selection")}
          </Link>
        </div>

        {error ? (
          <p className="rounded-xl border border-[var(--status-error-border)] bg-[var(--status-error-bg)] px-4 py-3 text-sm text-[var(--status-error-fg-soft)]">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="text-[var(--muted)]">{t("common.loading")}</p>
        ) : rows.length === 0 ? (
          <p className="text-[var(--muted)]">{t("rank.empty")}</p>
        ) : (
          <ol className="space-y-2">
            {rows.map((r, i) => (
              <li
                key={r.slug}
                className="flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-glass)] px-4 py-3 backdrop-blur-md"
              >
                <span className="font-medium tabular-nums text-[var(--muted)]">
                  {i + 1}.
                </span>
                <span className="flex-1 px-3 font-medium">
                  {warriorDisplayName(r.slug, warriors)}
                </span>
                <span className="tabular-nums text-[var(--foreground-secondary)]">
                  {r.wins} {t("rank.wins")}
                </span>
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
  );
}
