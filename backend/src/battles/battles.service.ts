import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { Attack } from '../attacks/schemas/attack.schema';
import { Evolution } from '../evolutions/schemas/evolution.schema';
import {
  BATTLE_DODGE_CHANCE,
  BATTLE_GUEST_MAX_PER_HOUR_CAP,
  BATTLE_GUEST_MAX_PER_HOUR_DEFAULT,
  BATTLE_RECHARGE_KI,
} from '../config/game.constants';
import { PlayerProgressService } from '../progress/player-progress.service';
import { RosterUnlockService } from '../progress/roster-unlock.service';
import { Warrior } from '../warriors/schemas/warrior.schema';
import { buildWarriorSnapshot } from '../common/utils/battle-snapshot.util';
import { BattleOutcomeService } from './battle-outcome.service';
import { netDamageAfterDefense } from './combat-math';
import { BattleActionDto, BattleActionType } from './dto/battle-action.dto';
import { CreateBattleDto } from './dto/create-battle.dto';
import { Battle, WarriorSnapshot } from './schemas/battle.schema';

function etiquetaJugador(side: 'A' | 'B'): '1' | '2' {
  return side === 'A' ? '1' : '2';
}

@Injectable()
export class BattlesService {
  constructor(
    @InjectModel(Battle.name) private readonly battleModel: Model<Battle>,
    @InjectModel(Warrior.name) private readonly warriorModel: Model<Warrior>,
    private readonly config: ConfigService,
    private readonly playerProgress: PlayerProgressService,
    private readonly rosterUnlock: RosterUnlockService,
    private readonly battleOutcome: BattleOutcomeService,
  ) {}

