"use client";

import { WarriorPortrait } from "@/components/WarriorPortrait";
import { useI18n } from "@/i18n/I18nContext";
import type { Warrior } from "@/lib/types";

type Props = {
  warrior: Warrior;
  onClose: () => void;
};

/**
 * Centered “epic” overlay when the player unlocks a new warrior
 * after meeting the match requirement.
 */
export function WarriorUnlockReveal({ warrior, onClose }: Props) {
  const { t } = useI18n();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("unlock.newWarrior")}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[var(--scrim)] p-4 backdrop-blur-[12px]"
      onClick={onClose}
    >
      {/* Gold radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,color-mix(in_srgb,var(--accent)_12%,transparent),transparent_70%)]"
      />

      <article
        className="relative flex max-w-[min(440px,calc(100vw-24px))] w-full flex-col items-center gap-6 rounded-3xl border border-[var(--status-warn-border)] bg-[var(--surface)] p-7 text-[var(--foreground)] shadow-[var(--shadow-card)] sm:p-10"
        style={{
          animation:
            "unlock-reveal-in 400ms cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Badge: new warrior (copy from i18n) */}
        <div
          className="rounded-full border border-[var(--status-warn-border)] bg-[var(--status-warn-bg)] px-5 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--status-warn-fg)]"
          style={{ animation: "unlock-badge-in 400ms 60ms ease-out both" }}
        >
          {t("unlock.newWarrior")}
        </div>

        {/* Portrait with gold frame */}
        <div
          className="relative"
          style={{ animation: "unlock-badge-in 420ms 180ms ease-out both" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-[-16px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_65%)]"
            style={{ animation: "unlock-glow-pulse-gold 2.2s ease-in-out infinite" }}
          />
          <div
            className="relative z-[1] rounded-[1.1rem] p-[3px]"
            style={{
              background: "linear-gradient(135deg, #fbbf24, #f97316)",
              boxShadow: "0 0 36px rgba(251,191,36,0.4)",
            }}
          >
            <WarriorPortrait
              slug={warrior.slug}
              imageUrl={warrior.imageUrl}
              nombre={warrior.nombre}
              className="h-44 w-36 rounded-[0.85rem]"
            />
          </div>
        </div>

        {/* Warrior name + stats */}
        <div
          className="space-y-2 text-center"
          style={{ animation: "unlock-badge-in 400ms 340ms ease-out both" }}
        >
          <h2
            className="text-3xl font-black tracking-tight sm:text-4xl"
            style={{
              background:
                "linear-gradient(135deg, #fef9c3 0%, #fbbf24 48%, #f97316 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1.1,
            }}
          >
            {warrior.nombre}
          </h2>
          <p className="text-sm tabular-nums text-[var(--muted)]">
            HP{" "}
            <span className="font-semibold text-[var(--foreground-secondary)]">
              {warrior.saludBase}
            </span>{" "}
            · Ki{" "}
            <span className="font-semibold text-[var(--foreground-secondary)]">
              {warrior.kiBase}
            </span>{" "}
            · DEF{" "}
            <span className="font-semibold text-[var(--foreground-secondary)]">
              {warrior.defensa}
            </span>
          </p>
          {warrior.ataques.length > 0 && (
            <p className="text-xs text-[var(--muted)]">
              {warrior.ataques.map((a) => a.nombre).join(" · ")}
            </p>
          )}
        </div>

        {/* Discover / dismiss CTA */}
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl py-3.5 text-sm font-bold transition-opacity hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #fbbf24, #f97316)",
            color: "#0c0a09",
            border: "none",
            boxShadow: "0 4px 20px rgba(251,191,36,0.35)",
            animation: "unlock-badge-in 400ms 480ms ease-out both",
          }}
        >
          {t("unlock.discoverBtn")}
        </button>
      </article>
    </div>
  );
}
