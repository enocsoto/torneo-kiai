"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { HomeOopTour } from "@/components/oop/HomeOopTour";
import { WarriorUnlockReveal } from "@/components/battle/WarriorUnlockReveal";
import { ErrorBanner } from "@/components/home/ErrorBanner";
import { HomeHeader } from "@/components/home/HomeHeader";
import { RosterSection } from "@/components/home/RosterSection";
import { RosterSkeleton } from "@/components/home/RosterSkeleton";
import { SelectionCard } from "@/components/home/SelectionCard";
import { StartBattleBar } from "@/components/home/StartBattleBar";
import { useI18n } from "@/i18n/I18nContext";
import { useOopLearning } from "@/i18n/OopLearningContext";
import { api } from "@/lib/api";
import { getOrCreateGuestId } from "@/lib/guest";
import {
  clearHomeGuideActive,
  clearHomeReadyCueSeen,
  getHomeGuideActive,
  getHomeReadyCueSeen,
  getHomeTourSeen,
  markHomeGuideActive,
  markHomeReadyCueSeen,
  markHomeTourSeen,
  requestBattleTourContinuation,
} from "@/lib/oop-learning";
import { useHomeData } from "@/hooks/useHomeData";
import { useHomePicks } from "@/hooks/useHomePicks";