  async create(dto: CreateBattleDto) {
    const guestId = dto.guestId?.trim();
    if (guestId) {
      await this.assertGuestRateLimit(guestId);
    }
    const [a, b] = await Promise.all([
      this.loadWarrior(dto.warriorAId),
      this.loadWarrior(dto.warriorBId),
    ]);
    if (guestId) {
      await this.rosterUnlock.ensureRosterForGuest(guestId);
      await this.rosterUnlock.assertUnlocked(guestId, a._id, a.nombre);
    }
    const modo = dto.modo ?? 'local';
    const guestJ2 = dto.guestJugador2?.trim();
    if (guestJ2) {
      await this.rosterUnlock.ensureRosterForGuest(guestJ2);
      await this.rosterUnlock.assertUnlocked(guestJ2, b._id, b.nombre);
    }
    const conProgresoJ1 = Boolean(guestId) && dto.progresoJugador1 !== false;
    const conProgresoJ2 =
      Boolean(guestJ2) && dto.progresoJugador2 !== false && modo === 'online';

    const [bonusA, bonusB, evolutionA, evolutionB] = await Promise.all([
      conProgresoJ1 && guestId
        ? this.playerProgress.getAtaquesBonusParaCombate(guestId, a)
        : Promise.resolve([] as Attack[]),
      conProgresoJ2 && guestJ2
        ? this.playerProgress.getAtaquesBonusParaCombate(guestJ2, b)
        : Promise.resolve([] as Attack[]),
      conProgresoJ1 && guestId
        ? this.playerProgress.getEvolucionActivaParaCombate(guestId, a)
        : Promise.resolve(null),
      conProgresoJ2 && guestJ2
        ? this.playerProgress.getEvolucionActivaParaCombate(guestJ2, b)
        : Promise.resolve(null),
    ]);

    const battle = await this.battleModel.create({
      warriorA: buildWarriorSnapshot(a, bonusA, evolutionA),
      warriorB: buildWarriorSnapshot(b, bonusB, evolutionB),
      activeSide: 'A',
      status: 'active',
      guestId: guestId || undefined,
      guestJugador2: guestJ2 || undefined,
      modo,
      roomCode: dto.roomCode,
      conProgresoJ1,
      conProgresoJ2,
      log: [
        `Combate iniciado: ${a.nombre} (jugador 1) vs ${b.nombre} (jugador 2). Turno del jugador 1.${modo === 'online' ? ' [En línea]' : ''}`,
      ],
    });
    return battle;
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Batalla no encontrada');
    }
    const battle = await this.battleModel.findById(id).exec();
    if (!battle) throw new NotFoundException('Batalla no encontrada');
    return battle;
  }

  async listRecent(limit = 10, skip = 0) {
    const capped = Math.min(50, Math.max(1, limit));
    const skipped = Math.max(0, skip);
    const rows = await this.battleModel
      .find()
      .sort({ updatedAt: -1 })
      .skip(skipped)
      .limit(capped)
      .select(
        'status winnerSide warriorA.nombre warriorB.nombre createdAt updatedAt',
      )
      .lean()
      .exec();
    return rows.map((r) => {
      const doc = r as Battle & {
        _id: Types.ObjectId;
        createdAt?: Date;
        updatedAt?: Date;
      };
      return {
        id: String(doc._id),
        status: doc.status,
        winnerSide: doc.winnerSide ?? null,
        jugador1: doc.warriorA?.nombre,
        jugador2: doc.warriorB?.nombre,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    });
  }

  async applyAction(
    id: string,
    dto: BattleActionDto,
  ): Promise<
    Record<string, unknown> & {
      progresoEvento?: {
        aprendioAtaque: boolean;
        nombreAtaque?: string;
        evolucionDesbloqueada?: boolean;
        nombreEvolucion?: string;
        evolucionWarriorId?: string;
        evolucionWarriorSlug?: string;
        evolucionWarriorNombre?: string;
      };
    }
  > {
    const battle = await this.findById(id);
    if (battle.status === 'finished') {
      throw new BadRequestException('La batalla ya terminó');
    }
    if (battle.warriorA.salud <= 0 || battle.warriorB.salud <= 0) {
      battle.status = 'finished';
      if (!battle.winnerSide) {
        battle.winnerSide = battle.warriorA.salud <= 0 ? 'B' : 'A';
      }
      battle.markModified('warriorA');
      battle.markModified('warriorB');
      await battle.save();
      throw new BadRequestException('La batalla ya terminó');
    }

    const actor = battle.activeSide === 'A' ? battle.warriorA : battle.warriorB;
    const target =
      battle.activeSide === 'A' ? battle.warriorB : battle.warriorA;
    const actorLabel = battle.activeSide;
    this.assertActionOwner(battle, dto.guestId);

    switch (dto.type) {
      case BattleActionType.ATTACK:
        this.handleAttack(battle, actor, target, dto.attackIndex, actorLabel);
        break;
      case BattleActionType.RECHARGE:
        this.handleRecharge(battle, actor, actorLabel);
        break;
      case BattleActionType.DODGE:
        this.handleDodge(battle, actor, actorLabel);
        break;
      default:
        throw new BadRequestException('Acción no soportada');
    }

    if (battle.status === 'active') {
      battle.activeSide = battle.activeSide === 'A' ? 'B' : 'A';
      battle.log.push(
        `Turno del jugador ${etiquetaJugador(battle.activeSide)}.`,
      );
    }

    const finishedThisRound =
      (battle as Battle & { status: 'active' | 'finished' }).status ===
      'finished';

    battle.markModified('warriorA');
    battle.markModified('warriorB');
    await battle.save();

    let progresoEvento:
      | {
          aprendioAtaque: boolean;
          nombreAtaque?: string;
          evolucionDesbloqueada?: boolean;
          nombreEvolucion?: string;
          evolucionWarriorId?: string;
          evolucionWarriorSlug?: string;
          evolucionWarriorNombre?: string;
        }
      | undefined;
    if (finishedThisRound) {
      progresoEvento = await this.battleOutcome.processFinished(battle);
    }

    const plain = battle.toObject() as unknown as Record<string, unknown>;
    if (progresoEvento) {
      plain.progresoEvento = progresoEvento;
    }

    this.battleOutcome.notifyIfOnline(battle, plain);

    return plain;
  }

  private async assertGuestRateLimit(guestId: string): Promise<void> {
    const raw = this.config.get<string>('GUEST_MAX_BATTLES_PER_HOUR');
    const cap = Math.min(
      BATTLE_GUEST_MAX_PER_HOUR_CAP,
      Math.max(
        1,
        parseInt(raw ?? String(BATTLE_GUEST_MAX_PER_HOUR_DEFAULT), 10) ||
          BATTLE_GUEST_MAX_PER_HOUR_DEFAULT,
      ),
    );
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const n = await this.battleModel.countDocuments({
      guestId,
      createdAt: { $gt: since },
    });
    if (n >= cap) {
      throw new BadRequestException(
        'Límite de batallas (modo invitado) alcanzado. Prueba en una hora.',
      );
    }
  }

  private assertActionOwner(battle: Battle, guestId?: string): void {
    if (battle.modo !== 'online') {
      return;
    }

    const caller = guestId?.trim();
    const expected =
      battle.activeSide === 'A' ? battle.guestId : battle.guestJugador2;

    if (!caller || !expected || caller !== expected) {
      throw new ForbiddenException('No podés actuar en este turno');
    }
  }

  private async loadWarrior(id: string): Promise<
    HydratedDocument<Warrior> & {
      ataques: Attack[];
      evolucionActiva?: Evolution | null;
    }
  > {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Guerrero no encontrado');
    }
    const w = await this.warriorModel
      .findById(id)
      .populate({ path: 'ataques', model: Attack.name })
      .populate({ path: 'evolucionActiva', model: Evolution.name })
      .exec();
    if (!w) throw new NotFoundException('Guerrero no encontrado');
    return w as HydratedDocument<Warrior> & {
      ataques: Attack[];
      evolucionActiva?: Evolution | null;
    };
  }

  private handleAttack(
    battle: Battle,
    actor: WarriorSnapshot,
    target: WarriorSnapshot,
    attackIndex: number | undefined,
    actorLabel: 'A' | 'B',
  ) {
    if (attackIndex === undefined || Number.isNaN(attackIndex)) {
      throw new BadRequestException('attackIndex es obligatorio para ATTACK');
    }
    const atq = actor.ataques[attackIndex];
    if (!atq) {
      throw new BadRequestException('Índice de ataque inválido');
    }
    if (actor.ki < atq.costoEnergia) {
      throw new BadRequestException(
        `${actor.nombre} no tiene Ki suficiente para ${atq.nombre}`,
      );
    }
    actor.ki -= atq.costoEnergia;
    battle.log.push(
      `${actor.nombre} (jugador ${etiquetaJugador(actorLabel)}) usa ${atq.nombre}.`,
    );
    this.applyDamage(target, atq.daño, battle.log);
    this.finishIfDead(battle, target, actorLabel);
  }

  private handleRecharge(
    battle: Battle,
    actor: WarriorSnapshot,
    actorLabel: 'A' | 'B',
  ) {
    const before = actor.ki;
    actor.ki = Math.min(actor.ki + BATTLE_RECHARGE_KI, actor.kiMax);
    battle.log.push(
      `${actor.nombre} (jugador ${etiquetaJugador(actorLabel)}) recarga Ki (${before} → ${actor.ki}).`,
    );
  }

  private handleDodge(
    battle: Battle,
    actor: WarriorSnapshot,
    actorLabel: 'A' | 'B',
  ) {
    actor.esquivaPendiente = true;
    battle.log.push(
      `${actor.nombre} (jugador ${etiquetaJugador(actorLabel)}) se prepara para esquivar el próximo golpe.`,
    );
  }

  private applyDamage(
    target: WarriorSnapshot,
    cantidad: number,
    log: string[],
  ): number {
    if (target.esquivaPendiente) {
      target.esquivaPendiente = false;
      if (Math.random() < BATTLE_DODGE_CHANCE) {
        log.push(`¡${target.nombre} esquivó el ataque!`);
        return 0;
      }
      log.push(`${target.nombre} falló el esquive.`);
    }
    const final = netDamageAfterDefense(cantidad, target.defensa);
    target.salud = Math.max(0, target.salud - final);
    log.push(
      `${target.nombre} recibió ${final} de daño. Salud restante: ${target.salud}.`,
    );
    return final;
  }

  private finishIfDead(
    battle: Battle,
    target: WarriorSnapshot,
    lastActorLabel: 'A' | 'B',
  ) {
    if (target.salud > 0) return;
    battle.status = 'finished';
    battle.winnerSide = lastActorLabel;
    const winner =
      battle.winnerSide === 'A' ? battle.warriorA : battle.warriorB;
    battle.log.push(
      `¡${winner.nombre} (jugador ${etiquetaJugador(battle.winnerSide)}) gana!`,
    );
  }

  /**
   * Victorias por guerrero solo para este `guestId`, alineado con
   * `BattleOutcomeService.recordVictoryProgress` (J1 con progreso; J2 en línea con progreso).
   */
  async personalWarriorWins(guestIdRaw: string, limit = 20) {
    const g = guestIdRaw?.trim();
    if (!g) {
      throw new BadRequestException('guestId requerido');
    }
    const capped = Math.min(50, Math.max(1, limit));
    return this.battleModel
      .aggregate<{ slug: string; wins: number }>([
        {
          $match: {
            status: 'finished',
            winnerSide: { $in: ['A', 'B'] },
            $or: [
              {
                guestId: g,
                winnerSide: 'A',
                conProgresoJ1: true,
              },
              {
                guestJugador2: g,
                winnerSide: 'B',
                conProgresoJ2: true,
              },
            ],
          },
        },
        {
          $project: {
            slug: {
              $cond: {
                if: { $eq: ['$winnerSide', 'A'] },
                then: '$warriorA.slug',
                else: '$warriorB.slug',
              },
            },
          },
        },
        { $group: { _id: '$slug', wins: { $sum: 1 } } },
        { $sort: { wins: -1, _id: 1 } },
        { $limit: capped },
        { $project: { _id: 0, slug: '$_id', wins: 1 } },
      ])
      .exec();
  }
}
