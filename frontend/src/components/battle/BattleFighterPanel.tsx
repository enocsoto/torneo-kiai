"use client";

import { useEffect, useRef, useState } from "react";
import { WarriorPortrait } from "@/components/WarriorPortrait";
import { useI18n } from "@/i18n/I18nContext";
import type { Battle } from "@/lib/types";
import type { PanelFx } from "./battle-types";
import { BattleStatBar } from "./BattleStatBar";

type Props = {
  title: string;
  subtitle: string | null;
  tone: "orange" | "sky";
  w: Battle["warriorA"];
  isActive: boolean;
  fx: PanelFx | null;
  /** A = left, B = right in the battle layout */
  side: "A" | "B";
  /** Bumps when an attack is fired from this fighter; drives the lunge animation. */
  lungeKey: number;
  /** LCP: portrait should be visible when the battle view loads. */
  portraitPriority?: boolean;
};

export function BattleFighterPanel({
  title,
  subtitle,
  tone,
  w,
  isActive,
  fx,
  side,
  lungeKey,
  portraitPriority = false,
}: Props) {
  const { t } = useI18n();
  const ring =
    tone === "orange"
      ? "ring-orange-400/55 shadow-orange-500/15"
      : "ring-sky-400/55 shadow-sky-500/15";
  const hpPct =
    w.saludMax > 0
      ? Math.max(0, Math.min(100, (w.salud / w.saludMax) * 100))
      : 0;
  const kiPct = Math.max(0, Math.min(100, (w.ki / w.kiMax) * 100));
  const isKO = w.salud <= 0;

  const [shake, setShake] = useState(false);
  const [hitEpic, setHitEpic] = useState<{ crit: boolean } | null>(null);
  const [lunge, setLunge] = useState(false);
  const prevKey = useRef<number | null>(null);
  const prevLungeKey = useRef(0);

  useEffect(() => {
    if (lungeKey > 0 && lungeKey !== prevLungeKey.current) {
      prevLungeKey.current = lungeKey;
      setLunge(true);
      const t = window.setTimeout(() => setLunge(false), 520);
      return () => window.clearTimeout(t);
    }
  }, [lungeKey]);

  useEffect(() => {
    if (!fx || fx.key === prevKey.current) return;
    prevKey.current = fx.key;
    setShake(true);
    setHitEpic({ crit: Boolean(fx.crit) });
    const tShake = window.setTimeout(() => setShake(false), 450);
    const tHit = window.setTimeout(() => setHitEpic(null), 540);
    return () => {
      window.clearTimeout(tShake);
      window.clearTimeout(tHit);
    };
  }, [fx]);

  return (
    <div
      className={`relative min-w-0 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-glass)] p-3 shadow-[var(--shadow-card)] backdrop-blur-md transition-[box-shadow,transform] duration-200 ease-out motion-reduce:transition-none sm:rounded-2xl sm:p-4 ${
        isActive
          ? `ring-2 ${ring} scale-[1.01] motion-reduce:scale-100 turn-active-glow`
          : ""
      } ${shake ? "panel-damage-shake" : ""} ${isKO ? "ring-2 ring-[var(--status-danger)]/50 saturate-[0.82]" : ""}`}
    >
      {hitEpic ? (
        <div
          className={`panel-hit-epic ${hitEpic.crit ? "panel-hit-epic--crit" : ""}`}
          aria-hidden
        >
          <div className="panel-hit-epic__flash" />
          <div className="panel-hit-epic__bolt" />
          <div className="panel-hit-epic__bolt panel-hit-epic__bolt--side" />
          <div className="panel-hit-epic__bolt panel-hit-epic__bolt--side2" />
        </div>
      ) : null}
      {isKO ? (
        <>
          <span className="sr-only">K.O.</span>
          <div className="fighter-ko-epic" aria-hidden>
            <span className="fighter-ko-epic-text">K.O.</span>
          </div>
        </>
      ) : null}
      {fx ? (
        <div
          key={fx.key}
          className={`dmg-float-epic pointer-events-none absolute left-1/2 top-[4.5rem] z-20 text-base tabular-nums sm:top-28 sm:text-lg md:top-32 ${fx.crit ? "dmg-float-epic--crit" : ""}`}
          aria-hidden
        >
          −{fx.dmg}
        </div>
      ) : null}

      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] sm:text-xs sm:tracking-widest">
        {title}
      </p>
      {subtitle ? (
        <p className="mt-0.5 text-[11px] font-medium tracking-wide text-[var(--muted)]">
          {subtitle}
        </p>
      ) : null}
      <div className="mt-2 flex flex-col items-center gap-2 sm:mt-3 sm:gap-3 sm:flex-row sm:items-start">
        <div
          className={`shrink-0 ${
            lunge ? (side === "A" ? "fighter-lunge-a" : "fighter-lunge-b") : ""
          }`}
        >
          <WarriorPortrait
            slug={w.slug}
            imageUrl={w.imageUrl}
            nombre={w.nombre}
            className={`h-32 w-24 sm:h-44 sm:w-36 md:h-52 md:w-40 ${isKO ? "grayscale" : ""}`}
            priority={portraitPriority}
          />
        </div>
        <div className="w-full min-w-0 flex-1 space-y-2 sm:space-y-3">
          <div>
            <p className="text-sm font-semibold tracking-tight sm:text-lg">
              {w.nombre}
            </p>
            <p className="text-xs text-[var(--muted)]">
              {w.estado} · {t("battle.defShort", { n: w.defensa })}
              {w.esquivaPendiente ? (
                <span className="battle-dodge-hint">
                  {" "}
                  · {t("battle.dodgeReady")}
                </span>
              ) : null}
            </p>
          </div>
          <BattleStatBar
            label={t("battle.statHp")}
            value={w.salud}
            pct={hpPct}
            color="bg-gradient-to-r from-red-600 to-orange-500"
            suffix={` / ${w.saludMax}`}
            hitKey={fx?.key}
            variant="hp"
          />
          <BattleStatBar
            label={t("battle.statKi")}
            value={w.ki}
            pct={kiPct}
            color="bg-gradient-to-r from-cyan-500 to-sky-400"
            suffix={` / ${w.kiMax}`}
          />
        </div>
      </div>
    </div>
  );
}
