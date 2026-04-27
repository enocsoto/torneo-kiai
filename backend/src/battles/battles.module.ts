import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BattleActionMetricsInterceptor } from '../common/interceptors/battle-action-metrics.interceptor';
import { ProgressModule } from '../progress/progress.module';
import { RankingsModule } from '../rankings/rankings.module';
import { WarriorsModule } from '../warriors/warriors.module';
import { Battle, BattleSchema } from './schemas/battle.schema';
import { BattleOutcomeService } from './battle-outcome.service';
import { BattlesController } from './battles.controller';
import { BattlesGateway } from './battles.gateway';
import { BattlesService } from './battles.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Battle.name, schema: BattleSchema }]),
    WarriorsModule,
    RankingsModule,
    ProgressModule,
  ],
  controllers: [BattlesController],
  providers: [
    BattlesService,
    BattleOutcomeService,
    BattlesGateway,
    BattleActionMetricsInterceptor,
  ],
  exports: [BattlesService],
})
export class BattlesModule {}
