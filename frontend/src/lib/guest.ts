/** Shared key with `identity.ts` — single source of truth. */
export const GUEST_ID_KEY = "torneo-kiai-guest-id";

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/** Stable id for guest mode (battle rate limits in the API). */
export function getOrCreateGuestId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(GUEST_ID_KEY);
    if (!id) {
      id = randomId();
      window.localStorage.setItem(GUEST_ID_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}
