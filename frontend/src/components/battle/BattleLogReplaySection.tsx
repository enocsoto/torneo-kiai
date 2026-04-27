"use client";

import {
  useEffect,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useI18n } from "@/i18n/I18nContext";
import type { Battle } from "@/lib/types";
import { chipBtn, focusRing, pressScale } from "@/lib/ui";

type Props = {
  battle: Battle;
  /** `true` only when the battle is `finished`. */
  replayEnabled: boolean;
  /**
   * On the victory screen: place the replay button next to this CTA
   * (e.g. “New battle” link) on the same row.
   */
  endScreenCta?: ReactNode;
  battleLogOpen: boolean;
  setBattleLogOpen: Dispatch<SetStateAction<boolean>>;
  replayPlaying: boolean;
  setReplayPlaying: Dispatch<SetStateAction<boolean>>;
  replayHighlight: number | null;
  setReplayHighlight: Dispatch<SetStateAction<number | null>>;
};

export function BattleLogReplaySection({
  battle,
  replayEnabled,
  endScreenCta,
  battleLogOpen,
  setBattleLogOpen,
  replayPlaying,
  setReplayPlaying,
  replayHighlight,
  setReplayHighlight,
}: Props) {
  const { t } = useI18n();

  useEffect(() => {
    if (!replayEnabled) {
      setBattleLogOpen(false);
      setReplayPlaying(false);
      setReplayHighlight(null);
    }
  }, [
    replayEnabled,
    setBattleLogOpen,
    setReplayPlaying,
    setReplayHighlight,
  ]);

  if (battle.log.length === 0) return null;

  const openReplay = () => {
    if (!replayEnabled) return;
    setBattleLogOpen(true);
    setReplayHighlight(0);
    setReplayPlaying(true);
  };

  const replayButtonClass = `w-full min-h-[2.75rem] rounded-xl px-5 py-3 text-sm font-semibold shadow-md shadow-[var(--shadow-card)] sm:w-auto sm:min-w-[8.5rem] ${chipBtn} ${replayEnabled ? pressScale : ""} ${focusRing}`;

  if (!battleLogOpen) {
    if (endScreenCta) {
      return (
        <div className="mt-6 w-full max-w-2xl space-y-2 sm:mx-auto">
          <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            {endScreenCta}
            <button
              type="button"
              data-testid="battle-open-log"
              data-replay-locked={replayEnabled ? undefined : "true"}
              title={
                replayEnabled
                  ? undefined
                  : t("battle.replayWhenFinished")
              }
              disabled={!replayEnabled}
              className={replayButtonClass}
              onClick={openReplay}
            >
              {t("battle.openReplay")}
            </button>
          </div>
          <p
            className={`text-center text-[11px] ${
              replayEnabled ? "text-[var(--muted)]" : "text-[var(--muted)] opacity-80"
            }`}
          >
            {replayEnabled
              ? t("battle.replayHint")
              : t("battle.replayWhenFinished")}
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          data-testid="battle-open-log"
          data-replay-locked={replayEnabled ? undefined : "true"}
          title={
            replayEnabled
              ? undefined
              : t("battle.replayWhenFinished")
          }
          disabled={!replayEnabled}
          className={replayButtonClass}
          onClick={openReplay}
        >
          {t("battle.openReplay")}
        </button>
        <p
          className={`max-w-md text-center text-[11px] ${
            replayEnabled ? "text-[var(--muted)]" : "text-[var(--muted)] opacity-80"
          }`}
        >
          {replayEnabled
            ? t("battle.replayHint")
            : t("battle.replayWhenFinished")}
        </p>
      </div>
    );
  }

  const replayStepPct =
    replayHighlight !== null && battle.log.length > 0
      ? ((replayHighlight + 1) / battle.log.length) * 100
      : 0;

  return (
    <section
      data-testid="battle-log-panel"
      data-replay-mode={replayPlaying ? "playing" : "paused"}
      className={`min-w-0 max-w-full overflow-hidden rounded-2xl border border-[var(--status-warn-border)] bg-[var(--log-replay-surface)] p-4 shadow-[var(--shadow-card)] ring-1 ring-[var(--status-warn-border)] backdrop-blur-sm ${
        endScreenCta ? "mt-4 w-full" : ""
      }`}
      aria-label={t("battle.replayModeTitle")}
    >
      <div
        role="status"
        data-testid="battle-replay-mode-banner"
        aria-live="polite"
        className="battle-replay-ribbon-epic mb-4"
      >
        <div className="epic-success-toast-shimmer" aria-hidden />
        <div className="battle-replay-ribbon-epic-head">
          <div
            className={`battle-replay-ribbon-epic-icon ${
              replayPlaying ? "battle-replay-ribbon-epic-icon--live" : ""
            }`}
            aria-hidden
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-[1.15rem] motion-reduce:transition-none"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M4.755 10.003a.75.75 0 0 1 .845.143A6.99 6.99 0 0 0 12 16a6.99 6.99 0 0 0 4.285-1.48.75.75 0 0 1 1.03 1.09A8.5 8.5 0 0 1 3.5 10a8.5 8.5 0 0 1 1.255-4.5H5a.75.75 0 0 1 0-1.5h2.5a.75.75 0 0 1 .75.75V7a.75.75 0 0 1-1.5 0V5.06A6.99 6.99 0 0 0 4.02 8.3a.75.75 0 0 1-.265 1.703Zm14.49 3.995a.75.75 0 0 1-.84-.144A6.99 6.99 0 0 0 12 8a6.99 6.99 0 0 0-4.286 1.48.75.75 0 0 1-1.03-1.09A8.5 8.5 0 0 1 20.5 14a8.5 8.5 0 0 1-1.256 4.5H20a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75V17a.75.75 0 0 1 1.5 0v1.94a6.99 6.99 0 0 0 1.23-2.24.75.75 0 0 1 .77-.697Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="battle-replay-ribbon-epic-title">
                {t("battle.replayModeTitle")}
              </span>
              {replayPlaying ? (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--log-replay-emerald)] shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                  <span className="inline-block size-1.5 rounded-full bg-[var(--log-replay-emerald)] motion-safe:animate-pulse" />
                  {t("battle.replayBadgePlaying")}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-md border border-[var(--status-warn-border)] bg-[color-mix(in_srgb,var(--log-replay-ribbon)_55%,transparent)] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)]">
                  {t("battle.replayPause")}
                </span>
              )}
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--log-replay-ink)] opacity-[0.92]">
              {replayPlaying
                ? t("battle.replayModePlaying")
                : t("battle.replayModePaused")}
            </p>
            {replayHighlight !== null ? (
              <p
                className="mt-2 font-mono text-xs font-semibold tabular-nums tracking-wide text-[var(--log-replay-amber-bright)] drop-shadow-[0_0_8px_rgba(251,191,36,0.25)]"
                aria-live="polite"
              >
                {t("battle.replayProgress", {
                  cur: replayHighlight + 1,
                  total: battle.log.length,
                })}
              </p>
            ) : null}
          </div>
        </div>
        {replayHighlight !== null && battle.log.length > 0 ? (
          <div
            className="battle-replay-ribbon-epic-track"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={battle.log.length}
            aria-valuenow={replayHighlight + 1}
            aria-label={t("battle.replayProgress", {
              cur: replayHighlight + 1,
              total: battle.log.length,
            })}
          >
            <div
              className={
                replayPlaying
                  ? "battle-replay-ribbon-epic-fill"
                  : "battle-replay-ribbon-epic-fill battle-replay-ribbon-epic-fill--paused"
              }
              style={{ width: `${replayStepPct}%` }}
            />
          </div>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h2 className="text-xs font-semibold text-[var(--muted)] sm:text-sm">
          {t("battle.replayPanelTitle")}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${chipBtn} ${pressScale} ${focusRing}`}
            onClick={() => {
              setReplayHighlight(0);
              setReplayPlaying(true);
            }}
          >
            <span aria-hidden className="shrink-0 text-[0.65rem] opacity-60">⟲</span>
            {t("battle.replay")}
          </button>
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${chipBtn} ${pressScale} ${focusRing}`}
            onClick={() => setReplayPlaying(false)}
          >
            <span aria-hidden className="shrink-0 text-[0.65rem] opacity-60">‖</span>
            {t("battle.replayPause")}
          </button>
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${chipBtn} ${pressScale} ${focusRing}`}
            onClick={() => {
              setReplayPlaying(false);
              setReplayHighlight(Math.max(0, battle.log.length - 1));
            }}
          >
            <span aria-hidden className="shrink-0 text-[0.65rem] opacity-60">↦</span>
            {t("battle.replayJumpEnd")}
          </button>

          <span className="hidden h-4 w-px bg-[var(--border-subtle)] sm:block" aria-hidden />

          <button
            type="button"
            className={`inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:border-rose-400/60 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-rose-500/20 ${pressScale} ${focusRing}`}
            onClick={() => {
              setBattleLogOpen(false);
              setReplayPlaying(false);
              setReplayHighlight(null);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="size-3 shrink-0 opacity-80"
              aria-hidden
            >
              <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
            </svg>
            {t("battle.closeReplay")}
          </button>
        </div>
      </div>
    </section>
  );
}
