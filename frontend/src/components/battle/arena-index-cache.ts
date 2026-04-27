import { resolveBattleArenaIndex } from "@/lib/battle-arena";

const memo = new Map<string, number>();

/** Arena index per battle; memoized in memory for the app lifetime. */
export function getCachedArenaIndex(battleId: string): number {
  const hit = memo.get(battleId);
  if (hit !== undefined) return hit;
  const v = resolveBattleArenaIndex(battleId);
  memo.set(battleId, v);
  return v;
}
