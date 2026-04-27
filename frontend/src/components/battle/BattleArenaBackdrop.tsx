"use client";

import { getCachedArenaIndex } from "./arena-index-cache";

type Props = {
  battleId: string;
  arenaShift: { x: number; y: number };
};

/**
 * Client-only: index uses sessionStorage + random (see lib/battle-arena).
 * Avoids hydrating a different backdrop than the client will show.
 */
export function BattleArenaBackdrop({ battleId, arenaShift }: Props) {
  const idx = getCachedArenaIndex(battleId);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className={`battle-field-layers battle-arena--${idx} battle-arena--motion`}
        style={{
          transform: `translate3d(${arenaShift.x}px, ${arenaShift.y}px, 0) scale(1.06)`,
        }}
      >
        <div className="battle-arena-sky" />
        <div className="battle-arena-vignette" />
        <div className="battle-arena-platform" />
      </div>
    </div>
  );
}
