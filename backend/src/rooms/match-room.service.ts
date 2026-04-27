import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Model, Types } from 'mongoose';
import { BattlesService } from '../battles/battles.service';
import { CreateBattleDto } from '../battles/dto/create-battle.dto';
import {
  ROOM_CODE_ALPHABET,
  ROOM_CODE_LEN,
  ROOM_TTL_MS,
} from '../config/game.constants';
import { MatchRoom } from './match-room.schema';
import { RoomsGateway } from './rooms.gateway';

export type CreateRoomResult = {
  code: string;
  shareUrl: string;
  expiresAt: string;
};

@Injectable()
export class MatchRoomService {
  constructor(
    @InjectModel(MatchRoom.name) private readonly room: Model<MatchRoom>,
    @Inject(forwardRef(() => BattlesService))
    private readonly battles: BattlesService,
    @Optional() private readonly roomsGateway?: RoomsGateway,
  ) {}

  private makeCode(): string {
    const bytes = randomBytes(ROOM_CODE_LEN);
    let s = '';
    for (let i = 0; i < ROOM_CODE_LEN; i++) {
      s += ROOM_CODE_ALPHABET[bytes[i] % ROOM_CODE_ALPHABET.length];
    }
    return s;
  }

  async createRoom(
    hostGuestId: string,
    hostWarriorId: string,
    appBaseForLink?: string,
  ): Promise<CreateRoomResult> {
    const h = hostGuestId.trim();
    if (!h) {
      throw new BadRequestException('hostGuestId requerido');
    }
    if (!Types.ObjectId.isValid(hostWarriorId)) {
      throw new BadRequestException('hostWarriorId inválido');
    }
    for (let attempt = 0; attempt < 6; attempt++) {
      const code = this.makeCode();
      const expiresAt = new Date(Date.now() + ROOM_TTL_MS);
      try {
        await this.room.create({
          code,
          hostGuestId: h,
          hostWarriorId: new Types.ObjectId(hostWarriorId),
          status: 'open',
          expiresAt,
        });
        const base = (appBaseForLink ?? '').replace(/\/$/, '');
        const shareUrl = base
          ? `${base}/play/online?code=${code}`
          : `/play/online?code=${code}`;
        return {
          code,
          shareUrl,
          expiresAt: expiresAt.toISOString(),
        };
      } catch {
        /* colisión de código, reintentar */
      }
    }
    throw new BadRequestException('No se pudo generar un código. Reintenta.');
  }

  async getByCode(code: string) {
    const c = code.trim().toUpperCase();
    if (c.length < 4) {
      throw new NotFoundException('Sala no encontrada');
    }
    const room = await this.room.findOne({ code: c }).lean().exec();
    if (!room) {
      throw new NotFoundException('Sala no encontrada o expirada');
    }
    if (new Date() > new Date(room.expiresAt)) {
      throw new NotFoundException('Sala expirada');
    }
    return {
      code: room.code,
      status: room.status,
      hasBattle: Boolean(room.battleId),
      battleId: room.battleId ? String(room.battleId) : null,
    };
  }

  /**
   * El invitado se une, el combate nace con J1=anfitrión (bonos de J1) y J2=invitado.
   */
  async joinRoom(code: string, joinerGuestId: string, joinerWarriorId: string) {
    const c = code.trim().toUpperCase();
    const jG = joinerGuestId.trim();
    if (!jG) {
      throw new BadRequestException('joinerGuestId requerido');
    }
    if (!Types.ObjectId.isValid(joinerWarriorId)) {
      throw new BadRequestException('joinerWarriorId inválido');
    }
    const room = await this.room.findOne({ code: c, status: 'open' }).exec();
    if (!room) {
      throw new NotFoundException('Sala no disponible o ya usada');
    }
    if (new Date() > room.expiresAt) {
      room.status = 'closed';
      await room.save();
      throw new NotFoundException('Sala expirada');
    }
    if (room.hostGuestId === jG) {
      throw new BadRequestException(
        'Usa otro dispositivo o invitado para el rival',
      );
    }
    if (String(room.hostWarriorId) === joinerWarriorId) {
      throw new BadRequestException(
        'Elegir otro guerrero; ese ya lo usa el anfitrión',
      );
    }
    const dto: CreateBattleDto = {
      warriorAId: String(room.hostWarriorId),
      warriorBId: joinerWarriorId,
      guestId: room.hostGuestId,
      guestJugador2: jG,
      modo: 'online',
      roomCode: room.code,
      progresoJugador1: true,
      progresoJugador2: true,
    };
    const battle = await this.battles.create(dto);
    room.status = 'matched';
    room.joinerGuestId = jG;
    room.joinerWarriorId = new Types.ObjectId(joinerWarriorId);
    room.battleId = battle._id;
    await room.save();

    // Notificación WebSocket al anfitrión: la sala está lista
    this.roomsGateway?.notifyReady(room.code, String(battle._id));

    return { battle, code: room.code };
  }
}
