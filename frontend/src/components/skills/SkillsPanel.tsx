import type { WarriorSkillConfig } from "@/lib/types";
import { focusRing, pressScale } from "@/lib/ui";
import { useI18n } from "@/i18n/I18nContext";
import { ActiveSkillCard } from "./ActiveSkillCard";
import { LockedSlotCard } from "./LockedSlotCard";
import { SkeletonCard } from "./SkeletonCard";
import { EmptyState } from "./EmptyState";

interface LockedSlot {
  slotIndex: number;
  winsNeeded: number;
}

interface SkillsPanelProps {
  warriorId: string | null;
  config: WarriorSkillConfig | null;
  loadingConfig: boolean;
  picks: string[];
  earnedSlots: number;
  lockedSlots: LockedSlot[];
  progressWins: number;
  saving: boolean;
  isDirty: boolean;
  onPick: (index: number, clave: string) => void;
  onSave: () => void;
}

export function SkillsPanel({
  warriorId,
  config,
  loadingConfig,
  picks,
  earnedSlots,
  lockedSlots,
  progressWins,
  saving,
  isDirty,
  onPick,
  onSave,
}: SkillsPanelProps) {
  const { t } = useI18n();

  return (
    <div className="skill-panel-right space-y-3">
      {!warriorId && <EmptyState />}

      {warriorId && loadingConfig && (
        <>
          <SkeletonCard index={0} />
          <SkeletonCard index={1} />
          <SkeletonCard index={2} />
        </>
      )}

      {config && !loadingConfig && (
        <>
          {config.bonusSlots === 0 && (
            <div className="skill-card-enter rounded-2xl border border-[var(--status-warn-border)] bg-[var(--status-warn-bg)] p-5">
              <p className="text-sm text-[var(--status-warn-fg)]">
                {t("skills.noSlots")}
              </p>
            </div>
          )}

          {Array.from({ length: earnedSlots }, (_, i) => i).map((i) => {
            const effectivePicks =
              picks.length === earnedSlots ? picks : config.selectedClaves;
            const selectedClave =
              effectivePicks[i] ?? config.pool[i]?.clave ?? "";
            const selectedSkill =
              config.pool.find((p) => p.clave === selectedClave) ??
              config.pool[0];
            return (
              <ActiveSkillCard
                key={i}
                skill={selectedSkill}
                slotIndex={i}
                pool={config.pool}
                picks={
                  picks.length === earnedSlots ? picks : config.selectedClaves
                }
                onPick={onPick}
              />
            );
          })}

          {lockedSlots.map(({ slotIndex, winsNeeded }) => (
            <LockedSlotCard
              key={slotIndex}
              slotIndex={slotIndex}
              winsNeeded={Math.max(1, winsNeeded)}
              currentProgress={progressWins}
            />
          ))}

          {earnedSlots > 0 && (
            <div className="pt-1">
              <button
                type="button"
                disabled={saving || !isDirty}
                onClick={onSave}
                className={`rounded-xl border border-[var(--status-warn-border)] bg-gradient-to-r from-[var(--accent)]/20 to-amber-500/10 px-6 py-3 text-sm font-semibold text-[var(--foreground)] sm:w-auto ${pressScale} ${focusRing} disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {saving ? t("skills.saving") : t("skills.save")}
              </button>
              {isDirty && (
                <p className="mt-2 text-xs text-[var(--muted)]">
                  {t("skills.unsavedChanges")}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
