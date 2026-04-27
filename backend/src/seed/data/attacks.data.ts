export interface AttackSeedData {
  clave: string;
  nombre: string;
  daño: number;
  costoEnergia: number;
}

export const ATTACKS_SEED: AttackSeedData[] = [
  { clave: 'golpe_basico', nombre: 'Golpe', daño: 10, costoEnergia: 0 },
  { clave: 'kamehameha', nombre: 'Kamehameha', daño: 50, costoEnergia: 30 },
  { clave: 'final_flash', nombre: 'Final Flash', daño: 60, costoEnergia: 40 },
  { clave: 'makankosappo', nombre: 'Makankosappo', daño: 55, costoEnergia: 35 },
  { clave: 'death_beam', nombre: 'Death Beam', daño: 48, costoEnergia: 28 },
  { clave: 'masenko', nombre: 'Masenko', daño: 52, costoEnergia: 32 },
  { clave: 'kienzan', nombre: 'Kienzan', daño: 54, costoEnergia: 34 },
  { clave: 'tri_beam', nombre: 'Kikoho', daño: 58, costoEnergia: 38 },
  { clave: 'heat_dome', nombre: 'Heat Dome', daño: 57, costoEnergia: 37 },
  {
    clave: 'infinity_burst',
    nombre: 'Infinity Burst',
    daño: 51,
    costoEnergia: 31,
  },
  {
    clave: 'eraser_cannon',
    nombre: 'Eraser Cannon',
    daño: 63,
    costoEnergia: 42,
  },
  { clave: 'mouth_blast', nombre: 'Rayo Buu', daño: 49, costoEnergia: 29 },
  { clave: 'hakai_orb', nombre: 'Hakai', daño: 66, costoEnergia: 43 },
  {
    clave: 'bardock_cannon',
    nombre: 'Cañón final',
    daño: 59,
    costoEnergia: 39,
  },
];
