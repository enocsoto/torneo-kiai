import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WarriorWinStat,
  WarriorWinStatSchema,
} from './schemas/warrior-win-stat.schema';
import { RankingsController } from './rankings.controller';
import { RankingsService } from './rankings.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WarriorWinStat.name, schema: WarriorWinStatSchema },
    ]),
  ],
  controllers: [RankingsController],
  providers: [RankingsService],
  exports: [RankingsService],
})
export class RankingsModule {}
