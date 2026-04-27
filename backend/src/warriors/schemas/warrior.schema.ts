import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Attack } from '../../attacks/schemas/attack.schema';
import { Evolution } from '../../evolutions/schemas/evolution.schema';

export type WarriorDocument = HydratedDocument<Warrior>;

@Schema({ timestamps: true })
export class Warrior {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  nombre: string;

  /** URL absoluta (p. ej. Wikimedia) o ruta relativa servida por el front (/characters/...). */
  @Prop()
  imageUrl?: string;

  @Prop({ required: true })
  saludBase: number;

  @Prop({ required: true })
  kiBase: number;

  @Prop({ required: true, default: 10 })
  defensa: number;

  @Prop({ default: 'Base' })
  estado: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: Attack.name }] })
  ataques: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: Evolution.name })
  evolucionActiva?: Types.ObjectId;
}

export const WarriorSchema = SchemaFactory.createForClass(Warrior);
