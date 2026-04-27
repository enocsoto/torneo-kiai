import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WarriorWinStatDocument = HydratedDocument<WarriorWinStat>;

@Schema({ collection: 'warrior_win_stats' })
export class WarriorWinStat {
  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true, default: 0 })
  wins: number;
}

export const WarriorWinStatSchema =
  SchemaFactory.createForClass(WarriorWinStat);
