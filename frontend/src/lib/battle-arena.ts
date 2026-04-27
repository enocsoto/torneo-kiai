/**
 * Arena background per battle: random index persisted in sessionStorage
 * by battle id (each new match usually gets a different backdrop).
 */

export const BATTLE_ARENA_COUNT = 4;

const STORAGE_KEY_PREFIX = "torneo-kiai-arena-";

/** FNV-1a 32-bit fallback when sessionStorage is unavailable (e.g. SSR). */
export function fnv1aArenaIndex(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % BATTLE_ARENA_COUNT;
}

/**
 * Resolves 0..BATTLE_ARENA_COUNT-1: random the first time in this tab for
 * this id; then reuses the stored value.
 */
export function resolveBattleArenaIndex(battleId: string): number {
  if (typeof window === "undefined") {
    return fnv1aArenaIndex(battleId);
  }
  const key = `${STORAGE_KEY_PREFIX}${battleId}`;
  try {
    const raw = sessionStorage.getItem(key);
    if (raw !== null) {
      const n = Number.parseInt(raw, 10);
      if (!Number.isNaN(n) && n >= 0 && n < BATTLE_ARENA_COUNT) {
        return n;
      }
    }
    const picked = Math.floor(Math.random() * BATTLE_ARENA_COUNT);
    sessionStorage.setItem(key, String(picked));
    return picked;
  } catch {
    return fnv1aArenaIndex(battleId);
  }
}
