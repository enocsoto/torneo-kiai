import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateBattleDto {
  @ApiProperty()
  @IsMongoId()
  warriorAId: string;

  @ApiProperty()
  @IsMongoId()
  warriorBId: string;

  @ApiPropertyOptional({
    description:
      'Modo invitado: identificador estable (p. ej. UUID en localStorage). Límite de batallas nuevas por hora.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  guestId?: string;

  @ApiPropertyOptional({
    description:
      'Si true (por defecto), el jugador 1 acumula victorias y ataque extra cada 3 victorias. Desactívalo en modo sofá (2 jugadores).',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  progresoJugador1?: boolean;

  @ApiPropertyOptional({
    description:
      'Jugador 2 (B) invitado en línea; victorias y roster para el otro dispositivo.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  guestJugador2?: string;

  @ApiPropertyOptional({ enum: ['local', 'couch', 'online'] })
  @IsOptional()
  @IsString()
  modo?: 'local' | 'couch' | 'online';

  @ApiPropertyOptional({ description: 'Código de sala (6 caracteres).' })
  @IsOptional()
  @IsString()
  @MaxLength(12)
  roomCode?: string;

  @ApiPropertyOptional({
    description:
      'Si true (por defecto con guestJugador2 en línea), el jugador 2 gana progreso al vencer con su guerrero.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  progresoJugador2?: boolean;
}
