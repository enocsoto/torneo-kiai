import { WarriorPortrait } from "@/components/WarriorPortrait";
import { useI18n } from "@/i18n/I18nContext";
import type { Warrior } from "@/lib/types";
import { focusRing, pressScale } from "@/lib/ui";

interface WarriorCardProps {
  warrior: Warrior;
  index: number;
  aId: string | null;
  bId: string | null;
  onAssign: (id: string) => void;
  onSelect: (slot: "A" | "B", id: string) => void;
}

export function WarriorCard({
  warrior: w,
  index,
  aId,
  bId,
  onAssign,
  onSelect,
}: WarriorCardProps) {
  const { t } = useI18n();
  const isA = aId === w._id;
  const isB = bId === w._id;
  const isPicked = isA || isB;

  return (
    <li
      data-testid={`roster-item-${w.slug}`}
      className="roster-card-enter flex h-full min-h-0 flex-col overflow-visible rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-glass)] p-3 shadow-[var(--shadow-elevate)] backdrop-blur-md"
      style={{ animationDelay: `${Math.min(index, 7) * 45}ms` }}
    >
      <div className="flex min-h-0 flex-1 flex-col items-center gap-2 overflow-visible">
        <div
          className={`group/preview relative z-20 w-32 shrink-0 overflow-visible ${
            isA ? "pick-charged" : isB ? "pick-charged pick-charged--sky" : ""
          }`}
        >
          {isPicked ? (
            <div className="pick-sparks" aria-hidden>
              <span />
              <span />
              <span />
            </div>
          ) : null}
          <button
            type="button"
            data-testid={`portrait-${w.slug}`}
            aria-label={t("home.portraitPick", { name: w.nombre })}
            onClick={() => onAssign(w._id)}
            className={`relative z-[1] block w-full cursor-pointer rounded-xl p-0 transition-[box-shadow,transform] duration-200 ease-out motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5 ${focusRing} ${
              isA
                ? "ring-2 ring-orange-300/95 shadow-lg shadow-orange-500/40"
                : isB
                  ? "ring-2 ring-sky-300/95 shadow-lg shadow-sky-500/40"
                  : "ring-1 ring-[var(--border-muted)] [@media(hover:hover)_and_(pointer:fine)]:hover:ring-orange-400/40"
            }`}
          >
            <WarriorPortrait
              slug={w.slug}
              imageUrl={w.imageUrl}
              nombre={w.nombre}
              embedInButton
              className="pointer-events-none h-48 w-32"
            />
          </button>
          <div
            role="tooltip"
            id={`preview-${w.slug}`}
            className="invisible absolute bottom-full left-1/2 z-[120] mb-2 w-[min(calc(100vw-2rem),17.5rem)] origin-bottom -translate-x-1/2 scale-[0.98] rounded-xl border border-[var(--tooltip-border)] bg-[var(--tooltip-bg)] px-3 py-2.5 text-left text-xs text-[var(--tooltip-fg)] opacity-0 shadow-2xl backdrop-blur-md transition-[opacity,transform,visibility] duration-150 ease-out [@media(hover:hover)_and_(pointer:fine)]:group-hover/preview:visible [@media(hover:hover)_and_(pointer:fine)]:group-hover/preview:scale-100 [@media(hover:hover)_and_(pointer:fine)]:group-hover/preview:opacity-100 group-focus-within/preview:visible group-focus-within/preview:scale-100 group-focus-within/preview:opacity-100 motion-reduce:transition-none"
          >
            <p className="font-semibold text-[var(--tooltip-fg)]">{w.nombre}</p>
            <p className="mt-1 leading-relaxed text-[var(--tooltip-muted)]">
              {t("home.preview.state")}: {w.estado}
              {w.evolucionActiva ? ` · ${w.evolucionActiva.nombre}` : ""}
            </p>
            <p className="mt-1 tabular-nums text-[var(--tooltip-muted)]">
              {t("home.tooltipStats", {
                hp: w.saludBase,
                ki: w.kiBase,
                def: w.defensa,
              })}
            </p>
            <p className="mt-2 font-medium text-[var(--foreground-secondary)]">
              {t("home.preview.attacks")}
            </p>
            <ul className="mt-1 space-y-0.5 text-[var(--tooltip-muted)]">
              {w.ataques.map((a) => (
                <li key={a._id}>
                  {a.nombre}{" "}
                  <span className="tabular-nums opacity-80">
                    {t("home.statsAttackLine", {
                      daño: a.daño,
                      ki: a.costoEnergia,
                    })}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 border-t border-[var(--border-subtle)] pt-2 text-[10px] opacity-75">
              {t("home.preview.hint")}
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center">
          <p className="text-sm font-medium leading-tight tracking-tight">
            {w.nombre}
          </p>
        </div>
        <div className="mt-auto flex w-full gap-1.5">
          <button
            type="button"
            data-testid={`pick-${w.slug}-A`}
            aria-label={t("home.assignP1", { name: w.nombre })}
            onClick={() => onSelect("A", w._id)}
            className={`flex-1 rounded-lg px-1.5 py-2 text-[11px] font-semibold transition-[transform,background-color,color] duration-200 ease-out motion-reduce:transition-none ${pressScale} ${focusRing} ${
              isA
                ? "bg-orange-500 text-[var(--on-accent)] shadow-md shadow-orange-500/30"
                : "bg-[var(--chip-surface)] text-[var(--foreground)] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[var(--chip-surface-hover)]"
            }`}
          >
            {t("home.player1")}
          </button>
          <button
            type="button"
            data-testid={`pick-${w.slug}-B`}
            aria-label={t("home.assignP2", { name: w.nombre })}
            onClick={() => onSelect("B", w._id)}
            className={`flex-1 rounded-lg px-1.5 py-2 text-[11px] font-semibold transition-[transform,background-color,color] duration-200 ease-out motion-reduce:transition-none ${pressScale} ${focusRing} ${
              isB
                ? "bg-sky-500 text-[var(--on-accent)] shadow-md shadow-sky-500/30"
                : "bg-[var(--chip-surface)] text-[var(--foreground)] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[var(--chip-surface-hover)]"
            }`}
          >
            {t("home.player2")}
          </button>
        </div>
      </div>
    </li>
  );
}
