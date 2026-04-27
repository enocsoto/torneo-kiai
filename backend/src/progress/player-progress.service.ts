import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { Attack } from '../attacks/schemas/attack.schema';
import { Evolution } from '../evolutions/schemas/evolution.schema';
import { Warrior } from '../warriors/schemas/warrior.schema';
import {
  activeEvolutionClaveFor,
  unlockedEvolutionAt,
} from './evolution-unlocks';
import { APRENDIZAJE_ATAQUES_CLAVE } from './pool';
import { GuestWarriorProgress } from './schemas/guest-warrior-progress.schema';

export type ProgresoVictoriaResult = {
  aprendioAtaque: boolean;
  nombreAtaque?: string;
  evolucionDesbloqueada?: boolean;
  nombreEvolucion?: string;
  evolucionWarriorId?: string;
  evolucionWarriorSlug?: string;
  evolucionWarriorNombre?: string;
};

@Injectable()
export class PlayerProgressService {
  constructor(
    @InjectModel(GuestWarriorProgress.name)
    private readonly progressModel: Model<GuestWarriorProgress>,
    @InjectModel(Attack.name) private readonly attackModel: Model<Attack>,
    @InjectModel(Evolution.name)
    private readonly evolutionModel: Model<Evolution>,
    @InjectModel(Warrior.name) private readonly warriorModel: Model<Warrior>,
  ) {}

  /** Suma 1 a partidas con ese guerrero (invitado) para progreso de roster. */
  async incrementarPartida(
    guestId: string | undefined,
    warriorIdStr: string | undefined,
  ): Promise<{
    evolucionDesbloqueada: boolean;
    nombreEvolucion?: string;
    warriorId?: string;
    warriorSlug?: string;
    warriorNombre?: string;
  }> {
    const g = guestId?.trim();
    if (!g || !warriorIdStr || !Types.ObjectId.isValid(warriorIdStr)) {
      return { evolucionDesbloqueada: false };
    }
    const wid = new Types.ObjectId(warriorIdStr);
    const w = await this.warriorModel
      .findById(wid)
      .select('slug nombre')
      .lean()
      .exec();
    if (!w?.slug) return { evolucionDesbloqueada: false };

    const prev = await this.progressModel
      .findOne({ guestId: g, warriorId: wid })
      .lean()
      .exec();
    const prevPartidas = prev?.partidas ?? 0;
    const updated = await this.progressModel
      .findOneAndUpdate(
        { guestId: g, warriorId: wid },
        { $inc: { partidas: 1 } },
        { upsert: true, returnDocument: "after" },
      )
      .lean()
      .exec();
    const partidas = updated?.partidas ?? prevPartidas + 1;
    const clave = unlockedEvolutionAt(w.slug, prevPartidas, partidas);
    if (!clave) return { evolucionDesbloqueada: false };

    const evo = await this.evolutionModel
      .findOne({ clave })
      .select('nombre')
      .lean()
      .exec();
    return {
      evolucionDesbloqueada: Boolean(evo?.nombre),
      nombreEvolucion: evo?.nombre,
      warriorId: String(wid),
      warriorSlug: w.slug,
      warriorNombre: w.nombre,
    };
  }

  async getEvolucionActivaParaCombate(
    guestId: string,
    warrior: HydratedDocument<Warrior>,
  ): Promise<Evolution | null> {
    return this.getEvolucionActiva(guestId, warrior._id, warrior.slug);
  }

  async getEvolucionActiva(
    guestId: string,
    warriorId: Types.ObjectId,
    slug: string,
  ): Promise<Evolution | null> {
    const g = guestId.trim();
    if (!g) return null;
    const doc = await this.progressModel
      .findOne({ guestId: g, warriorId })
      .lean()
      .exec();
    const clave = activeEvolutionClaveFor(slug, doc?.partidas ?? 0);
    if (!clave) return null;
    return this.evolutionModel.findOne({ clave }).lean().exec();
  }

  /** Ataques extra en combate según victorias acumuladas (j1 + invitado). */
  async getAtaquesBonusParaCombate(
    guestId: string,
    warrior: HydratedDocument<Warrior> & { ataques: Attack[] },
  ): Promise<Attack[]> {
    const g = guestId.trim();
    if (!g) return [];
    const wid = warrior._id;
    const doc = await this.progressModel
      .findOne({ guestId: g, warriorId: wid })
      .lean()
      .exec();
    const wins = doc?.wins ?? 0;
    return await this.resolveBonusAttacks(
      warrior,
      wins,
      doc?.bonusClavesElegidas,
    );
  }

