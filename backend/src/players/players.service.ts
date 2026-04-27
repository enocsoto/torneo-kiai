import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID as nodeRandomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { RegisterPlayerDto } from './dto/register-player.dto';
import { LoginPlayerDto } from './dto/login-player.dto';
import { containsProfanity } from './profanity';
import {
  PlayerAlias,
  PlayerAliasDocument,
} from './schemas/player-alias.schema';

const BCRYPT_ROUNDS = 10;

function randomUUID(): string {
  if (
    typeof globalThis.crypto !== 'undefined' &&
    'randomUUID' in globalThis.crypto
  ) {
    return globalThis.crypto.randomUUID();
  }
  return nodeRandomUUID();
}

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(PlayerAlias.name)
    private readonly model: Model<PlayerAliasDocument>,
  ) {}

  async register(
    dto: RegisterPlayerDto,
  ): Promise<{ guestId: string; alias: string }> {
    const aliasLower = dto.alias.toLowerCase();

    if (containsProfanity(dto.alias)) {
      throw new BadRequestException(
        'El alias contiene palabras no permitidas.',
      );
    }

    const exists = await this.model.exists({ alias: aliasLower });
    if (exists) {
      throw new ConflictException('Este alias ya está en uso. Elige otro.');
    }

    const guestId = randomUUID();
    const pinHash = dto.pin
      ? await bcrypt.hash(dto.pin, BCRYPT_ROUNDS)
      : undefined;

    await this.model.create({
      alias: aliasLower,
      displayAlias: dto.alias,
      guestId,
      ...(pinHash ? { pinHash } : {}),
    });

    return { guestId, alias: dto.alias };
  }

  async login(
    dto: LoginPlayerDto,
  ): Promise<{ guestId: string; alias: string; requiresPin: boolean }> {
    const aliasLower = dto.alias.toLowerCase();
    const player = await this.model.findOne({ alias: aliasLower });

    if (!player) {
      throw new NotFoundException('Alias no encontrado. ¿Querés registrarte?');
    }

    if (player.pinHash) {
      if (!dto.pin) {
        throw new UnauthorizedException(
          'Este alias tiene PIN. Ingresalo para continuar.',
        );
      }
      const ok = await bcrypt.compare(dto.pin, player.pinHash);
      if (!ok) {
        throw new UnauthorizedException('PIN incorrecto.');
      }
    }

    return {
      guestId: player.guestId,
      alias: player.displayAlias,
      requiresPin: Boolean(player.pinHash),
    };
  }

  async isAvailable(alias: string): Promise<{ available: boolean }> {
    if (!alias || alias.length < 4 || alias.length > 8) {
      return { available: false };
    }
    if (containsProfanity(alias)) {
      return { available: false };
    }
    const exists = await this.model.exists({ alias: alias.toLowerCase() });
    return { available: !exists };
  }

  async hasPin(alias: string): Promise<{ hasPin: boolean; exists: boolean }> {
    const player = await this.model.findOne(
      { alias: alias.toLowerCase() },
      { pinHash: 1 },
    );
    if (!player) return { hasPin: false, exists: false };
    return { hasPin: Boolean(player.pinHash), exists: true };
  }
}
