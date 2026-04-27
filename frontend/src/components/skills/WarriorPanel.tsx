import type { Warrior, WarriorSkillConfig } from "@/lib/types";
import { focusRing } from "@/lib/ui";
import { useI18n } from "@/i18n/I18nContext";
import { WarriorPortrait } from "@/components/WarriorPortrait";

const MAX_BONUS_SLOTS = 3;

interface WarriorPanelProps {
  warriors: Warrior[];
  warriorId: string | null;
  selectedWarrior: Warrior | null;
  config: WarriorSkillConfig | null;
  loadingConfig: boolean;
  winsToNextSlot: number;
  progressPct: number;
  onWarriorChange: (wid: string) => void;
}

export function WarriorPanel({
  warriors,
  warriorId,
  selectedWarrior,
  config,
  loadingConfig,
  winsToNextSlot,
  progressPct,
  onWarriorChange,
}: WarriorPanelProps) {
  const { t } = useI18n();

  return (
    <div className="skill-panel-left space-y-4 md:sticky md:top-6 md:self-start">
      <div className="space-y-1.5">
        <label
          className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--muted)]"
          htmlFor="hab-warrior"
        >
          {t("skills.chooseWarrior")}
        </label>
        <div className="relative">
          <select
            id="hab-warrior"
            className={`w-full appearance-none rounded-xl border border-[var(--border-muted)] bg-[var(--surface-glass)] py-3 pl-4 pr-11 text-sm text-[var(--foreground)] backdrop-blur-sm ${focusRing}`}
            value={warriorId ?? ""}
            onChange={(e) => onWarriorChange(e.target.value)}
          >
            <option value="">{t("skills.selectWarrior")}</option>
            {warriors.map((w) => (
              <option key={w._id} value={w._id}>
                {w.nombre}
              </option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            aria-hidden
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>
      </div>

      {selectedWarrior ? (
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-b from-[var(--surface-raised)] to-[var(--surface-glass)] p-5 shadow-[var(--shadow-card)]">
          <div
            className="warrior-aura pointer-events-none absolute left-1/2 top-0 h-52 w-52 -translate-x-1/2 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(251,146,60,0.3) 0%, transparent 68%)",
            }}
            aria-hidden
          />

          <div className="relative mx-auto w-fit">
            <WarriorPortrait
              slug={selectedWarrior.slug}
              imageUrl={selectedWarrior.imageUrl}
              nombre={selectedWarrior.nombre}
              className="h-64 w-48"
              priority
            />
            <div className="turn-active-glow pointer-events-none absolute inset-0 rounded-xl" aria-hidden />
          </div>

          <h2 className="mt-4 text-center text-lg font-bold tracking-tight text-[var(--foreground)]">
            {selectedWarrior.nombre}
          </h2>

          {config && (
            <>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <StatCell label={t("skills.statWins")} value={config.wins} accent />
                <StatCell
                  label={t("skills.statSlots")}
                  value={
                    <>
                      {config.bonusSlots}
                      <span className="text-sm text-[var(--muted)]">/{MAX_BONUS_SLOTS}</span>
                    </>
                  }
                />
                <StatCell label="Def" value={selectedWarrior.defensa} />
              </div>

              {config.bonusSlots < MAX_BONUS_SLOTS && (
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-[10px] text-[var(--muted)]">
                    <span>{t("skills.nextSlot")}</span>
                    <span>
                      {winsToNextSlot === 1
                        ? t("skills.winsMoreOne")
                        : t("skills.winsMoreMany", { n: winsToNextSlot })}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bar-track)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-amber-400 transition-[width] duration-700 ease-out"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}

              {config.bonusSlots >= MAX_BONUS_SLOTS && (
                <div className="mt-4 rounded-lg bg-amber-500/10 px-3 py-2 text-center text-[11px] font-semibold text-[var(--accent-text)] ring-1 ring-amber-500/20">
                  {t("skills.allSlotsUnlocked")}
                </div>
              )}
            </>
          )}

          {loadingConfig && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="skeleton-pulse h-14 rounded-xl bg-[var(--surface-ghost)]"
                  style={{ animationDelay: `${i * 60}ms` }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-52 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--border-subtle)] text-[var(--muted)]">
          <span className="text-3xl" aria-hidden>👤</span>
          <p className="text-sm">{t("skills.chooseWarriorEmpty")}</p>
        </div>
      )}
    </div>
  );
}

function StatCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl bg-[var(--surface-ghost)] px-2 py-2.5 ring-1 ring-[var(--border-subtle)]">
      <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </p>
      <p
        className={`mt-0.5 text-xl font-bold ${accent ? "text-[var(--accent-text)]" : "text-[var(--foreground)]"}`}
      >
        {value}
      </p>
    </div>
  );
}
