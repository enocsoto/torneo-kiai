import type { HabilidadPoolEntry } from "@/lib/types";
import { focusRing } from "@/lib/ui";
import { useI18n } from "@/i18n/I18nContext";
import { SkillStatBadge } from "./SkillStatBadge";

interface ActiveSkillCardProps {
  skill: HabilidadPoolEntry | undefined;
  slotIndex: number;
  pool: HabilidadPoolEntry[];
  picks: string[];
  onPick: (index: number, clave: string) => void;
}

export function ActiveSkillCard({
  skill,
  slotIndex,
  pool,
  picks,
  onPick,
}: ActiveSkillCardProps) {
  const { t } = useI18n();

  return (
    <div
      className="skill-card-enter skill-glow-pulse group relative overflow-hidden rounded-2xl border border-[var(--status-warn-border)] bg-gradient-to-br from-amber-500/[0.06] via-[var(--surface-glass)] to-transparent p-5 backdrop-blur-sm"
      style={{ animationDelay: `${slotIndex * 70}ms` }}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(251,146,60,0.18) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative mb-4 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
          {t("skills.slotLabel", { n: slotIndex + 1 })}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--accent-text)]">
          <span aria-hidden className="text-amber-400">✦</span>{" "}
          {t("skills.equipped")}
        </span>
      </div>

      {skill ? (
        <div className="relative flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/25 to-orange-600/10 text-2xl ring-1 ring-amber-400/25">
            ⚡
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-base font-bold tracking-tight text-[var(--foreground)]">
              {skill.nombre}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <SkillStatBadge
                icon="⚔"
                value={skill.daño}
                label={t("skills.damage")}
                color="red"
              />
              <SkillStatBadge
                icon="◈"
                value={skill.costoEnergia}
                label="Ki"
                color="sky"
              />
            </div>

            {pool.length > 1 && (
              <div className="relative mt-1">
                <select
                  value={picks[slotIndex] ?? skill.clave}
                  onChange={(e) => onPick(slotIndex, e.target.value)}
                  className={`w-full cursor-pointer appearance-none rounded-lg border border-[var(--border-muted)] bg-[var(--surface-input)] py-1.5 pl-2.5 pr-9 text-xs text-[var(--foreground)] ${focusRing}`}
                >
                  {pool.map((p) => (
                    <option key={p.clave} value={p.clave}>
                      {p.nombre} — ⚔{p.daño} / ◈{p.costoEnergia}
                    </option>
                  ))}
                </select>
                <span
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] leading-none text-[var(--muted)]"
                  aria-hidden
                >
                  ▼
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="relative text-sm text-[var(--muted)]">
          {t("skills.chooseTechnique")}
        </p>
      )}
    </div>
  );
}
