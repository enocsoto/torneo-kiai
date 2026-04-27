"use client";

import { useI18n } from "@/i18n/I18nContext";

interface BattleStatusBannersProps {
  onlineMode: boolean;
  mySide: "A" | "B" | null;
  hasGuestId: boolean;
  inputLocked: boolean;
  combatActive: boolean;
  error: string | null;
  throttleCooldown: number;
}

export function BattleStatusBanners({
  onlineMode,
  mySide,
  hasGuestId,
  inputLocked,
  combatActive,
  error,
  throttleCooldown,
}: BattleStatusBannersProps) {
  const { t } = useI18n();

  return (
    <>
      {onlineMode && mySide === null && hasGuestId ? (
        <p
          className="rounded-xl border border-[var(--status-warn-border)] bg-[var(--status-warn-bg)] px-4 py-3 text-sm text-[var(--status-warn-fg)]"
          role="status"
        >
          {t("battle.onlineNotPlayer")}
        </p>
      ) : null}

      {onlineMode && inputLocked && combatActive && mySide ? (
        <p
          className="rounded-xl border border-[var(--surface-inset-border)] bg-[var(--surface-inset)] px-4 py-2 text-center text-sm text-[var(--foreground-secondary)]"
          role="status"
        >
          {t("battle.onlineWaitRival")}
        </p>
      ) : null}

      {error ? (
        <div
          className="overflow-hidden rounded-xl border border-[var(--status-warn-border)] bg-[var(--status-warn-bg)] text-sm text-[var(--status-warn-fg)]"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3 px-4 py-3">
            {throttleCooldown > 0 ? (
              <>
                <span
                  className="mt-0.5 shrink-0 text-base leading-none"
                  aria-hidden
                >
                  ⏱
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{t("battle.throttleTitle")}</p>
                  <p className="mt-0.5 text-[var(--status-warn-fg)]/80">
                    {t("battle.throttleMsg")}{" "}
                    <span className="font-bold tabular-nums text-[var(--status-warn-amber)]">
                      {throttleCooldown}
                    </span>{" "}
                    {t("battle.throttleSuffix")}
                  </p>
                </div>
              </>
            ) : (
              <p className="flex-1">{error}</p>
            )}
          </div>
          {throttleCooldown > 0 ? (
            <div className="h-1 w-full bg-[var(--status-warn-border)]">
              <div
                className="h-full bg-[var(--status-warn-amber)] transition-[width] duration-1000 ease-linear"
                style={{ width: `${(throttleCooldown / 5) * 100}%` }}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
