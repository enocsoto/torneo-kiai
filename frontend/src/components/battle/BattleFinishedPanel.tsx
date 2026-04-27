"use client";

import Link from "next/link";
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { BattleLogReplaySection } from "@/components/battle/BattleLogReplaySection";
import { useI18n } from "@/i18n/I18nContext";
import { focusRing, pressScale } from "@/lib/ui";
import type { Battle } from "@/lib/types";

interface BattleFinishedPanelProps {
  battle: Battle;
  winnerNombre: string;
  battleLogOpen: boolean;
  setBattleLogOpen: Dispatch<SetStateAction<boolean>>;
  replayPlaying: boolean;
  setReplayPlaying: Dispatch<SetStateAction<boolean>>;
  replayHighlight: number | null;
  setReplayHighlight: Dispatch<SetStateAction<number | null>>;
}

export function BattleFinishedPanel({
  battle,
  winnerNombre,
  battleLogOpen,
  setBattleLogOpen,
  replayPlaying,
  setReplayPlaying,
  replayHighlight,
  setReplayHighlight,
}: BattleFinishedPanelProps) {
  const { t } = useI18n();

  const newBattleLink: ReactNode = (
    <Link
      href="/"
      className={`inline-flex w-full min-h-[2.75rem] items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 text-sm font-semibold text-[var(--on-accent)] shadow-lg shadow-orange-500/25 sm:w-auto sm:min-w-[10.5rem] ${pressScale} ${focusRing}`}
    >
      {t("battle.new")}
    </Link>
  );

  return (
    <section
      data-testid="battle-finished"
      className="win-panel mx-auto flex w-full max-w-3xl flex-col items-center rounded-2xl border p-5 text-center backdrop-blur-md sm:p-6 md:max-w-4xl md:p-8"
      aria-live="polite"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-text)]">
        {t("battle.fin")}
      </p>
      <p className="mt-3 text-xl font-semibold tracking-tight text-[var(--foreground)]">
        {winnerNombre} vence
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {t("battle.finishedHint")}
      </p>
      {battle.log.length > 0 ? (
        <BattleLogReplaySection
          battle={battle}
          replayEnabled={battle.status === "finished"}
          endScreenCta={newBattleLink}
          battleLogOpen={battleLogOpen}
          setBattleLogOpen={setBattleLogOpen}
          replayPlaying={replayPlaying}
          setReplayPlaying={setReplayPlaying}
          replayHighlight={replayHighlight}
          setReplayHighlight={setReplayHighlight}
        />
      ) : (
        <Link
          href="/"
          className={`mt-6 inline-flex min-h-[2.75rem] w-full max-w-sm items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 text-sm font-semibold text-[var(--on-accent)] shadow-lg shadow-orange-500/25 sm:w-auto ${pressScale} ${focusRing}`}
        >
          {t("battle.new")}
        </Link>
      )}
    </section>
  );
}
