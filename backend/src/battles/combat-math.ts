/** Daño neto tras defensa (sin esquiva). */
export function netDamageAfterDefense(
  rawDamage: number,
  defense: number,
): number {
  const d = Math.max(0, defense);
  return Math.max(0, rawDamage - d);
}
