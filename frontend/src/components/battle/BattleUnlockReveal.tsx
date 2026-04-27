"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { WarriorPortrait } from "@/components/WarriorPortrait";
import { useI18n } from "@/i18n/I18nContext";
import { focusRing } from "@/lib/ui";

export type AttackUnlockPayload = {
  kind?: "attack" | "evolution";
  attackName: string;
  attackDamage?: number;
  attackKi?: number;
  warriorName: string;
  warriorSlug: string;
  /** Mongo warrior `_id`; link to /skills?warrior= */
  warriorId: string;
  warriorImageUrl?: string;
};

type Props = AttackUnlockPayload & {
  onClose: () => void;
};

const AUTO_CLOSE_MS = 7000;

/**
 * Centered “epic” overlay when a warrior learns a new combat technique.
 * Replaces the generic toast.
 */
export function BattleUnlockReveal({
  kind = "attack",
  attackName,
  attackDamage,
  attackKi,
  warriorName,
  warriorSlug,
  warriorId,
  warriorImageUrl,
  onClose,
}: Props) {
  const { t } = useI18n();
  const isEvolution = kind === "evolution";
  const [progress, setProgress] = useState(100);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / AUTO_CLOSE_MS) * 100);
      setProgress(pct);
      if (pct > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onClose();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={
        isEvolution ? t("unlock.newEvolution") : t("unlock.newTechnique")
      }
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[var(--scrim)] p-4 backdrop-blur-[10px]"
      onClick={onClose}
    >
      {/* Radial glow (usa tokens; compatible claro/oscuro sin prefijo `dark:`) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_50%,color-mix(in_srgb,var(--accent)_16%,transparent),transparent_68%)]"
      />

      <article
        className="relative flex max-w-[min(420px,calc(100vw-24px))] w-full flex-col items-center gap-5 rounded-3xl border border-[var(--status-warn-border)] bg-[var(--surface)] p-7 text-[var(--foreground)] shadow-[var(--shadow-card)] sm:p-10"
        style={{
          animation:
            "unlock-reveal-in 360ms cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Badge: new technique / evolution (copy from i18n) */}
        <div
          className="rounded-full border border-[var(--status-warn-border)] bg-[var(--status-warn-bg)] px-4 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--status-warn-fg)]"
          style={{ animation: "unlock-badge-in 380ms 80ms ease-out both" }}
        >
          {isEvolution ? t("unlock.newEvolution") : t("unlock.newTechnique")}
        </div>

        {/* Warrior portrait with glow */}
        <div
          className="relative"
          style={{ animation: "unlock-badge-in 380ms 180ms ease-out both" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-[-10px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent)_24%,transparent),transparent_70%)]"
            style={{ animation: "unlock-glow-pulse 2.2s ease-in-out infinite" }}
          />
          <WarriorPortrait
            slug={warriorSlug}
            imageUrl={warriorImageUrl}
            nombre={warriorName}
            className="relative z-[1] h-36 w-28"
          />
        </div>

        {/* “X learned / evolved” line */}
        <p
          className="text-center text-sm text-[var(--muted)]"
          style={{ animation: "unlock-badge-in 380ms 260ms ease-out both" }}
        >
          <span className="font-semibold text-[var(--foreground-secondary)]">
            {warriorName}
          </span>{" "}
          {isEvolution ? t("unlock.evolved") : t("unlock.learned")}
        </p>

        {/* Attack name with gradient */}
        <div
          className="text-center"
          style={{ animation: "unlock-badge-in 380ms 340ms ease-out both" }}
        >
          <h2
            className="text-3xl font-black tracking-tight sm:text-4xl"
            style={{
              background:
                "linear-gradient(135deg, #fef3c7 0%, #fb923c 42%, var(--accent) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1.15,
            }}
          >
            {attackName}
          </h2>

          {/* Attack stats */}
          {!isEvolution &&
            (attackDamage !== undefined || attackKi !== undefined) && (
              <p className="mt-2.5 text-sm tabular-nums text-[var(--muted)]">
                {attackDamage !== undefined && (
                  <span>
                    {t("unlock.damage")}{" "}
                    <span className="font-bold text-[var(--foreground-secondary)]">
                      {attackDamage}
                    </span>
                  </span>
                )}
                {attackDamage !== undefined && attackKi !== undefined && (
                  <span className="mx-2 opacity-40">·</span>
                )}
                {attackKi !== undefined && (
                  <span>
                    Ki{" "}
                    <span className="font-bold text-[var(--accent-cool)]">
                      {attackKi}
                    </span>
                  </span>
                )}
              </p>
            )}
        </div>

        {/* Continue CTA + auto-close progress bar */}
        <div
          className="w-full space-y-3"
          style={{ animation: "unlock-badge-in 380ms 440ms ease-out both" }}
        >
          {warriorId ? (
            <Link
              href={`/skills?warrior=${encodeURIComponent(warriorId)}`}
              className={`flex w-full items-center justify-center rounded-xl border border-[var(--accent)]/45 bg-[var(--accent)]/10 py-3 text-sm font-semibold text-[var(--accent-text)] transition-[background-color,opacity] hover:bg-[var(--accent)]/18 ${focusRing}`}
            >
              {isEvolution ? t("unlock.goToRoster") : t("unlock.goToSkills")}
            </Link>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl py-3 text-sm font-bold transition-opacity hover:opacity-90"
            style={{
              background: "var(--accent)",
              color: "var(--on-accent)",
              border: "none",
              boxShadow: "0 4px 16px rgba(249,115,22,0.35)",
            }}
          >
            {t("unlock.continueBtn")}
          </button>
          <div className="h-[3px] overflow-hidden rounded-full bg-[var(--bar-track)]">
            <div
              className="h-full rounded-full bg-[var(--accent)]"
              style={{
                width: `${progress}%`,
                opacity: 0.55,
                transition: "width 100ms linear",
              }}
            />
          </div>
        </div>
      </article>
    </div>
  );
}
