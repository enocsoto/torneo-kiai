import { WarriorPortrait } from "@/components/WarriorPortrait";
import { useI18n } from "@/i18n/I18nContext";
import type { RosterState, Warrior } from "@/lib/types";

interface NextUnlockSectionProps {
  rosterProgress: RosterState;
  warriors: Warrior[];
  allWarriors: Warrior[];
}

export function NextUnlockSection({
  rosterProgress,
  warriors,
  allWarriors,
}: NextUnlockSectionProps) {
  const { t } = useI18n();

  if (rosterProgress.unlockedCount >= rosterProgress.totalInOrder) return null;

  const nextW = rosterProgress.siguienteSlug
    ? allWarriors.find((w) => w.slug === rosterProgress.siguienteSlug)
    : null;
  const faltan = rosterProgress.faltanParaDesbloqueo;
  const req = rosterProgress.requisitoPartidas;
  const isReady = rosterProgress.puedeDesbloquear;

  return (
    <div className="space-y-4">
      {nextW ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent-text)]">
            {t("home.nextUnlockLabel")}
          </p>
          <div className="relative overflow-hidden rounded-2xl border border-dashed border-[var(--border-muted)] bg-[var(--surface-ghost)]">
            <div className="flex items-center gap-4 p-4">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl">
                <WarriorPortrait
                  slug={nextW.slug}
                  imageUrl={nextW.imageUrl}
                  nombre={nextW.nombre}
                  className="h-20 w-16 saturate-0 brightness-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-8 w-8 text-[var(--muted)]"
                    aria-hidden
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[var(--foreground-secondary)]">
                  {isReady ? nextW.nombre : "???"}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                  {isReady
                    ? t("home.unlockReadyHint")
                    : t("home.rosterLockedHint")}
                </p>
              </div>
              <div
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                  isReady
                    ? "bg-[rgba(34,197,94,0.15)] text-green-400 border border-green-500/25"
                    : "bg-[var(--chip-surface)] text-[var(--muted)] border border-[var(--border-subtle)]"
                }`}
              >
                {isReady ? "✓ Listo" : "🔒"}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {faltan.length > 0 && !isReady ? (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-ghost)] px-4 py-3">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            {t("home.unlockProgressTitle")}
          </p>
          <ul className="space-y-2.5">
            {faltan.map((item) => {
              const done = req - item.falta;
              const pct = Math.min(100, (done / req) * 100);
              const name =
                warriors.find((w) => w.slug === item.slug)?.nombre ?? item.slug;
              return (
                <li key={item.slug} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 truncate text-xs text-[var(--foreground-secondary)]">
                    {name}
                  </span>
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[var(--bar-track)]">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent)] transition-[width] duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right text-xs tabular-nums text-[var(--muted)]">
                    {t("home.battlesCount", { done, need: req })}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
