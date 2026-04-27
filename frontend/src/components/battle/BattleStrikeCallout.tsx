"use client";

import { useI18n } from "@/i18n/I18nContext";
import type { StrikeCallout } from "@/hooks/useBattle";

interface BattleStrikeCalloutProps {
  strikeCallout: StrikeCallout | null;
}

export function BattleStrikeCallout({
  strikeCallout,
}: BattleStrikeCalloutProps) {
  const { t } = useI18n();

  if (!strikeCallout) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6">
      <div
        key={strikeCallout.key}
        className="battle-strike-callout max-w-md rounded-2xl px-4 py-3 text-center text-sm shadow-lg backdrop-blur-sm sm:px-6"
        role="status"
        aria-live="polite"
      >
        {t("battle.strikeCallout", {
          from: strikeCallout.from,
          to: strikeCallout.to,
          attack: strikeCallout.attack,
        })}
      </div>
    </div>
  );
}
