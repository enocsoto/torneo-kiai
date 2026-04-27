"use client";

import { useCallback, useMemo } from "react";
import { STATUS, type CallBackProps, type Step } from "react-joyride";
import { useI18n } from "@/i18n/I18nContext";
import { DynamicJoyride } from "@/components/oop/DynamicJoyride";
import { OopBubbleTooltip } from "@/components/oop/OopBubbleTooltip";
import { oopJoyrideStyles } from "@/components/oop/oop-joyride-styles";

type Props = {
  run: boolean;
  onClose: (status: "finished" | "skipped") => void;
  variant?: "full" | "pick" | "ready";
};

export function HomeOopTour({ run, onClose, variant = "full" }: Props) {
  const { t, locale } = useI18n();

  const steps = useMemo((): Step[] => {
    const startTarget =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches
        ? "[data-ooptour=home-start-battle-mobile]"
        : "[data-ooptour=home-start-battle]";

    if (variant === "pick") {
      const isNarrow =
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 767px)").matches;
      return [
        {
          target: "[data-ooptour=home-roster]",
          title: t("oop.stepPickTitle"),
          content: t("oop.home.pickPlayers"),
          disableBeacon: true,
          /** A la izquierda del bloque de roster: evita forzar scroll vertical. En móvil, arriba. */
          placement: isNarrow ? "top" : "left-start",
          floaterProps: isNarrow ? undefined : { disableFlip: true },
          spotlightClicks: true,
          spotlightPadding: 8,
          data: { waitForAction: true },
        },
      ];
    }

    if (variant === "ready") {
      return [
        {
          target: startTarget,
          title: t("oop.stepReadyTitle"),
          content: t("oop.home.ready"),
          disableBeacon: true,
          placement: "top",
          spotlightClicks: true,
          spotlightPadding: 10,
          data: { waitForAction: true },
        },
      ];
    }

    return [
      {
        // Step 1 — Centered welcome
        target: "body",
        title: t("oop.stepIntroTitle"),
        content: t("oop.home.intro"),
        disableBeacon: true,
        placement: "center",
      },
      {
        // Step 2 — Classes and instances (P1 / VS / P2 slots)
        target: "[data-ooptour=home-slots]",
        title: t("oop.stepSlotsTitle"),
        content: t("oop.home.slots"),
        placement: "bottom",
        spotlightPadding: 8,
      },
      {
        // Step 3 — Attributes, constructor, getters/setters (roster)
        target: "[data-ooptour=home-roster]",
        title: t("oop.stepRosterTitle"),
        content: t("oop.home.roster"),
        placement: "right",
        /** Evita que Popper lo reubique debajo del roster si hay poco margen vertical. */
        floaterProps: { disableFlip: true },
        spotlightPadding: 6,
      },
    ];
  }, [t, variant]);

  const handle = useCallback(
    (data: CallBackProps) => {
      if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
        onClose(data.status === STATUS.FINISHED ? "finished" : "skipped");
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
      scrollOffset={96}
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
