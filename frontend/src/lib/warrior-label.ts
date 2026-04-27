import type { Warrior } from "./types";

/**
 * Display name: catalog `nombre` when present; otherwise a readable slug (no forced title case).
 */
export function warriorDisplayName(
  slug: string,
  warriors: Warrior[] | null | undefined,
): string {
  const w = warriors?.find((x) => x.slug === slug);
  if (w?.nombre) return w.nombre;
  return slug.replace(/_/g, " ");
}
