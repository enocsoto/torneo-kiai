"use client";

import { useCallback, useMemo } from "react";
import { STATUS, type CallBackProps, type Step } from "react-joyride";
import { useI18n } from "@/i18n/I18nContext";
import { DynamicJoyride } from "@/components/oop/DynamicJoyride";
import { OopBubbleTooltip } from "@/components/oop/OopBubbleTooltip";
import { oopJoyrideStyles } from "@/components/oop/oop-joyride-styles";

type Props = {
  run: boolean;
  onClose: () => void;
};

export function BattleOopTour({ run, onClose }: Props) {
  const { t, locale } = useI18n();

  const steps = useMemo(
    (): Step[] => [
      {
        // Step 1 — Encapsulation: fighter panels (live attributes)
        target: "[data-ooptour=battle-fighters]",
        title: t("oop.battleStepFightersTitle"),
        content: t("oop.battle.fighters"),
        disableBeacon: true,
        placement: "bottom",
        spotlightPadding: 6,
      },
      {
        // Step 2 — Polymorphism: turn indicator
        target: "[data-ooptour=battle-turn]",
        title: t("oop.battleStepTurnTitle"),
        content: t("oop.battle.turn"),
        placement: "bottom",
        spotlightPadding: 6,
      },
      {
        // Step 3 — Methods: full action panel
        target: "[data-ooptour=battle-actions]",
        title: t("oop.battleStepActionsTitle"),
        content: t("oop.battle.actionsOop"),
        placement: "top",
        spotlightPadding: 6,
      },
      {
        // Step 4 — Call a method with an index: first attack button
        target: "[data-ooptour=battle-attack-first]",
        title: t("oop.battleStepAttackTitle"),
        content: t("oop.battle.attack"),
        placement: "top",
        spotlightPadding: 6,
      },
    ],
    [t],
  );

  const handle = useCallback(
    (data: CallBackProps) => {
      if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <DynamicJoyride
      key={locale}
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      scrollOffset={88}
      disableScrollParentFix
      callback={handle}
      tooltipComponent={OopBubbleTooltip}
      styles={oopJoyrideStyles}
      floaterProps={{
        disableAnimation:
          typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      }}
      locale={{
        back: t("oop.tourBack"),
        close: t("oop.tourLast"),
        last: t("oop.tourLast"),
        next: t("oop.tourNext"),
        nextLabelWithProgress: t("oop.tourNextWithProgress"),
        skip: t("oop.tourSkip"),
      }}
    />
  );
}
