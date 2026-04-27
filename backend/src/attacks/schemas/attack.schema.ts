import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AttackDocument = HydratedDocument<Attack>;

@Schema({ timestamps: true })
export class Attack {
  @Prop({ required: true, unique: true })
  clave: string;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  daño: number;

  @Prop({ required: true })
  costoEnergia: number;
}

export const AttackSchema = SchemaFactory.createForClass(Attack);
