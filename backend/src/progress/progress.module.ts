import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Attack, AttackSchema } from '../attacks/schemas/attack.schema';
import {
  Evolution,
  EvolutionSchema,
} from '../evolutions/schemas/evolution.schema';
import { Warrior, WarriorSchema } from '../warriors/schemas/warrior.schema';
import { PlayerProgressService } from './player-progress.service';
import { ProgressController } from './progress.controller';
import { RosterUnlockService } from './roster-unlock.service';
import { GuestRoster, GuestRosterSchema } from './schemas/guest-roster.schema';
import {
  GuestWarriorProgress,
  GuestWarriorProgressSchema,
} from './schemas/guest-warrior-progress.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GuestWarriorProgress.name, schema: GuestWarriorProgressSchema },
      { name: GuestRoster.name, schema: GuestRosterSchema },
      { name: Attack.name, schema: AttackSchema },
      { name: Evolution.name, schema: EvolutionSchema },
      { name: Warrior.name, schema: WarriorSchema },
    ]),
  ],
  controllers: [ProgressController],
  providers: [PlayerProgressService, RosterUnlockService],
  exports: [PlayerProgressService, RosterUnlockService],
})
export class ProgressModule {}
