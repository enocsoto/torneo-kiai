/** Normalize Next.js dynamic `[id]` (string | string[] | undefined). */
export function battleIdFromParams(
  param: string | string[] | undefined,
): string | null {
  if (param == null) return null;
  return Array.isArray(param) ? (param[0] ?? null) : param;
}
