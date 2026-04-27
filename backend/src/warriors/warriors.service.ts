import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attack } from '../attacks/schemas/attack.schema';
import { Evolution } from '../evolutions/schemas/evolution.schema';
import { PlayerProgressService } from '../progress/player-progress.service';
import { RosterUnlockService } from '../progress/roster-unlock.service';
import { Warrior } from './schemas/warrior.schema';

@Injectable()
export class WarriorsService {
  constructor(
    @InjectModel(Warrior.name) private readonly warriorModel: Model<Warrior>,
    private readonly roster: RosterUnlockService,
    private readonly playerProgress: PlayerProgressService,
  ) {}

  async findAllForGuest(guestId?: string) {
    const list = (await this.warriorModel
      .find()
      .populate({ path: 'ataques', model: Attack.name })
      .populate({ path: 'evolucionActiva', model: Evolution.name })
      .sort({ nombre: 1 })
      .lean()
      .exec()) as unknown as Record<string, unknown>[];
    const g = guestId?.trim();
    if (!g) {
      return list;
    }
    await this.roster.ensureRosterForGuest(g);
    const st = await this.roster.getRosterState(g);
    const u = new Set(st.unlockedSlugs);
    const unlocked = list.filter((w) => u.has(w.slug as string));
    return Promise.all(
      unlocked.map(async (w) => ({
        ...w,
        evolucionActiva: await this.playerProgress.getEvolucionActiva(
          g,
          w._id as Types.ObjectId,
          w.slug as string,
        ),
      })),
    );
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Guerrero no encontrado');
    }
    const w = await this.warriorModel
      .findById(id)
      .populate({ path: 'ataques', model: Attack.name })
      .populate({ path: 'evolucionActiva', model: Evolution.name })
      .exec();
    if (!w) throw new NotFoundException('Guerrero no encontrado');
    return w;
  }
}