  /**
   * Configuración de la pantalla de habilidades: victorias, pool y lo elegido
   * (o por defecto los primeros N aprendizables).
   */
  async getHabilidadesConfig(
    guestId: string,
    warriorIdStr: string,
  ): Promise<{
    guerreroNombre: string;
    wins: number;
    bonusSlots: number;
    pool: {
      clave: string;
      nombre: string;
      daño: number;
      costoEnergia: number;
    }[];
    selectedClaves: string[];
  }> {
    const g = guestId.trim();
    if (!g) {
      throw new BadRequestException('guestId requerido');
    }
    if (!Types.ObjectId.isValid(warriorIdStr)) {
      throw new BadRequestException('guerrero inválido');
    }
    const wid = new Types.ObjectId(warriorIdStr);
    const w = (await this.warriorModel
      .findById(wid)
      .populate({ path: 'ataques', model: Attack.name })
      .exec()) as (HydratedDocument<Warrior> & { ataques: Attack[] }) | null;
    if (!w) {
      throw new BadRequestException('Guerrero no encontrado');
    }
    const doc = await this.progressModel
      .findOne({ guestId: g, warriorId: wid })
      .lean()
      .exec();
    const wins = doc?.wins ?? 0;
    const learnable = await this.learnableOrderedResolved(w);
    const slotsPristine = Math.floor(wins / 3);
    const cap = Math.min(slotsPristine, learnable.length);
    /** Solo técnicas ya desbloqueadas por victorias (cada ranura = una en orden). */
    const unlockedLearnable = learnable.slice(0, cap);
    const pool = unlockedLearnable.map((a) => ({
      clave: a.clave,
      nombre: a.nombre,
      daño: a.daño,
      costoEnergia: a.costoEnergia,
    }));
    const defaultClaves = unlockedLearnable.map((a) => a.clave).filter(Boolean);
    const stored = doc?.bonusClavesElegidas;
    let selected = defaultClaves;
    if (
      Array.isArray(stored) &&
      stored.length === cap &&
      this.bonusClavesValidasEnPool(stored, unlockedLearnable) &&
      cap > 0
    ) {
      selected = stored;
    }
    return {
      guerreroNombre: w.nombre,
      wins,
      bonusSlots: cap,
      pool,
      selectedClaves: cap > 0 ? selected : [],
    };
  }

  /** Guarda la elección de técnicas extra (una por cada 3 victorias). */
  async setBonusClavesElegidas(
    guestId: string,
    warriorIdStr: string,
    claves: string[],
  ): Promise<{ ok: true; selectedClaves: string[] }> {
    const g = guestId.trim();
    if (!g) {
      throw new BadRequestException('guestId requerido');
    }
    if (!Types.ObjectId.isValid(warriorIdStr)) {
      throw new BadRequestException('guerrero inválido');
    }
    if (!Array.isArray(claves)) {
      throw new BadRequestException('claves debe ser un array');
    }
    const wid = new Types.ObjectId(warriorIdStr);
    const w = (await this.warriorModel
      .findById(wid)
      .populate({ path: 'ataques', model: Attack.name })
      .exec()) as (HydratedDocument<Warrior> & { ataques: Attack[] }) | null;
    if (!w) {
      throw new BadRequestException('Guerrero no encontrado');
    }
    const doc = await this.progressModel
      .findOne({ guestId: g, warriorId: wid })
      .lean()
      .exec();
    const wins = doc?.wins ?? 0;
    const learnable = await this.learnableOrderedResolved(w);
    const slotsPristine = Math.floor(wins / 3);
    const cap = Math.min(slotsPristine, learnable.length);
    const unlockedLearnable = learnable.slice(0, cap);
    if (cap === 0) {
      throw new BadRequestException(
        'Hace falta al menos 3 victorias con este guerrero (jugador 1) para elegir técnicas extra',
      );
    }
    if (claves.length !== cap) {
      throw new BadRequestException(
        `Debes enviar exactamente ${cap} técnicas (tienes ${cap} ranuras).`,
      );
    }
    if (!this.bonusClavesValidasEnPool(claves, unlockedLearnable)) {
      throw new BadRequestException(
        'Cada clave debe pertenecer al pool, sin duplicados',
      );
    }
    if (!doc) {
      throw new BadRequestException(
        'Aún no hay progreso con este guerrero; gana al menos 3 partidas (jugador 1, sin modo sofá).',
      );
    }
    const r = await this.progressModel
      .updateOne(
        { guestId: g, warriorId: wid },
        { $set: { bonusClavesElegidas: claves } },
      )
      .exec();
    if (r.matchedCount === 0) {
      throw new BadRequestException('No se pudo actualizar el progreso');
    }
    return { ok: true, selectedClaves: claves };
  }

