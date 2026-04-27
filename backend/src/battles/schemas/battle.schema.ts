import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BattleDocument = HydratedDocument<Battle>;

@Schema({ _id: false })
export class AttackSnapshot {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  daño: number;

  @Prop({ required: true })
  costoEnergia: number;
}

@Schema({ _id: false })
export class WarriorSnapshot {
  @Prop({ type: Types.ObjectId, required: true })
  warriorId: Types.ObjectId;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: true })
  nombre: string;

  @Prop()
  imageUrl?: string;

  @Prop({ required: true })
  salud: number;

  @Prop({ required: true })
  saludMax: number;

  @Prop({ required: true })
  ki: number;

  @Prop({ required: true })
  kiMax: number;

  @Prop({ required: true })
  defensa: number;

  @Prop({ required: true })
  estado: string;

  @Prop({ type: [AttackSnapshot], default: [] })
  ataques: AttackSnapshot[];

  /** Si true, el próximo daño recibido intentará esquiva (probabilidad). */
  @Prop({ default: false })
  esquivaPendiente: boolean;
}

@Schema({ timestamps: true })
export class Battle {
  @Prop({ type: WarriorSnapshot, required: true })
  warriorA: WarriorSnapshot;

  @Prop({ type: WarriorSnapshot, required: true })
  warriorB: WarriorSnapshot;

  @Prop({ required: true, enum: ['A', 'B'] })
  activeSide: 'A' | 'B';

  @Prop({
    required: true,
    enum: ['active', 'finished'],
    default: 'active',
  })
  status: 'active' | 'finished';

  @Prop({ type: String, enum: ['A', 'B'] })
  winnerSide?: 'A' | 'B';

  @Prop({ type: [String], default: [] })
  log: string[];

  /** Modo invitado: correlación por cliente (límites y analítica) — jugador 1. */
  @Prop()
  guestId?: string;

  /**
   * Modo en línea: segundo dispositivo (lado B). Misma nómina de progreso
   * que el jugador 1 cuando aplica.
   */
  @Prop()
  guestJugador2?: string;

  /** `local` (default), `couch` 2J local, `online` 2 dispositivos. */
  @Prop({ enum: ['local', 'couch', 'online'] })
  modo?: 'local' | 'couch' | 'online';

  /** Código de sala (IV) al crear vía /rooms, solo informativo. */
  @Prop()
  roomCode?: string;

  /** Jugador 1 (lado A) progresa con victorias (ataque extra cada 3). Falso en modo sofá. */
  @Prop({ default: false })
  conProgresoJ1?: boolean;

  /** Jugador 2 (lado B) progresa con victorias (solo con guestJugador2). */
  @Prop({ default: false })
  conProgresoJ2?: boolean;
}

export const BattleSchema = SchemaFactory.createForClass(Battle);
