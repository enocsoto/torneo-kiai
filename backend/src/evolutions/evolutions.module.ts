import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Evolution, EvolutionSchema } from './schemas/evolution.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Evolution.name, schema: EvolutionSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class EvolutionsModule {}
