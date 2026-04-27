import { useI18n } from "@/i18n/I18nContext";

export function RosterSkeleton() {
  const { t } = useI18n();
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      aria-busy="true"
      aria-label={t("home.loadingRoster")}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--chip-surface)] p-4 backdrop-blur"
        >
          <div className="skeleton-pulse mx-auto h-48 w-32 rounded-xl bg-[var(--skeleton)]" />
          <div className="skeleton-pulse mx-auto mt-3 h-4 w-24 rounded bg-[var(--skeleton)]" />
          <div className="skeleton-pulse mx-auto mt-2 h-3 w-full max-w-[180px] rounded bg-[var(--skeleton)]" />
          <div className="mt-4 flex gap-2">
            <div className="skeleton-pulse h-9 flex-1 rounded-lg bg-[var(--skeleton)]" />
            <div className="skeleton-pulse h-9 flex-1 rounded-lg bg-[var(--skeleton)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
