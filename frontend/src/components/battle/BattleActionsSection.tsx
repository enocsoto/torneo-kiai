"use client";

import { useI18n } from "@/i18n/I18nContext";
import { playerNumberFromSide, sidePanelTitle } from "@/lib/player-labels";
import type { Battle, BattleActionType } from "@/lib/types";
import { focusRing, pressScale } from "@/lib/ui";
import { BattleStatBar } from "./BattleStatBar";

type Props = {
  combatActive: boolean;
  pending: boolean;
  couchMode: boolean;
  activeSide: "A" | "B";
  active: Battle["warriorA"];
  act: (type: BattleActionType, attackIndex?: number) => void;
  /** Online: not your turn or spectating. */
  inputLocked?: boolean;
};

/** With `lg:grid-cols-4`, spreads width on the last incomplete row (e.g. 3 → 1+1+2). */
function attackGridColClass(index: number, total: number): string {
  const rem = total % 4;
  const fullRows = Math.floor(total / 4);
  if (index < fullRows * 4) return "";
  const posInLast = index - fullRows * 4;
  const lastCount = rem === 0 ? 4 : rem;
  if (lastCount === 1) return "lg:col-span-4";
  if (lastCount === 2) return "lg:col-span-2";
  if (lastCount === 3 && posInLast === 2) return "lg:col-span-2";
  return "";
}

