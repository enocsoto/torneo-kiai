import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttacksModule } from '../attacks/attacks.module';
import { EvolutionsModule } from '../evolutions/evolutions.module';
import { ProgressModule } from '../progress/progress.module';
import { WarriorsController } from './warriors.controller';
import { WarriorsService } from './warriors.service';
import { WarriorDisplayNameSyncService } from './warrior-display-name-sync.service';
import { Warrior, WarriorSchema } from './schemas/warrior.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Warrior.name, schema: WarriorSchema }]),
    AttacksModule,
    EvolutionsModule,
    ProgressModule,
  ],
  controllers: [WarriorsController],
  providers: [WarriorsService, WarriorDisplayNameSyncService],
  exports: [WarriorsService, MongooseModule],
})
export class WarriorsModule {}
