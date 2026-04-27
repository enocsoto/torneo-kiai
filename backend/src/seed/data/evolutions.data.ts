export interface EvolutionSeedData {
  clave: string;
  nombre: string;
  multiplicadorDaño: number;
  multiplicadorDefensa: number;
}

export const EVOLUTIONS_SEED: EvolutionSeedData[] = [
  {
    clave: 'kaioken',
    nombre: 'Kaioken',
    multiplicadorDaño: 1.18,
    multiplicadorDefensa: 1.0,
  },
  {
    clave: 'ssj',
    nombre: 'Super Saiyan',
    multiplicadorDaño: 1.35,
    multiplicadorDefensa: 1.15,
  },
  {
    clave: 'ssj3',
    nombre: 'Super Saiyan 3',
    multiplicadorDaño: 1.55,
    multiplicadorDefensa: 1.18,
  },
  {
    clave: 'ssj_blue',
    nombre: 'Super Saiyan Blue',
    multiplicadorDaño: 1.62,
    multiplicadorDefensa: 1.28,
  },
  {
    clave: 'ultra_instinct',
    nombre: 'Ultra Instinct',
    multiplicadorDaño: 1.72,
    multiplicadorDefensa: 1.38,
  },
  {
    clave: 'great_ape_power',
    nombre: 'Poder Ozaru',
    multiplicadorDaño: 1.28,
    multiplicadorDefensa: 1.16,
  },
  {
    clave: 'legendary_ssj',
    nombre: 'Super Saiyan Legendario',
    multiplicadorDaño: 1.68,
    multiplicadorDefensa: 1.24,
  },
  {
    clave: 'ultimate_gohan',
    nombre: 'Gohan Definitivo',
    multiplicadorDaño: 1.58,
    multiplicadorDefensa: 1.26,
  },
  {
    clave: 'orange_piccolo',
    nombre: 'Piccolo Orange',
    multiplicadorDaño: 1.5,
    multiplicadorDefensa: 1.35,
  },
  {
    clave: 'golden',
    nombre: 'Golden Form',
    multiplicadorDaño: 1.45,
    multiplicadorDefensa: 1.1,
  },
  {
    clave: 'ui_sign',
    nombre: 'Ultra Instinct (señal)',
    multiplicadorDaño: 1.42,
    multiplicadorDefensa: 1.22,
  },
];
