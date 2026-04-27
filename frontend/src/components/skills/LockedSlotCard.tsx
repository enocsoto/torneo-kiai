import { useI18n } from "@/i18n/I18nContext";

const WINS_PER_SLOT = 3;

interface LockedSlotCardProps {
  slotIndex: number;
  winsNeeded: number;
  currentProgress: number;
}

export function LockedSlotCard({
  slotIndex,
  winsNeeded,
  currentProgress,
}: LockedSlotCardProps) {
  const { t } = useI18n();
  const pct = Math.min(
    100,
    Math.max(0, (currentProgress / WINS_PER_SLOT) * 100),
  );

  return (
    <div
      className="skill-card-enter relative overflow-hidden rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-ghost)] p-5 opacity-55"
      style={{ animationDelay: `${slotIndex * 70}ms` }}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
          {t("skills.slotLabel", { n: slotIndex + 1 })}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-[var(--surface-inset)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
          🔒 {t("skills.locked")}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-[var(--border-subtle)] text-2xl">
          🔒
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-semibold text-[var(--muted)]">
            {t("skills.lockedSlot")}
          </p>
          <p className="text-xs text-[var(--muted)]">
            {winsNeeded === 1
              ? t("skills.winsToUnlockOne")
              : t("skills.winsToUnlockMany", { n: winsNeeded })}
          </p>
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-[var(--bar-track)]">
            <div
              className="h-full rounded-full bg-[var(--muted)]/50 transition-[width] duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
