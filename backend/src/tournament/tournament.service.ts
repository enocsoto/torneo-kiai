import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Battle } from '../battles/schemas/battle.schema';
import {
  TOURNAMENT_WINDOW_DAYS,
  TOP_TOURNAMENT_STANDINGS,
} from '../config/game.constants';

export type TorneoFila = {
  pos: number;
  guestId: string;
  displayId: string;
  victorias: number;
};

@Injectable()
export class TournamentService {
  constructor(
    @InjectModel(Battle.name) private readonly battle: Model<Battle>,
  ) {}

  async getStandings(days: number = TOURNAMENT_WINDOW_DAYS): Promise<{
    ventanaDias: number;
    desde: string;
    top: TorneoFila[];
    leyenda: string;
  }> {
    const d = Math.min(90, Math.max(1, days));
    const since = new Date(Date.now() - d * 86_400_000);
    const docs = await this.battle
      .find({
        modo: 'online',
        status: 'finished',
        guestId: { $exists: true, $nin: [null, ''] },
        guestJugador2: { $exists: true, $nin: [null, ''] },
        updatedAt: { $gte: since },
        winnerSide: { $in: ['A', 'B'] },
      })
      .select('winnerSide guestId guestJugador2')
      .lean()
      .exec();
    const map = new Map<string, number>();
    for (const b of docs) {
      if (!b.winnerSide) continue;
      const g = b.winnerSide === 'A' ? b.guestId : b.guestJugador2;
      if (!g || typeof g !== 'string') continue;
      const t = (map.get(g) ?? 0) + 1;
      map.set(g, t);
    }
    const sorted = [...map.entries()]
      .sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))
      .slice(0, TOP_TOURNAMENT_STANDINGS);
    const top: TorneoFila[] = sorted.map(([guestId, victorias], i) => ({
      pos: i + 1,
      guestId,
      displayId: guestId.length > 8 ? `…${guestId.slice(-6)}` : guestId,
      victorias,
    }));
    return {
      ventanaDias: d,
      desde: since.toISOString(),
      top,
      leyenda:
        'Ránking por victorias en combates en línea (2 dispositivos) en la ventana indicada. Top 4 y campeón de periodo.',
    };
  }
}
