"use client";

import { useI18n } from "@/i18n/I18nContext";
import { sidePanelTitle } from "@/lib/player-labels";
import type { WarriorSnapshot } from "@/lib/types";
import { WarriorPortrait } from "@/components/WarriorPortrait";

export type CinematicPhase = "off" | "in" | "out";

type Props = {
  phase: CinematicPhase;
  couchMode: boolean;
  warriorA: WarriorSnapshot;
  warriorB: WarriorSnapshot;
  /** Portraits in intro / below the fold: loading priority (LCP). */
  portraitPriority?: boolean;
};

export function BattleCinematicIntro({
  phase,
  couchMode,
  warriorA,
  warriorB,
  portraitPriority = true,
}: Props) {
  const { t } = useI18n();
  if (phase === "off") return null;

  const backdropClass =
    phase === "in"
      ? "battle-cinematic__backdrop--in"
      : "battle-cinematic__backdrop--out";

  return (
    <div
      className="battle-cinematic pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      aria-hidden
    >
      <div
        className={`absolute inset-0 bg-[#050912]/88 backdrop-blur-sm ${backdropClass}`}
      />
      <div className="relative z-[1] flex w-full max-w-2xl flex-col items-center gap-6 px-2">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.32em] text-zinc-400">
          {t("battle.cinematicTag")}
        </p>
        <div className="flex w-full flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center sm:gap-2 md:gap-4">
          <div className="battle-cinematic-fighter--l flex min-w-0 flex-1 flex-col items-center gap-2 sm:items-end sm:pr-2">
            <p className="w-full text-center text-[10px] font-semibold uppercase tracking-widest text-orange-200/90 sm:text-right">
              {sidePanelTitle("A", couchMode, t)}
            </p>
            <div className="flex flex-col items-center sm:items-end">
              <WarriorPortrait
                slug={warriorA.slug}
                imageUrl={warriorA.imageUrl}
                nombre={warriorA.nombre}
                className="h-40 w-32 sm:h-44 sm:w-36"
                priority={portraitPriority}
              />
              <p className="mt-2 w-full text-center text-sm font-bold text-zinc-100 sm:max-w-[12rem] sm:text-right sm:text-base">
                {warriorA.nombre}
              </p>
            </div>
          </div>
          <div className="vs-epic-wrap flex shrink-0 flex-col items-center justify-center py-2 sm:py-0">
            <span
              className="vs-epic vs-epic-glow text-4xl sm:text-5xl"
              style={{ lineHeight: 1.05 }}
            >
              VS
            </span>
          </div>
          <div className="battle-cinematic-fighter--r flex min-w-0 flex-1 flex-col items-center gap-2 sm:items-start sm:pl-2">
            <p className="w-full text-center text-[10px] font-semibold uppercase tracking-widest text-sky-200/90 sm:text-left">
              {sidePanelTitle("B", couchMode, t)}
            </p>
            <div className="flex flex-col items-center sm:items-start">
              <WarriorPortrait
                slug={warriorB.slug}
                imageUrl={warriorB.imageUrl}
                nombre={warriorB.nombre}
                className="h-40 w-32 sm:h-44 sm:w-36"
                priority={portraitPriority}
              />
              <p className="mt-2 w-full text-center text-sm font-bold text-zinc-100 sm:max-w-[12rem] sm:text-left sm:text-base">
                {warriorB.nombre}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
