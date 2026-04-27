"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  label: string;
  value: number;
  pct: number;
  color: string;
  suffix?: string;
  hitKey?: number;
  variant?: "hp" | "ki";
  /** Compact panel in the action HUD. */
  compact?: boolean;
};

export function BattleStatBar({
  label,
  value,
  pct,
  color,
  suffix = "",
  hitKey,
  variant = "ki",
  compact = false,
}: Props) {
  const safe = Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : 0;
  const scale = safe / 100;
  const [flash, setFlash] = useState(false);
  const prevHit = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (variant !== "hp" || hitKey === undefined) return;
    if (hitKey === prevHit.current) return;
    prevHit.current = hitKey;
    setFlash(true);
    const t = window.setTimeout(() => setFlash(false), 520);
    return () => window.clearTimeout(t);
  }, [hitKey, variant]);

  return (
    <div>
      <div
        className={`mb-0.5 flex justify-between tabular-nums text-[var(--muted)] ${compact ? "text-[10px] leading-tight" : "text-xs"}`}
      >
        <span
          className={`font-medium ${compact ? "uppercase tracking-wider text-[var(--muted)]" : ""}`}
        >
          {label}
        </span>
        <span
          className={`transition-colors duration-300 ${variant === "hp" && flash ? "font-semibold text-[var(--status-danger-bright)]" : compact ? "font-bold text-[var(--foreground)]" : ""}`}
        >
          {value}
          {suffix}
        </span>
      </div>
      <div
        className={`hp-bar-track relative overflow-hidden rounded-full ring-1 ring-[var(--border-subtle)] ${
          compact ? "h-1.5" : "h-2.5"
        }`}
      >
        <div
          className={`absolute inset-y-0 left-0 w-full origin-left rounded-full ${color} transition-[transform] duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${flash ? "hp-bar-hit" : ""} ${variant === "ki" && compact ? "bar-ki-bloom" : ""}`}
          style={{ transform: `scaleX(${scale})` }}
        />
        {variant === "hp" && safe > 0 && safe < 28 ? (
          <span className="pointer-events-none absolute inset-0 bg-red-500/15 motion-safe:animate-pulse" />
        ) : null}
      </div>
    </div>
  );
}