export default function Home() {
  const { t, locale } = useI18n();
  const { setEnabled: setOopEnabled } = useOopLearning();
  const [homeTourRun, setHomeTourRun] = useState(false);
  const [homePickTourRun, setHomePickTourRun] = useState(false);
  const [homeReadyTourRun, setHomeReadyTourRun] = useState(false);
  const [homeReadyPrompted, setHomeReadyPrompted] = useState(false);
  const [homeTourKey, setHomeTourKey] = useState(0);
  const [homeGuideActive, setHomeGuideActive] = useState(false);
  const [localTwoPlayer, setLocalTwoPlayer] = useState(false);
  const [starting, setStarting] = useState(false);
  const router = useRouter();

  const {
    warriors,
    allWarriors,
    rosterProgress,
    newlyUnlocked,
    loading,
    error,
    setError,
    reload,
    clearNewlyUnlocked,
  } = useHomeData();

  const { aId, bId, setAId, setBId, canStart, select, assignFromPortrait } =
    useHomePicks(warriors, loading);
  const selectedCount = Number(Boolean(aId)) + Number(Boolean(bId));

  useEffect(() => {
    if (
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem("torneo-kiai-local-2p") === "1"
    ) {
      setLocalTwoPlayer(true);
    }
    setHomeGuideActive(getHomeGuideActive());
  }, []);

  // Auto-run the home tour once.
  // Without autoStarted state: in React Strict Mode (dev) the second pass
  // reschedules the timer correctly. In production there is only one pass.
  useEffect(() => {
    if (loading || getHomeTourSeen()) return;
    const timer = window.setTimeout(() => setHomeTourRun(true), 900);
    return () => window.clearTimeout(timer);
  }, [loading]);

  const startHomeOopTour = useCallback(() => {
    setOopEnabled(true);
    markHomeGuideActive();
    setHomeGuideActive(true);
    clearHomeReadyCueSeen();
    setHomePickTourRun(false);
    setHomeReadyTourRun(false);
    setHomeReadyPrompted(false);
    setHomeTourKey((k) => k + 1);
    setHomeTourRun(true);
  }, [setOopEnabled]);

  useEffect(() => {
    if (!homeGuideActive || selectedCount < 2) return;
    if (getHomeReadyCueSeen()) return;
    if (homeReadyTourRun || homeReadyPrompted) return;
    setHomePickTourRun(false);
    setHomeTourRun(false);
    const timer = window.setTimeout(() => {
      setHomeTourKey((k) => k + 1);
      setHomeReadyPrompted(true);
      setHomeReadyTourRun(true);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [homeGuideActive, homeReadyPrompted, homeReadyTourRun, selectedCount]);

  const stopHomeGuide = useCallback(() => {
    clearHomeGuideActive();
    setHomeGuideActive(false);
    setHomeTourRun(false);
    setHomePickTourRun(false);
    setHomeReadyTourRun(false);
    setHomeReadyPrompted(false);
  }, []);

  async function startBattle() {
    if (!aId || !bId) return;
    setStarting(true);
    setError(null);
    try {
      if (typeof sessionStorage !== "undefined") {
        if (localTwoPlayer) sessionStorage.setItem("torneo-kiai-local-2p", "1");
        else sessionStorage.removeItem("torneo-kiai-local-2p");
      }
      const guest = getOrCreateGuestId();
      const battle = await api.createBattle(aId, bId, {
        guestId: guest || undefined,
        player1Progress: !localTwoPlayer,
      });
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("torneo-kiai-has-battles", "1");
      }
      if (homeGuideActive) {
        markHomeReadyCueSeen();
        requestBattleTourContinuation();
      }
      router.push(`/battle/${battle._id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("home.errorCreate"));
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="relative min-h-full overflow-x-clip text-[var(--foreground)]">
      <a
        href="#roster"
        className="fixed left-4 top-0 z-[100] -translate-y-full rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-[var(--on-accent)] opacity-0 shadow-lg transition-[transform,opacity] duration-200 focus:translate-y-4 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--ring-focus)] motion-reduce:transition-none"
      >
        {t("home.skipRoster")}
      </a>
      <div
        className="page-radial pointer-events-none absolute inset-0"
        aria-hidden
      />
      <main
        id="main-content"
        className={`relative mx-auto flex max-w-5xl flex-col gap-8 overflow-visible px-4 py-10 sm:px-6 sm:py-12 ${canStart ? "max-md:pb-28" : ""}`}
      >
        <HomeHeader
          localTwoPlayer={localTwoPlayer}
          onLocalTwoPlayerChange={setLocalTwoPlayer}
          onStartOopTour={startHomeOopTour}
        />

        {error ? (
          <ErrorBanner
            error={error}
            onDismiss={() => setError(null)}
            onRetry={reload}
          />
        ) : null}

        {loading ? (
          <RosterSkeleton />
        ) : (
          <>
            <section
              data-ooptour="home-slots"
              className="grid gap-4 sm:grid-cols-[1fr_minmax(5.5rem,auto)_1fr] sm:items-stretch sm:gap-3"
              aria-label={t("home.title")}
            >
              <SelectionCard
                label={t("home.player1")}
                accent="orange"
                selectedId={aId}
                warriors={warriors}
                onClear={() => setAId(null)}
              />
              <div
                className="vs-epic-wrap flex min-h-[3rem] items-center justify-center overflow-visible sm:min-h-0 sm:px-2"
                aria-hidden
              >
                <span className="vs-epic vs-epic-glow text-5xl sm:text-6xl lg:text-7xl">
                  {t("common.vs")}
                </span>
              </div>
              <SelectionCard
                label={t("home.player2")}
                accent="sky"
                selectedId={bId}
                warriors={warriors}
                onClear={() => setBId(null)}
              />
            </section>

            <StartBattleBar
              canStart={canStart}
              starting={starting}
              onStart={() => void startBattle()}
            />

            <RosterSection
              warriors={warriors}
              allWarriors={allWarriors}
              rosterProgress={rosterProgress}
              aId={aId}
              bId={bId}
              onAssign={assignFromPortrait}
              onSelect={select}
            />
          </>
        )}
      </main>
      <HomeOopTour
        key={`full-${homeTourKey}-${locale}`}
        run={homeTourRun}
        onClose={(status) => {
          setHomeTourRun(false);
          markHomeTourSeen();
          if (!homeGuideActive) return;
          if (status === "skipped") {
            stopHomeGuide();
            return;
          }
          if (selectedCount >= 2) {
            if (getHomeReadyCueSeen()) return;
            setHomeReadyPrompted(true);
            setHomeReadyTourRun(true);
            return;
          }
          setHomePickTourRun(true);
        }}
      />
      <HomeOopTour
        key={`pick-${homeTourKey}-${locale}`}
        variant="pick"
        run={homePickTourRun}
        onClose={(status) => {
          setHomePickTourRun(false);
          if (status === "skipped") stopHomeGuide();
        }}
      />
      <HomeOopTour
        key={`ready-${homeTourKey}-${locale}`}
        variant="ready"
        run={homeReadyTourRun}
        onClose={(status) => {
          setHomeReadyTourRun(false);
          markHomeReadyCueSeen();
          if (status === "skipped") stopHomeGuide();
        }}
      />
      {newlyUnlocked ? (
        <WarriorUnlockReveal
          warrior={newlyUnlocked}
          onClose={clearNewlyUnlocked}
        />
      ) : null}
    </div>
  );
}
