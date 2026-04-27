import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Battle } from '../battles/schemas/battle.schema';
import { Warrior } from '../warriors/schemas/warrior.schema';

export type MatchRoomDocument = HydratedDocument<MatchRoom>;

@Schema({ timestamps: true })
export class MatchRoom {
  @Prop({ required: true, unique: true, index: true, uppercase: true })
  code: string;

  @Prop({ required: true })
  hostGuestId: string;

  @Prop({ type: Types.ObjectId, ref: Warrior.name, required: true })
  hostWarriorId: Types.ObjectId;

  @Prop()
  joinerGuestId?: string;

  @Prop({ type: Types.ObjectId, ref: Warrior.name })
  joinerWarriorId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Battle.name })
  battleId?: Types.ObjectId;

  @Prop({ required: true, enum: ['open', 'matched', 'closed'] })
  status: 'open' | 'matched' | 'closed';

  @Prop({ required: true })
  expiresAt: Date;
}

export const MatchRoomSchema = SchemaFactory.createForClass(MatchRoom);
