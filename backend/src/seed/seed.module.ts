import { Module } from '@nestjs/common';
import { AttacksModule } from '../attacks/attacks.module';
import { EvolutionsModule } from '../evolutions/evolutions.module';
import { WarriorsModule } from '../warriors/warriors.module';
import { SeedService } from './seed.service';

@Module({
  imports: [AttacksModule, EvolutionsModule, WarriorsModule],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
