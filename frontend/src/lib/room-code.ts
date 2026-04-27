/** Must match backend `ROOM_CODE_LEN`. */
export const ROOM_CODE_LEN = 6;

/** Alphanumeric only; trimmed to `ROOM_CODE_LEN`. */
export function normalizeRoomCodeInput(raw: string): string {
  return raw
    .replace(/[^0-9A-Z]/gi, "")
    .toUpperCase()
    .slice(0, ROOM_CODE_LEN);
}

/**
 * Accepts a pasted URL with `?code=` or a raw code string.
 */
export function parseRoomCodeFromPastedValue(raw: string): string {
  const fromQuery = /[?&]code=([A-Z0-9]+)/i.exec(raw);
  if (fromQuery?.[1]) {
    return normalizeRoomCodeInput(fromQuery[1]);
  }
  return normalizeRoomCodeInput(raw);
}
