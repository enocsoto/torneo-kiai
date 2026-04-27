import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RegisterPlayerDto } from './dto/register-player.dto';
import { LoginPlayerDto } from './dto/login-player.dto';
import { PlayersService } from './players.service';

@Controller('players')
export class PlayersController {
  constructor(private readonly service: PlayersService) {}

  /** Registra un alias nuevo y genera un guestId. */
  @Post('register')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async register(@Body() dto: RegisterPlayerDto) {
    return this.service.register(dto);
  }

  /** Inicia sesión con un alias existente (+ PIN si lo tiene). */
  @Post('login')
  @Throttle({ default: { limit: 8, ttl: 60000 } })
  async login(@Body() dto: LoginPlayerDto) {
    return this.service.login(dto);
  }

  /** Comprueba disponibilidad del alias en tiempo real. */
  @Get('available')
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  async available(@Query('alias') alias: string) {
    return this.service.isAvailable(alias ?? '');
  }

  /** Informa si el alias existe y si tiene PIN (sin revelar datos sensibles). */
  @Get('hint')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async hint(@Query('alias') alias: string) {
    return this.service.hasPin(alias ?? '');
  }
}
