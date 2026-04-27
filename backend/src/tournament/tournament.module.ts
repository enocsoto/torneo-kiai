import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Battle, BattleSchema } from '../battles/schemas/battle.schema';
import { TournamentController } from './tournament.controller';
import { TournamentService } from './tournament.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Battle.name, schema: BattleSchema }]),
  ],
  controllers: [TournamentController],
  providers: [TournamentService],
  exports: [TournamentService],
})
export class TournamentModule {}
