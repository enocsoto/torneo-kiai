"use client";

type TailSide = "top" | "bottom" | "left" | "right" | "none";

export function getTailSide(placement: string): TailSide {
  if (placement.startsWith("bottom")) return "top"; // bubble below → tail on TOP edge
  if (placement.startsWith("top")) return "bottom"; // bubble above → tail on BOTTOM edge
  if (placement.startsWith("left")) return "right"; // bubble on the left → tail on RIGHT
  if (placement.startsWith("right")) return "left"; // bubble on the right → tail on LEFT
  return "none";
}

/**
 * Small 45° square acting as a chat “tail”.
 * z-index: -1 keeps the inner half covered by the bubble background.
 */
export function OopBubbleTail({ side }: { side: TailSide }) {
  if (side === "none") return null;

  const base: React.CSSProperties = {
    position: "absolute",
    pointerEvents: "none",
    width: 16,
    height: 16,
    background: "var(--tooltip-bg)",
    border: "1px solid var(--tooltip-border)",
    transform: "rotate(45deg)",
    zIndex: -1,
  };

  const positions: Record<Exclude<TailSide, "none">, React.CSSProperties> = {
    top: { top: -8, left: 24 },
    bottom: { bottom: -8, left: 24 },
    left: { left: -8, top: 22 },
    right: { right: -8, top: 22 },
  };

  return <div style={{ ...base, ...positions[side as Exclude<TailSide, "none">] }} />;
}
