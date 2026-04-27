import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Warrior } from '../../warriors/schemas/warrior.schema';

export type GuestWarriorProgressDocument =
  HydratedDocument<GuestWarriorProgress>;

@Schema({ timestamps: true })
export class GuestWarriorProgress {
  @Prop({ required: true, index: true })
  guestId: string;

  @Prop({ type: Types.ObjectId, ref: Warrior.name, required: true })
  warriorId: Types.ObjectId;

  @Prop({ default: 0 })
  wins: number;

  /**
   * Partidas terminadas con este guerrero (J1 o J2 según haya aportado el guest).
   * Se usa para desbloqueo de roster (3+ con cada básico, etc.).
   */
  @Prop({ default: 0 })
  partidas: number;

  /**
   * Claves de ataques **extra** elegidos (mismo nº que tramos de 3 victorias).
   * Cada clave debe estar en el pool de aprendizaje del guerrero y ser única.
   */
  @Prop({ type: [String], default: undefined })
  bonusClavesElegidas?: string[];
}

export const GuestWarriorProgressSchema =
  SchemaFactory.createForClass(GuestWarriorProgress);

GuestWarriorProgressSchema.index(
  { guestId: 1, warriorId: 1 },
  { unique: true },
);
