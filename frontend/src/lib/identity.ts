import { GUEST_ID_KEY } from "./guest";

const ALIAS_KEY = "torneo-kiai-alias";

export interface PlayerSession {
  guestId: string;
  alias: string;
}

/** Read the active session from localStorage. Returns null if none. */
export function getSession(): PlayerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const guestId = window.localStorage.getItem(GUEST_ID_KEY);
    const alias = window.localStorage.getItem(ALIAS_KEY);
    if (guestId && alias) return { guestId, alias };
  } catch {
    /* localStorage blocked (strict private mode) */
  }
  return null;
}

/** Persist the session in localStorage. */
export function setSession(guestId: string, alias: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GUEST_ID_KEY, guestId);
    window.localStorage.setItem(ALIAS_KEY, alias);
  } catch {
    /* ignore */
  }
}

/** Clear the session (logout). */
export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(GUEST_ID_KEY);
    window.localStorage.removeItem(ALIAS_KEY);
  } catch {
    /* ignore */
  }
}

/** Active player alias, or null if no session. */
export function getAlias(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ALIAS_KEY);
  } catch {
    return null;
  }
}
