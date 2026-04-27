import { HydratedDocument } from 'mongoose';
import { Attack } from '../../attacks/schemas/attack.schema';
import { Evolution } from '../../evolutions/schemas/evolution.schema';
import { WarriorSnapshot } from '../../battles/schemas/battle.schema';
import { Warrior } from '../../warriors/schemas/warrior.schema';

export function buildWarriorSnapshot(
  w: HydratedDocument<Warrior> & {
    ataques: Attack[];
    evolucionActiva?: Evolution | null;
  },
  bonusAttacks: Attack[] = [],
  activeEvolution?: Evolution | null,
): WarriorSnapshot {
  const evo = activeEvolution ?? w.evolucionActiva ?? undefined;
  const mD = evo?.multiplicadorDaño ?? 1;
  const mDef = evo?.multiplicadorDefensa ?? 1;
  const baseLista = (w.ataques ?? []) as unknown as Attack[];
  const clavesVistas = new Set(baseLista.map((a) => a.clave).filter(Boolean));
  const extras: Attack[] = [];
  for (const a of bonusAttacks) {
    if (a.clave && clavesVistas.has(a.clave)) continue;
    if (a.clave) clavesVistas.add(a.clave);
    extras.push(a);
  }
  const ataquesLista = [...baseLista, ...extras];
  const ataques = ataquesLista.map((a) => ({
    nombre: a.nombre,
    daño: Math.max(1, Math.round(a.daño * mD)),
    costoEnergia: a.costoEnergia,
  }));
  return {
    warriorId: w._id,
    slug: w.slug,
    nombre: w.nombre,
    imageUrl: w.imageUrl,
    salud: w.saludBase,
    saludMax: w.saludBase,
    ki: w.kiBase,
    kiMax: w.kiBase,
    defensa: Math.max(0, Math.round(w.defensa * mDef)),
    estado: evo?.nombre ?? w.estado,
    ataques,
    esquivaPendiente: false,
  };
}
