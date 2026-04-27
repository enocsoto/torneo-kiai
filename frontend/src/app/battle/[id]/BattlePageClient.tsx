"use client";

import dynamic from "next/dynamic";
import { BattleActionsSection } from "@/components/battle/BattleActionsSection";
import { BattleCinematicIntro } from "@/components/battle/BattleCinematicIntro";
import { BattleFinishedPanel } from "@/components/battle/BattleFinishedPanel";
import { BattleFighterPanel } from "@/components/battle/BattleFighterPanel";
import { BattleLogReplaySection } from "@/components/battle/BattleLogReplaySection";
import { BattleStatusBanners } from "@/components/battle/BattleStatusBanners";
import { BattleStrikeCallout } from "@/components/battle/BattleStrikeCallout";
import {
  BattleUnlockReveal,
} from "@/components/battle/BattleUnlockReveal";
import { BattleOopTour } from "@/components/oop/BattleOopTour";
import { useBattle } from "@/hooks/useBattle";
import { getOrCreateGuestId } from "@/lib/guest";
import {
  playerNumberFromSide,
  sidePanelSubtitle,
  sidePanelTitle,
} from "@/lib/player-labels";
import { turnSideAtLogIndex } from "@/lib/battle-replay-simulate";
import { BackToTournamentLink } from "@/components/BackToTournamentLink";
import { chipBtn, focusRing } from "@/lib/ui";

const BattleArenaBackdrop = dynamic(
  () =>
    import("@/components/battle/BattleArenaBackdrop").then(
      (m) => m.BattleArenaBackdrop,
    ),
  { ssr: false, loading: () => null },
);

type BattlePageClientProps = { idParam: string | string[] | undefined };

