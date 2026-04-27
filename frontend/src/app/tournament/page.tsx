"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nContext";
import { api } from "@/lib/api";
import type { TorneoStandings } from "@/lib/types";
import { focusRing } from "@/lib/ui";

export default function TournamentPage() {
  const { t } = useI18n();
  const [data, setData] = useState<TorneoStandings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c = false;
    void (async () => {
      try {
        const d = await api.tournamentStandings(7);
        if (!c) setData(d);
      } catch (e) {
        if (!c)
          setError(e instanceof Error ? e.message : t("torneo.errorLoad"));
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [t]);

  return (
    <div className="relative min-h-full overflow-x-clip text-[var(--foreground)]">
      <div className="page-radial pointer-events-none absolute inset-0" aria-hidden />
      <main className="relative mx-auto max-w-lg space-y-8 px-4 py-10 sm:px-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("torneo.title")}
          </h1>
          <p className="text-pretty text-sm text-[var(--muted)]">
            {t("torneo.subtitle")}
          </p>
        </div>

        {loading ? (
          <p className="text-[var(--muted)]">{t("common.loading")}</p>
        ) : error ? (
          <p className="rounded-xl border border-[var(--status-error-border)] bg-[var(--status-error-bg)] px-4 py-3 text-sm text-[var(--status-error-fg-soft)]">
            {error}
          </p>
        ) : data ? (
          <>
            <p className="text-xs text-[var(--muted)]">
              {t("torneo.window", { days: data.ventanaDias })}
            </p>
            <p className="text-pretty text-xs text-[var(--muted)]">
              {data.leyenda}
            </p>
            <ol className="space-y-2">
              {data.top.map((row) => (
                <li
                  key={`${row.pos}-${row.guestId}`}
                  className="flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-glass)] px-4 py-3 backdrop-blur-md"
                >
                  <span className="flex items-center gap-3">
                    <span className="tabular-nums font-semibold text-[var(--muted)]">
                      {row.pos}.
                    </span>
                    <span className="font-mono text-sm text-[var(--foreground-secondary)]">
                      {row.displayId}
                    </span>
                  </span>
                  <span className="tabular-nums text-[var(--foreground-secondary)]">
                    {row.victorias} {t("torneo.wins")}
                  </span>
                </li>
              ))}
            </ol>
            {data.top.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">{t("torneo.empty")}</p>
            ) : null}
          </>
        ) : null}

        <Link
          href="/play/online"
          className={`inline-block text-sm text-[var(--accent-text)] underline-offset-4 ${focusRing}`}
        >
          {t("online.title")}
        </Link>
      </main>
    </div>
  );
}
