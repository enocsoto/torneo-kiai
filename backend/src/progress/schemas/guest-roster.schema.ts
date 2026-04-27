import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Warrior } from '../../warriors/schemas/warrior.schema';

export type GuestRosterDocument = HydratedDocument<GuestRoster>;

@Schema({ timestamps: true })
export class GuestRoster {
  @Prop({ required: true, unique: true, index: true })
  guestId: string;

  @Prop({ type: [Types.ObjectId], ref: Warrior.name, default: [] })
  unlockedWarriorIds: Types.ObjectId[];
}

export const GuestRosterSchema = SchemaFactory.createForClass(GuestRoster);