export function BattleActionsSection({
  combatActive,
  pending,
  couchMode,
  activeSide,
  active,
  act,
  inputLocked = false,
}: Props) {
  const { t } = useI18n();
  const disabledActions = pending || !combatActive || inputLocked;
  const accentIsOrange = activeSide === "A";
  const paletteClass = accentIsOrange
    ? "battle-actions-palette--orange"
    : "battle-actions-palette--sky";
  const hudSideClass = accentIsOrange
    ? "battle-hud-side--orange"
    : "battle-hud-side--sky";
  const turnChipClass = accentIsOrange
    ? "battle-turn-chip--orange"
    : "battle-turn-chip--sky";
  const attackCardBase = `relative flex min-h-[5.25rem] flex-col rounded-2xl border px-4 py-3 text-left transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out motion-reduce:transition-none ${pressScale} ${focusRing}`;
  const attackCardOn = accentIsOrange
    ? "border-orange-500/35 bg-gradient-to-br from-orange-500/15 via-[var(--palette-tint-mid)] to-[var(--palette-tint-end)] [@media(hover:hover)_and_(pointer:fine)]:enabled:hover:border-orange-400/55 [@media(hover:hover)_and_(pointer:fine)]:enabled:hover:from-orange-500/20"
    : "border-sky-500/35 bg-gradient-to-br from-sky-500/15 via-[var(--palette-tint-mid)] to-[var(--palette-tint-end)] [@media(hover:hover)_and_(pointer:fine)]:enabled:hover:border-sky-400/55 [@media(hover:hover)_and_(pointer:fine)]:enabled:hover:from-sky-500/20";

  const activeHpPct =
    active.saludMax > 0
      ? Math.max(0, Math.min(100, (active.salud / active.saludMax) * 100))
      : 0;
  const activeKiPct = Math.max(
    0,
    Math.min(100, (active.ki / active.kiMax) * 100),
  );

  return (
    <section
      data-ooptour="battle-actions"
      className={`relative rounded-3xl border-2 bg-[var(--surface-glass)]/95 p-6 backdrop-blur-xl ${paletteClass}`}
      aria-labelledby="battle-actions-heading"
      data-active-side={activeSide}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 sm:gap-x-3">
            <span
              className={`${turnChipClass} inline-flex max-w-full items-center rounded-lg px-2.5 py-1 text-xs font-semibold leading-none tracking-wide capitalize`}
            >
              {couchMode
                ? sidePanelTitle(activeSide, couchMode, t)
                : t("battle.turnPlayer", {
                    n: playerNumberFromSide(activeSide),
                  })}
            </span>
            <span
              className="hidden h-3 w-px shrink-0 bg-[var(--border-muted)] sm:block"
              aria-hidden
            />
            <span className="text-[11px] font-medium text-[var(--muted)]">
              {t("battle.actions")}
            </span>
          </div>
          <h2
            id="battle-actions-heading"
            className="mt-2 text-lg font-bold tracking-tight text-[var(--foreground)]"
          >
            {active.nombre}
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">{t("battle.turnHint")}</p>
          <p className="mt-2 text-[11px] leading-relaxed text-[var(--muted)]">
            {t("battle.keyboardHint")}
          </p>
        </div>
        <div
          className={`${hudSideClass} shrink-0 flex min-w-[11.5rem] max-w-[16rem] flex-col gap-2 rounded-2xl border p-3 shadow-lg backdrop-blur-md`}
          aria-label={t("battle.activeHud")}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 text-left">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                {t("battle.activeHud")}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-[var(--muted)]">
                {t("battle.defShort", { n: active.defensa })}
                <span className="mx-1.5 text-[var(--foreground-secondary)]">·</span>
                {t("battle.techniqueCount", { n: active.ataques.length })}
              </p>
            </div>
            <span
              className="battle-hud-estado max-w-[min(11rem,46vw)] shrink-0 rounded-lg px-2.5 py-1.5 text-right text-[11px] font-medium leading-snug backdrop-blur-sm"
              title={active.estado}
            >
              {active.estado}
            </span>
          </div>
          <div className="battle-hud-divider space-y-2 border-t pt-2">
            <BattleStatBar
              label={t("battle.statHp")}
              value={active.salud}
              pct={activeHpPct}
              color="bg-gradient-to-r from-red-600 to-orange-500"
              suffix={` / ${active.saludMax}`}
              variant="hp"
              compact
            />
            <BattleStatBar
              label={t("battle.statKi")}
              value={active.ki}
              pct={activeKiPct}
              color="bg-gradient-to-r from-cyan-500 to-sky-400"
              suffix={` / ${active.kiMax}`}
              compact
            />
          </div>
          {active.esquivaPendiente ? (
            <p className="battle-dodge-hint text-center text-[10px] font-medium leading-tight">
              {t("battle.dodgeReady")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="relative mt-5" data-testid="battle-actions">
        {pending ? (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[var(--background)]/45 backdrop-blur-[3px]"
            aria-busy="true"
            aria-live="polite"
          >
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-orange-400/25 border-t-orange-400 motion-reduce:animate-none motion-reduce:border-t-transparent"
              aria-hidden
            />
          </div>
        ) : null}
        <div
          className={`space-y-4 ${pending ? "pointer-events-none opacity-50" : ""}`}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {active.ataques.map((at, idx) => {
              const canAfford =
                at.costoEnergia === 0 || active.ki >= at.costoEnergia;
              const attackDisabled = disabledActions || !canAfford;
              const spanLg = attackGridColClass(
                idx,
                active.ataques.length,
              );
              return (
                <div
                  key={`${at.nombre}-${idx}`}
                  data-ooptour={idx === 0 ? "battle-attack-first" : undefined}
                  className={`attack-epic-shell flex min-h-[5.25rem] rounded-2xl ${accentIsOrange ? "" : "attack-epic-shell--sky"} ${attackDisabled ? "opacity-[0.42]" : ""} ${spanLg}`}
                >
                  <button
                    type="button"
                    data-testid={`action-attack-${idx}`}
                    disabled={attackDisabled}
                    title={
                      canAfford
                        ? undefined
                        : t("battle.attackNeedKi", {
                            need: at.costoEnergia,
                            have: active.ki,
                          })
                    }
                    onClick={() => void act("ATTACK", idx)}
                    className={`attack-epic-inner flex min-h-[5.25rem] w-full flex-1 overflow-hidden ${attackCardBase} ${attackCardOn} text-[var(--foreground)] disabled:cursor-not-allowed disabled:border-[var(--border-subtle)] disabled:bg-[var(--surface-raised)] disabled:shadow-none ${!canAfford && !pending ? "border-dashed border-amber-500/40 opacity-90" : ""}`}
                  >
                    {!attackDisabled ? (
                      <span
                        className="attack-epic-sheen pointer-events-none"
                        aria-hidden
                      />
                    ) : null}
                    <span className="battle-attack-slot absolute right-3 top-3 z-[3] flex h-6 min-w-[1.5rem] items-center justify-center rounded-md px-1.5 text-[11px] font-bold tabular-nums">
                      {idx + 1}
                    </span>
                    <span className="relative z-[3] pr-10 text-base font-semibold leading-snug">
                      {at.nombre}
                    </span>
                    <span className="battle-attack-meta relative z-[3] mt-auto pt-2 text-xs font-medium">
                      <span className="battle-attack-damage">
                        {t("battle.attackDamage", { n: at.daño })}
                      </span>
                      <span className="mx-1.5 text-[var(--foreground-secondary)]">
                        ·
                      </span>
                      <span
                        className={
                          canAfford
                            ? "battle-attack-ki-ok text-cyan-300/90"
                            : "text-[var(--status-warn-amber)]"
                        }
                      >
                        Ki {at.costoEnergia}
                      </span>
                    </span>
                    {!canAfford && !pending ? (
                      <span className="battle-ki-warn relative z-[3] mt-1 text-[11px] font-medium">
                        {t("battle.attackNoKi")}
                      </span>
                    ) : null}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              data-testid="action-recharge"
              disabled={disabledActions}
              onClick={() => void act("RECHARGE")}
              className={`flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-600/90 to-emerald-800/85 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-950/35 transition-[transform,box-shadow,opacity] duration-200 ease-out motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-35 lg:col-span-2 ${pressScale} ${focusRing} [@media(hover:hover)_and_(pointer:fine)]:enabled:hover:border-emerald-400/55 [@media(hover:hover)_and_(pointer:fine)]:enabled:hover:shadow-emerald-500/25`}
            >
              <span className="text-lg leading-none" aria-hidden>
                ↯
              </span>
              <span className="text-left leading-tight">{t("battle.recharge")}</span>
            </button>
            <button
              type="button"
              data-testid="action-dodge"
              disabled={disabledActions}
              onClick={() => void act("DODGE")}
              className={`flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl border border-violet-400/40 bg-gradient-to-br from-violet-600/90 to-indigo-800/80 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-950/35 transition-[transform,box-shadow,opacity] duration-200 ease-out motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-35 lg:col-span-2 ${pressScale} ${focusRing} [@media(hover:hover)_and_(pointer:fine)]:enabled:hover:border-violet-300/55 [@media(hover:hover)_and_(pointer:fine)]:enabled:hover:shadow-violet-500/25`}
            >
              <span className="text-lg leading-none" aria-hidden>
                ◎
              </span>
              <span className="text-left leading-tight">{t("battle.dodge")}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
