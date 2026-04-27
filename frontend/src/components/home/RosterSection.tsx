import { useI18n } from "@/i18n/I18nContext";
import type { RosterState, Warrior } from "@/lib/types";
import { NextUnlockSection } from "./NextUnlockSection";
import { WarriorCard } from "./WarriorCard";

interface RosterSectionProps {
  warriors: Warrior[];
  allWarriors: Warrior[];
  rosterProgress: RosterState | null;
  aId: string | null;
  bId: string | null;
  onAssign: (id: string) => void;
  onSelect: (slot: "A" | "B", id: string) => void;
}

export function RosterSection({
  warriors,
  allWarriors,
  rosterProgress,
  aId,
  bId,
  onAssign,
  onSelect,
}: RosterSectionProps) {
  const { t } = useI18n();
  return (
    <section
      id="roster"
      data-ooptour="home-roster"
      className="space-y-4 overflow-visible scroll-mt-8"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-lg font-medium text-[var(--foreground-secondary)]">
          {t("home.roster")}
        </h2>
        {rosterProgress &&
        rosterProgress.unlockedCount < rosterProgress.totalInOrder ? (
          <p className="text-xs tabular-nums text-[var(--muted)] sm:text-right">
            {t("home.rosterProgress", {
              unlocked: rosterProgress.unlockedCount,
              total: rosterProgress.totalInOrder,
            })}
          </p>
        ) : null}
      </div>
      {rosterProgress &&
      rosterProgress.unlockedCount < rosterProgress.totalInOrder ? (
        <p className="max-w-3xl text-pretty text-sm leading-relaxed text-[var(--foreground-secondary)]">
          {t("home.rosterUnlockRule", {
            need: rosterProgress.requisitoPartidas,
          })}
        </p>
      ) : null}
      {warriors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-muted)] bg-[var(--surface-ghost)] px-6 py-12 text-center">
          <p className="text-[var(--muted)]">{t("home.emptyRoster")}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {t("home.emptyRosterHint", {
              cmd: "npm run seed",
              folder: "backend",
            })}
          </p>
        </div>
      ) : null}
      <ul className="grid auto-rows-fr gap-3 overflow-visible sm:grid-cols-2 lg:grid-cols-4">
        {warriors.map((w, index) => (
          <WarriorCard
            key={w._id}
            warrior={w}
            index={index}
            aId={aId}
            bId={bId}
            onAssign={onAssign}
            onSelect={onSelect}
          />
        ))}
      </ul>
      {rosterProgress ? (
        <NextUnlockSection
          rosterProgress={rosterProgress}
          warriors={warriors}
          allWarriors={allWarriors}
        />
      ) : null}
    </section>
  );
}
