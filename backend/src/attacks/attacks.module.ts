import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Attack, AttackSchema } from './schemas/attack.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Attack.name, schema: AttackSchema }]),
  ],
  exports: [MongooseModule],
})
export class AttacksModule {}
