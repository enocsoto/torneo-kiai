import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PlayerAliasDocument = HydratedDocument<PlayerAlias>;

@Schema({ timestamps: true })
export class PlayerAlias {
  /** Alias en minúsculas — clave de unicidad (índice). */
  @Prop({
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
  })
  alias: string;

  /** Alias con el casing original que eligió el usuario. */
  @Prop({ required: true, trim: true })
  displayAlias: string;

  /** bcrypt hash del PIN de 4 dígitos; undefined si el usuario no configuró PIN. */
  @Prop({ required: false })
  pinHash?: string;

  /** UUID interno utilizado como guestId en el resto de la API. */
  @Prop({ required: true, unique: true, index: true })
  guestId: string;
}

export const PlayerAliasSchema = SchemaFactory.createForClass(PlayerAlias);
