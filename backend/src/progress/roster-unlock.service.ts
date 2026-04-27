import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Warrior } from '../warriors/schemas/warrior.schema';
import {
  ROSTER_INITIAL_UNLOCK_COUNT,
  ROSTER_PARTIDAS_POR_RIVAL_PARA_BONUS,
  WARRIOR_SLUGS_UNLOCK_ORDER,
} from '../config/game.constants';
import { GuestRoster } from './schemas/guest-roster.schema';
import { GuestWarriorProgress } from './schemas/guest-warrior-progress.schema';

export type RosterStateDto = {
  unlockedCount: number;
  totalInOrder: number;
  unlockedSlugs: string[];
  partidasBySlug: Record<string, number>;
  requisitoPartidas: number;
  faltanParaDesbloqueo: { slug: string; partidas: number; falta: number }[];
  puedeDesbloquear: boolean;
  siguienteSlug: string | null;
};

@Injectable()
export class RosterUnlockService {
  private readonly log = new Logger(RosterUnlockService.name);

  constructor(
    @InjectModel(GuestRoster.name) private readonly roster: Model<GuestRoster>,
    @InjectModel(Warrior.name) private readonly warrior: Model<Warrior>,
    @InjectModel(GuestWarriorProgress.name)
    private readonly progress: Model<GuestWarriorProgress>,
  ) {}

  async ensureRosterForGuest(guestId: string): Promise<GuestRoster> {
    const g = guestId.trim();
    if (!g) {
      throw new Error('guestId requerido');
    }

    // Intento 1: buscar el doc existente (caso más frecuente, evita calcular IDs).
    const existing = await this.roster.findOne({ guestId: g }).exec();
    if (existing) return existing;

    // Si no existe, calculamos los IDs iniciales y hacemos un upsert atómico.
    // findOneAndUpdate con upsert:true es una operación atómica en MongoDB y
    // evita la condición de carrera del patrón findOne → create que provocaba
    // el E11000 (duplicate key) cuando dos requests llegaban casi a la vez.
    const first = await this.firstWarriorObjectIds(ROSTER_INITIAL_UNLOCK_COUNT);
    if (first.length < ROSTER_INITIAL_UNLOCK_COUNT) {
      this.log.warn('Guerreros insuficientes en DB para roster inicial');
    }

    const doc = await this.roster
      .findOneAndUpdate(
        { guestId: g },
        { $setOnInsert: { guestId: g, unlockedWarriorIds: first } },
        { upsert: true, returnDocument: "after" },
      )
      .exec();

    // findOneAndUpdate con upsert devuelve null solo en versiones muy antiguas
    // del driver; con returnDocument: "after" devuelve el documento actualizado.
    if (!doc) {
      const retry = await this.roster.findOne({ guestId: g }).exec();
      if (!retry) throw new Error('No se pudo crear el roster para el guest');
      return retry;
    }
    return doc;
  }

  private async firstWarriorObjectIds(n: number): Promise<Types.ObjectId[]> {
    const out: Types.ObjectId[] = [];
    for (const slug of WARRIOR_SLUGS_UNLOCK_ORDER) {
      if (out.length >= n) break;
      const w = await this.warrior
        .findOne({ slug })
        .select('_id')
        .lean()
        .exec();
      if (w?._id) {
        out.push(w._id);
      }
    }
    return out;
  }

  async getRosterState(guestId: string): Promise<RosterStateDto> {
    const g = guestId.trim();
    const row = await this.ensureRosterForGuest(g);
    const unlocked = row.unlockedWarriorIds;
    const warriors = (await this.warrior
      .find({ _id: { $in: unlocked } })
      .select('slug _id')
      .lean()
      .exec()) as { _id: Types.ObjectId; slug: string }[];
    const idToSlug = new Map(
      warriors.map((w) => [String(w._id), w.slug] as const),
    );
    const unlockedSlugs = unlocked
      .map((id) => idToSlug.get(String(id)) ?? '??')
      .filter((s) => s !== '??');

    const progressDocs = await this.progress
      .find({ guestId: g, warriorId: { $in: unlocked } })
      .select('warriorId partidas')
      .lean()
      .exec();
    const partidasByWarriorId = new Map(
      progressDocs.map((d) => [String(d.warriorId), d.partidas ?? 0]),
    );

    const partidasBySlug: Record<string, number> = {};
    const faltan: { slug: string; partidas: number; falta: number }[] = [];
    for (const w of unlocked) {
      const slug = idToSlug.get(String(w)) ?? '??';
      if (slug === '??') continue;
      const p = partidasByWarriorId.get(String(w)) ?? 0;
      partidasBySlug[slug] = p;
      const need = ROSTER_PARTIDAS_POR_RIVAL_PARA_BONUS;
      if (p < need) {
        faltan.push({ slug, partidas: p, falta: need - p });
      }
    }

    const quedanBloqueados = WARRIOR_SLUGS_UNLOCK_ORDER.some(
      (s) => !unlockedSlugs.includes(s),
    );

    const puedeDesbloquear = faltan.length === 0 && quedanBloqueados;

    const siguienteSlug: string | null = puedeDesbloquear
      ? (WARRIOR_SLUGS_UNLOCK_ORDER.find((s) => !unlockedSlugs.includes(s)) ??
        null)
      : null;

    return {
      unlockedCount: unlocked.length,
      totalInOrder: WARRIOR_SLUGS_UNLOCK_ORDER.length,
      unlockedSlugs,
      partidasBySlug,
      requisitoPartidas: ROSTER_PARTIDAS_POR_RIVAL_PARA_BONUS,
      faltanParaDesbloqueo: faltan,
      puedeDesbloquear,
      siguienteSlug,
    };
  }

  /**
   * Si cada guerrero desbloqueado alcanzó 3+ partidas, añade el siguiente del orden fijo.
   */
  async tryUnlockNextIfEligible(guestId: string): Promise<{
    desbloqueado: boolean;
    slug?: string;
  }> {
    const g = guestId.trim();
    if (!g) return { desbloqueado: false };
    const st = await this.getRosterState(g);
    if (!st.puedeDesbloquear || !st.siguienteSlug) {
      return { desbloqueado: false };
    }
    const nextW = await this.warrior
      .findOne({ slug: st.siguienteSlug })
      .select('_id')
      .exec();
    if (!nextW?._id) return { desbloqueado: false };
    const r = await this.roster
      .findOneAndUpdate(
        { guestId: g },
        { $addToSet: { unlockedWarriorIds: nextW._id } },
        { returnDocument: "after" },
      )
      .exec();
    if (!r) return { desbloqueado: false };
    return { desbloqueado: true, slug: st.siguienteSlug };
  }

  async isWarriorUnlocked(
    guestId: string,
    warriorId: Types.ObjectId,
  ): Promise<boolean> {
    const row = await this.roster
      .findOne({ guestId: guestId.trim() })
      .select('unlockedWarriorIds')
      .lean()
      .exec();
    if (!row?.unlockedWarriorIds?.length) {
      return false;
    }
    const s = String(warriorId);
    return row.unlockedWarriorIds.some((x) => String(x) === s);
  }

  async assertUnlocked(
    guestId: string,
    warriorId: Types.ObjectId,
    guerreroNombre: string,
  ): Promise<void> {
    if (!(await this.isWarriorUnlocked(guestId, warriorId))) {
      throw new BadRequestException(
        `El guerrero ${guerreroNombre} aún no está desbloqueado (roster: mín. 4 iniciales; desbloquea más con 3+ partidas por básico).`,
      );
    }
  }
}