  /**
   * Tras una victoria del guerrero del jugador 1: +1 victoria; si cruza un múltiplo de 3, notifica el ataque recién disponible.
   */
  async registrarVictoriaJugador1(
    guestId: string,
    warriorIdStr: string,
  ): Promise<ProgresoVictoriaResult> {
    const g = guestId.trim();
    if (!g || !Types.ObjectId.isValid(warriorIdStr)) {
      return { aprendioAtaque: false };
    }
    const wid = new Types.ObjectId(warriorIdStr);
    const w = (await this.warriorModel
      .findById(wid)
      .populate({ path: 'ataques', model: Attack.name })
      .exec()) as (HydratedDocument<Warrior> & { ataques: Attack[] }) | null;
    if (!w) return { aprendioAtaque: false };

    const prev = await this.progressModel
      .findOne({ guestId: g, warriorId: wid })
      .lean()
      .exec();
    const prevWins = prev?.wins ?? 0;
    const updated = await this.progressModel
      .findOneAndUpdate(
        { guestId: g, warriorId: wid },
        { $inc: { wins: 1 } },
        { upsert: true, returnDocument: "after" },
      )
      .lean()
      .exec();
    const wins = updated?.wins ?? prevWins + 1;
    const beforeSlots = Math.floor(prevWins / 3);
    const afterSlots = Math.floor(wins / 3);
    if (afterSlots <= beforeSlots) {
      return { aprendioAtaque: false };
    }
    const learnable = await this.learnableOrderedResolved(w);
    const nombre = learnable[afterSlots - 1]?.nombre;
    if (!nombre) {
      return { aprendioAtaque: false };
    }
    return { aprendioAtaque: true, nombreAtaque: nombre };
  }

  /**
   * Lista de técnicas que aún no están en el kit del guerrero, en orden de aprendizaje.
   * Carga desde BD las que falten en el documento poblado.
   */
  async learnableOrderedResolved(
    warrior: HydratedDocument<Warrior> & { ataques: Attack[] },
  ): Promise<Attack[]> {
    const atks = (warrior.ataques ?? []) as unknown as Attack[];
    const owned = new Set(atks.map((a) => a.clave).filter(Boolean));
    const needed = APRENDIZAJE_ATAQUES_CLAVE.filter((c) => !owned.has(c));
    if (needed.length === 0) return [];
    const fromDb = await this.attackModel
      .find({ clave: { $in: needed } })
      .lean()
      .exec();
    const byClave = new Map(fromDb.map((a) => [a.clave, a] as const));
    const out: Attack[] = [];
    for (const clave of APRENDIZAJE_ATAQUES_CLAVE) {
      if (owned.has(clave)) continue;
      const a = byClave.get(clave);
      if (a) out.push(a);
    }
    return out;
  }

  private async resolveBonusAttacks(
    warrior: HydratedDocument<Warrior> & { ataques: Attack[] },
    wins: number,
    storedClaves: string[] | undefined,
  ): Promise<Attack[]> {
    const slots = Math.floor(wins / 3);
    if (slots <= 0) return [];
    const learnable = await this.learnableOrderedResolved(warrior);
    if (learnable.length === 0) return [];
    const cap = Math.min(slots, learnable.length);
    const unlockedLearnable = learnable.slice(0, cap);
    const byClave = new Map(
      unlockedLearnable
        .filter((a) => a.clave)
        .map((a) => [a.clave, a] as const),
    );
    const defaultClaves = unlockedLearnable.map((a) => a.clave).filter(Boolean);
    let chosen: string[] = defaultClaves;
    if (
      Array.isArray(storedClaves) &&
      storedClaves.length === cap &&
      this.bonusClavesValidasEnPool(storedClaves, unlockedLearnable) &&
      cap > 0
    ) {
      chosen = storedClaves;
    }
    const out: Attack[] = [];
    for (const c of chosen) {
      const a = byClave.get(c);
      if (a) out.push(a);
    }
    return out;
  }

  private bonusClavesValidasEnPool(
    claves: string[],
    learnable: Attack[],
  ): boolean {
    if (claves.length === 0) return false;
    const pool = new Set(learnable.map((a) => a.clave).filter(Boolean));
    if (new Set(claves).size !== claves.length) {
      return false;
    }
    return claves.every((c) => c && pool.has(c));
  }
}
