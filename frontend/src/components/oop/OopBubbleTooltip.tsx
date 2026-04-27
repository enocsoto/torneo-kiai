"use client";

import type { TooltipRenderProps } from "react-joyride";
import { useI18n } from "@/i18n/I18nContext";
import { OopBubbleTail, getTailSide } from "@/components/oop/OopBubbleTail";

/**
 * Custom chat-bubble style tooltip (WhatsApp-like) for the OOP tour.
 * The tail points at the spotlight target based on tooltip placement.
 */
export function OopBubbleTooltip({
  backProps,
  primaryProps,
  skipProps,
  step,
  index,
  size,
  isLastStep,
  tooltipProps,
}: TooltipRenderProps) {
  const { t } = useI18n();
  const tailSide = getTailSide(String(step.placement ?? "bottom"));
  const waitForAction = Boolean(
    (step.data as { waitForAction?: boolean } | undefined)?.waitForAction,
  );

  return (
    <div
      {...tooltipProps}
      style={{
        position: "relative",
        maxWidth: "min(340px, calc(100vw - 24px))",
        background: "var(--tooltip-bg)",
        border: "1px solid var(--tooltip-border)",
        borderRadius: 20,
        boxShadow: "0 12px 48px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.2)",
        overflow: "visible",
        fontFamily: "inherit",
      }}
    >
      <OopBubbleTail side={tailSide} />

      {/* Header: POO badge + title */}
      <div
        style={{
          padding: "14px 16px 10px",
          borderBottom: "1px solid var(--tooltip-border)",
        }}
      >
        {/* Badge + progress */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: "rgba(249,115,22,0.15)",
              border: "1px solid rgba(249,115,22,0.28)",
              borderRadius: 99,
              padding: "2px 9px 2px 6px",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.07em",
              color: "var(--accent-text)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--accent)",
              }}
            />
            POO
          </span>

          {/* Step indicator dots */}
          <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {Array.from({ length: size }).map((_, i) => (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  width: i === index ? 14 : 6,
                  height: 6,
                  borderRadius: 99,
                  background:
                    i === index
                      ? "var(--accent)"
                      : "rgba(249,115,22,0.22)",
                  transition: "width 0.25s ease",
                }}
              />
            ))}
          </span>
        </div>

        {/* Title */}
        {step.title ? (
          <h3
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 700,
              color: "var(--tooltip-fg)",
              lineHeight: 1.3,
            }}
          >
            {step.title as React.ReactNode}
          </h3>
        ) : null}
      </div>

      {/* Message body */}
      <div
        style={{
          padding: "12px 16px 14px",
          fontSize: 13,
          lineHeight: 1.68,
          color: "var(--tooltip-muted)",
        }}
      >
        {step.content as React.ReactNode}
      </div>

      {/* Footer with actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px 14px",
          gap: 6,
        }}
      >
        {/* Skip */}
        <button
          {...skipProps}
          style={{
            fontSize: 11,
            color: "var(--tooltip-muted)",
            background: "transparent",
            border: "none",
            padding: "4px 2px",
            cursor: "pointer",
            opacity: 0.7,
            fontFamily: "inherit",
          }}
        >
          {t("oop.tourSkip")}
        </button>

        {/* Back + Next / Done */}
        <div style={{ display: "flex", gap: 6 }}>
          {index > 0 ? (
            <button
              {...backProps}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--tooltip-muted)",
                background: "transparent",
                border: "1px solid var(--tooltip-border)",
                borderRadius: 12,
                padding: "6px 12px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {t("oop.tourBack")}
            </button>
          ) : null}

          {waitForAction ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                fontWeight: 700,
                color: "var(--accent-text)",
                padding: "6px 4px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  boxShadow: "0 0 12px rgba(249,115,22,0.65)",
                }}
              />
              {t("oop.tourWaitingAction")}
            </span>
          ) : (
            <button
              {...primaryProps}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--on-accent)",
                background: "var(--accent)",
                border: "none",
                borderRadius: 12,
                padding: "6px 16px",
                cursor: "pointer",
                letterSpacing: "0.01em",
                fontFamily: "inherit",
                boxShadow: "0 2px 8px rgba(249,115,22,0.35)",
              }}
            >
              {isLastStep ? t("oop.tourLast") : `${t("oop.tourNext")} →`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
