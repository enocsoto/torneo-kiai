import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { BattleActionMetricsInterceptor } from '../common/interceptors/battle-action-metrics.interceptor';
import { BattleActionDto } from './dto/battle-action.dto';
import { CreateBattleDto } from './dto/create-battle.dto';
import { BattlesService } from './battles.service';

@ApiTags('battles')
@Controller('battles')
export class BattlesController {
  constructor(private readonly battlesService: BattlesService) {}

  @Post()
  create(@Body() dto: CreateBattleDto) {
    return this.battlesService.create(dto);
  }

  @Get('recent')
  listRecent(@Query('limit') limit?: string, @Query('skip') skip?: string) {
    const n = parseInt(limit ?? '10', 10);
    const s = parseInt(skip ?? '0', 10);
    return this.battlesService.listRecent(
      Number.isFinite(n) ? n : 10,
      Number.isFinite(s) ? s : 0,
    );
  }

  @Get('personal-warrior-wins')
  personalWarriorWins(
    @Query('guestId') guestId: string,
    @Query('limit') limit?: string,
  ) {
    const n = parseInt(limit ?? '20', 10);
    return this.battlesService.personalWarriorWins(
      guestId ?? '',
      Number.isFinite(n) ? n : 20,
    );
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.battlesService.findById(id);
  }

  @Post(':id/action')
  @UseInterceptors(BattleActionMetricsInterceptor)
  @Throttle({ battleActions: { limit: 48, ttl: 60000 } })
  action(@Param('id') id: string, @Body() dto: BattleActionDto) {
    return this.battlesService.applyAction(id, dto);
  }
}
