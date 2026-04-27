import type { Styles } from "react-joyride";

/** Theme aligned with app CSS variables (light / dark). */
export const oopJoyrideStyles: Partial<Styles> = {
  options: {
    zIndex: 100_050,
    arrowColor: "var(--tooltip-bg, var(--surface-glass))",
    backgroundColor: "var(--tooltip-bg, var(--surface-glass))",
    textColor: "var(--tooltip-fg, var(--foreground))",
    primaryColor: "var(--accent)",
    overlayColor: "rgba(2, 6, 12, 0.72)",
  },
  beacon: {
    backgroundColor: "transparent",
    border: 0,
    height: 28,
    width: 28,
  },
  beaconInner: {
    backgroundColor: "var(--accent)",
    boxShadow: "0 0 0 3px rgba(249,115,22,0.25)",
    height: 14,
    width: 14,
  },
  beaconOuter: {
    animation: "oop-beacon-ping 1.6s cubic-bezier(0,0,0.2,1) infinite",
    backgroundColor: "var(--accent)",
    border: 0,
    boxShadow: "none",
    height: 28,
    opacity: 0.45,
    width: 28,
  },
  tooltip: {
    borderRadius: 14,
    padding: 20,
  },
  tooltipContent: {
    color: "var(--foreground)",
    fontSize: 14,
    lineHeight: 1.55,
  },
  tooltipTitle: {
    color: "var(--foreground)",
  },
  buttonNext: {
    backgroundColor: "var(--accent)",
    color: "var(--on-accent)",
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 8,
    padding: "8px 14px",
    outline: "none",
  },
  buttonBack: {
    color: "var(--foreground-secondary)",
    fontSize: 13,
  },
  buttonClose: {
    color: "var(--muted)",
  },
  buttonSkip: {
    color: "var(--muted)",
    fontSize: 12,
  },
  spotlight: {
    borderRadius: 12,
  },
};
