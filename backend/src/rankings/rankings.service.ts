import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WarriorWinStat } from './schemas/warrior-win-stat.schema';

@Injectable()
export class RankingsService {
  constructor(
    @InjectModel(WarriorWinStat.name)
    private readonly winModel: Model<WarriorWinStat>,
  ) {}

  async recordWin(slug: string): Promise<void> {
    const s = slug.trim();
    if (!s) return;
    await this.winModel.updateOne(
      { slug: s },
      { $inc: { wins: 1 } },
      { upsert: true },
    );
  }

  async topWarriors(limit = 30) {
    const capped = Math.min(100, Math.max(1, limit));
    return this.winModel
      .find()
      .sort({ wins: -1, slug: 1 })
      .limit(capped)
      .lean()
      .exec();
  }
}