export default function BattlePageClient({ idParam }: BattlePageClientProps) {
  const {
    id,
    battle,
    error,
    pending,
    throttleCooldown,
    attackUnlock,
    setAttackUnlock,
    fxA,
    fxB,
    couchMode,
    replayPlaying,
    setReplayPlaying,
    replayHighlight,
    setReplayHighlight,
    battleLogOpen,
    setBattleLogOpen,
    arenaShift,
    cinematicPhase,
    lungeKeyA,
    lungeKeyB,
    strikeCallout,
    act,
    combatActive,
    mySide,
    inputLocked,
    onlineMode,
    replaySimSnap,
    onArenaMouseMove,
    battleTourRun,
    setBattleTourRun,
    t,
    oopEnabled,
  } = useBattle(idParam);

  if (error && !battle) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-6 bg-[var(--background)] px-4 text-[var(--foreground)]">
        <p className="max-w-md text-center text-pretty text-[var(--status-danger-bright)]">
          {error}
        </p>
        <BackToTournamentLink />
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-[var(--background)] text-[var(--muted)]">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)]/30 border-t-[var(--accent)] motion-reduce:animate-none motion-reduce:border-t-transparent"
          aria-hidden
        />
        <p className="text-sm">{t("battle.loading")}</p>
      </div>
    );
  }

  const inReplayView =
    battleLogOpen &&
    replayHighlight !== null &&
    battle.status === "finished";
  const warriorA = replaySimSnap?.warriorA ?? battle.warriorA;
  const warriorB = replaySimSnap?.warriorB ?? battle.warriorB;
  const { winnerSide } = battle;
  const replayTurn = inReplayView
    ? turnSideAtLogIndex(battle.log, replayHighlight!)
    : null;
  const turnLabelSide: "A" | "B" = inReplayView
    ? (replayTurn ?? "A")
    : battle.activeSide;
  const showTurn = combatActive || inReplayView;
  const actionSide = battle.activeSide;
  const actionWarrior =
    actionSide === "A" ? battle.warriorA : battle.warriorB;

  const winnerNombre =
    winnerSide === "A"
      ? battle.warriorA.nombre
      : winnerSide === "B"
        ? battle.warriorB.nombre
        : battle.warriorA.salud > battle.warriorB.salud
          ? battle.warriorA.nombre
          : battle.warriorB.salud > battle.warriorA.salud
            ? battle.warriorB.nombre
            : t("battle.noWinnerData");

  return (
    <div
      className="battle-field-root relative min-h-full overflow-x-clip text-[var(--foreground)]"
      onMouseMove={onArenaMouseMove}
    >
      {id ? (
        <BattleArenaBackdrop battleId={id} arenaShift={arenaShift} />
      ) : null}
      {cinematicPhase !== "off" ? (
        <BattleCinematicIntro
          phase={cinematicPhase}
          couchMode={couchMode}
          warriorA={warriorA}
          warriorB={warriorB}
        />
      ) : null}
      <div
        className="page-radial pointer-events-none absolute inset-0 z-[1] opacity-90"
        aria-hidden
      />
      <main
        id="main-content"
        className="battle-page-main relative z-10 mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-5 sm:gap-8"
      >
        <header className="battle-page-header flex w-full min-w-0 flex-col gap-2.5 sm:gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
          <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:gap-3 md:w-auto">
            <BackToTournamentLink className="w-fit min-w-0 max-w-full shrink-0" />
            {oopEnabled && combatActive ? (
              <button
                type="button"
                onClick={() => setBattleTourRun(true)}
                className={`shrink-0 ${chipBtn} ${focusRing} px-2.5 py-1.5 text-xs font-semibold`}
              >
                {t("oop.battleStartTour")}
              </button>
            ) : null}
          </div>
          <div
            data-ooptour="battle-turn"
            className="min-w-0 w-full max-w-full text-xs leading-snug text-[var(--muted)] max-md:tracking-wide md:max-w-md md:flex-1 md:pl-2 md:text-right md:leading-relaxed md:tracking-widest"
            role="status"
          >
            <p className="uppercase">
              {showTurn ? (
                <>
                  {t("battle.turn")}{" "}
                  {couchMode
                    ? sidePanelTitle(turnLabelSide, couchMode, t)
                    : t("battle.turnPlayer", {
                        n: playerNumberFromSide(turnLabelSide),
                      })}
                  {inReplayView ? (
                    <span className="ml-1.5 text-[10px] font-semibold text-[var(--status-warn-amber)]">
                      · {t("battle.replayBadgePlaying")}
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="text-[var(--accent-text)]">
                  {t("battle.ended")}
                </span>
              )}
            </p>
            {!combatActive && !inReplayView ? (
              <p className="mt-1.5 break-words text-[13px] font-semibold normal-case leading-snug text-[var(--foreground-secondary)] sm:text-xs">
                {t("battle.winner")} {winnerNombre}
              </p>
            ) : null}
          </div>
        </header>

        <BattleStatusBanners
          onlineMode={onlineMode}
          mySide={mySide}
          hasGuestId={Boolean(getOrCreateGuestId())}
          inputLocked={inputLocked}
          combatActive={combatActive}
          error={error}
          throttleCooldown={throttleCooldown}
        />

        <section
          data-ooptour="battle-fighters"
          className="mx-auto grid w-full min-w-0 max-w-3xl grid-cols-2 justify-items-stretch gap-2 sm:gap-4 md:max-w-4xl md:gap-6 lg:max-w-none md:items-stretch"
          aria-label={t("battle.arenaDuelLabel")}
        >
          <BattleFighterPanel
            title={sidePanelTitle("A", couchMode, t)}
            subtitle={sidePanelSubtitle("A", couchMode, t)}
            tone="orange"
            w={warriorA}
            isActive={
              inReplayView
                ? replayTurn === "A"
                : combatActive && battle.activeSide === "A"
            }
            fx={fxA}
            side="A"
            lungeKey={lungeKeyA}
            portraitPriority
          />
          <BattleFighterPanel
            title={sidePanelTitle("B", couchMode, t)}
            subtitle={sidePanelSubtitle("B", couchMode, t)}
            tone="sky"
            w={warriorB}
            isActive={
              inReplayView
                ? replayTurn === "B"
                : combatActive && battle.activeSide === "B"
            }
            fx={fxB}
            side="B"
            lungeKey={lungeKeyB}
            portraitPriority
          />
        </section>

        {combatActive ? (
          <div className="mx-auto w-full max-w-3xl md:max-w-4xl lg:max-w-none">
            <BattleActionsSection
              combatActive={combatActive}
              pending={pending || throttleCooldown > 0}
              couchMode={couchMode}
              activeSide={actionSide}
              active={actionWarrior}
              act={act}
              inputLocked={inputLocked}
            />
          </div>
        ) : (
          <BattleFinishedPanel
            battle={battle}
            winnerNombre={winnerNombre}
            battleLogOpen={battleLogOpen}
            setBattleLogOpen={setBattleLogOpen}
            replayPlaying={replayPlaying}
            setReplayPlaying={setReplayPlaying}
            replayHighlight={replayHighlight}
            setReplayHighlight={setReplayHighlight}
          />
        )}

        {combatActive ? (
          <BattleLogReplaySection
            battle={battle}
            replayEnabled={battle.status === "finished"}
            battleLogOpen={battleLogOpen}
            setBattleLogOpen={setBattleLogOpen}
            replayPlaying={replayPlaying}
            setReplayPlaying={setReplayPlaying}
            replayHighlight={replayHighlight}
            setReplayHighlight={setReplayHighlight}
          />
        ) : null}
      </main>

      <BattleStrikeCallout strikeCallout={strikeCallout} />

      <BattleOopTour
        run={battleTourRun}
        onClose={() => setBattleTourRun(false)}
      />

      {attackUnlock ? (
        <BattleUnlockReveal
          {...attackUnlock}
          onClose={() => setAttackUnlock(null)}
        />
      ) : null}
    </div>
  );
}
