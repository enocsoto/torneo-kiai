import { Injectable, Optional } from '@nestjs/common';
import { HydratedDocument } from 'mongoose';
import {
  PlayerProgressService,
  ProgresoVictoriaResult,
} from '../progress/player-progress.service';
import { RosterUnlockService } from '../progress/roster-unlock.service';
import { RankingsService } from '../rankings/rankings.service';
import { BattlesGateway } from './battles.gateway';
import { Battle } from './schemas/battle.schema';

@Injectable()
export class BattleOutcomeService {
  constructor(
    private readonly rankings: RankingsService,
    private readonly playerProgress: PlayerProgressService,
    private readonly rosterUnlock: RosterUnlockService,
    @Optional() private readonly battlesGateway?: BattlesGateway,
  ) {}

  /**
   * Registra todos los efectos secundarios de una batalla terminada:
   * ranking, progreso de partidas, desbloqueos de roster y victorias.
   * Devuelve el evento de progreso si el jugador aprendió un ataque.
   */
  async processFinished(
    battle: HydratedDocument<Battle>,
  ): Promise<ProgresoVictoriaResult | undefined> {
    if (!battle.winnerSide) return undefined;

    await this.recordRankingWin(battle);
    const evolutionEvent = await this.updateProgressAndRoster(battle);
    const victoryEvent = await this.recordVictoryProgress(battle);
    if (!evolutionEvent && !victoryEvent) return undefined;
    return {
      aprendioAtaque: Boolean(victoryEvent?.aprendioAtaque),
      nombreAtaque: victoryEvent?.nombreAtaque,
      evolucionDesbloqueada: Boolean(evolutionEvent?.evolucionDesbloqueada),
      nombreEvolucion: evolutionEvent?.nombreEvolucion,
      evolucionWarriorId: evolutionEvent?.warriorId,
      evolucionWarriorSlug: evolutionEvent?.warriorSlug,
      evolucionWarriorNombre: evolutionEvent?.warriorNombre,
    };
  }

  notifyIfOnline(
    battle: HydratedDocument<Battle>,
    plain: Record<string, unknown>,
  ): void {
    if (battle.modo === 'online') {
      this.battlesGateway?.notifyUpdate(String(battle._id), plain);
    }
  }

  private async recordRankingWin(
    battle: HydratedDocument<Battle>,
  ): Promise<void> {
    const slug =
      battle.winnerSide === 'A' ? battle.warriorA.slug : battle.warriorB.slug;
    try {
      await this.rankings.recordWin(slug);
    } catch (err) {
      console.error(
        JSON.stringify({
          level: 'error',
          msg: 'rankings_record_win_failed',
          slug,
          error: String(err),
        }),
      );
    }
  }

  private async updateProgressAndRoster(
    battle: HydratedDocument<Battle>,
  ): Promise<
    | {
        evolucionDesbloqueada: boolean;
        nombreEvolucion?: string;
        warriorId?: string;
        warriorSlug?: string;
        warriorNombre?: string;
      }
    | undefined
  > {
    const g1 = battle.guestId?.trim();
    const g2 = battle.guestJugador2?.trim();
    const modo = battle.modo ?? 'local';
    try {
      const evolutionEvents: {
        evolucionDesbloqueada: boolean;
        nombreEvolucion?: string;
        warriorId?: string;
        warriorSlug?: string;
        warriorNombre?: string;
      }[] = [];
      if (modo === 'online' && g1 && g2) {
        evolutionEvents.push(
          await this.playerProgress.incrementarPartida(
            g1,
            String(battle.warriorA.warriorId),
          ),
          await this.playerProgress.incrementarPartida(
            g2,
            String(battle.warriorB.warriorId),
          ),
        );
        await this.rosterUnlock.tryUnlockNextIfEligible(g1);
        await this.rosterUnlock.tryUnlockNextIfEligible(g2);
      } else if (g1) {
        evolutionEvents.push(
          await this.playerProgress.incrementarPartida(
            g1,
            String(battle.warriorA.warriorId),
          ),
          await this.playerProgress.incrementarPartida(
            g1,
            String(battle.warriorB.warriorId),
          ),
        );
        await this.rosterUnlock.tryUnlockNextIfEligible(g1);
      }
      return evolutionEvents.find((event) => event.evolucionDesbloqueada);
    } catch (err) {
      console.error(
        JSON.stringify({
          level: 'error',
          msg: 'roster_or_partida_failed',
          error: String(err),
        }),
      );
      return undefined;
    }
  }

  private async recordVictoryProgress(
    battle: HydratedDocument<Battle>,
  ): Promise<ProgresoVictoriaResult | undefined> {
    const g1 = battle.guestId?.trim();
    const g2 = battle.guestJugador2?.trim();

    const winnerIsJ1 =
      battle.winnerSide === 'A' &&
      g1 &&
      battle.conProgresoJ1 &&
      battle.warriorA?.warriorId;
    const winnerIsJ2 =
      battle.winnerSide === 'B' &&
      g2 &&
      battle.conProgresoJ2 &&
      battle.warriorB?.warriorId;

    if (winnerIsJ1) {
      return this.safeRegistrarVictoria(
        g1,
        String(battle.warriorA.warriorId),
        'player_progress_win_failed',
      );
    }
    if (winnerIsJ2) {
      return this.safeRegistrarVictoria(
        g2,
        String(battle.warriorB.warriorId),
        'player_progress_win_j2_failed',
      );
    }
    return undefined;
  }

  private async safeRegistrarVictoria(
    guestId: string,
    warriorIdStr: string,
    errorMsg: string,
  ): Promise<ProgresoVictoriaResult | undefined> {
    try {
      const p = await this.playerProgress.registrarVictoriaJugador1(
        guestId,
        warriorIdStr,
      );
      return p.aprendioAtaque ? p : undefined;
    } catch (err) {
      console.error(
        JSON.stringify({ level: 'error', msg: errorMsg, error: String(err) }),
      );
      return undefined;
    }
  }
}
