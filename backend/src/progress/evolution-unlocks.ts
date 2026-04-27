export type EvolutionUnlockStep = {
  partidas: number;
  clave: string;
};

/**
 * Transformaciones por guerrero según partidas terminadas con ese personaje.
 * Se elige siempre el último tramo alcanzado; la siguiente batalla ya entra con
 * los multiplicadores de esa forma.
 */
export const EVOLUTION_UNLOCKS_BY_SLUG: Readonly<
  Record<string, readonly EvolutionUnlockStep[]>
> = {
  goku: [
    { partidas: 10, clave: 'kaioken' },
    { partidas: 20, clave: 'ssj' },
    { partidas: 35, clave: 'ssj3' },
    { partidas: 50, clave: 'ultra_instinct' },
  ],
  vegeta: [
    { partidas: 10, clave: 'ssj' },
    { partidas: 25, clave: 'ssj_blue' },
  ],
  gohan: [
    { partidas: 10, clave: 'ssj' },
    { partidas: 25, clave: 'ultimate_gohan' },
  ],
  piccolo: [{ partidas: 25, clave: 'orange_piccolo' }],
  freezer: [{ partidas: 20, clave: 'golden' }],
  trunks: [{ partidas: 10, clave: 'ssj' }],
  broly: [
    { partidas: 12, clave: 'great_ape_power' },
    { partidas: 28, clave: 'legendary_ssj' },
  ],
  bardock: [{ partidas: 12, clave: 'ssj' }],
  jiren: [{ partidas: 30, clave: 'ui_sign' }],
  gogeta: [{ partidas: 15, clave: 'ssj_blue' }],
  vegetto: [{ partidas: 15, clave: 'ssj_blue' }],
};

export function activeEvolutionClaveFor(
  slug: string,
  partidas: number,
): string | null {
  const steps = EVOLUTION_UNLOCKS_BY_SLUG[slug] ?? [];
  let active: string | null = null;
  for (const step of steps) {
    if (partidas >= step.partidas) active = step.clave;
  }
  return active;
}

export function unlockedEvolutionAt(
  slug: string,
  prevPartidas: number,
  nextPartidas: number,
): string | null {
  const steps = EVOLUTION_UNLOCKS_BY_SLUG[slug] ?? [];
  const step = steps.find(
    (s) => prevPartidas < s.partidas && nextPartidas >= s.partidas,
  );
  return step?.clave ?? null;
}
