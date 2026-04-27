import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EvolutionDocument = HydratedDocument<Evolution>;

@Schema({ timestamps: true })
export class Evolution {
  @Prop({ required: true, unique: true })
  clave: string;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  multiplicadorDaño: number;

  @Prop({ required: true })
  multiplicadorDefensa: number;
}

export const EvolutionSchema = SchemaFactory.createForClass(Evolution);
