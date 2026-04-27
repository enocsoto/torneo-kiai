import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { PatchBonusBodyDto } from './dto/patch-bonus-body.dto';
import { PlayerProgressService } from './player-progress.service';
import { RosterUnlockService } from './roster-unlock.service';

@ApiTags('progress')
@Controller('progress')
export class ProgressController {
  constructor(
    private readonly playerProgress: PlayerProgressService,
    private readonly roster: RosterUnlockService,
  ) {}

  @Get('roster')
  @ApiQuery({ name: 'guestId', required: true })
  getRoster(@Query('guestId') guestId: string) {
    return this.roster.getRosterState(guestId ?? '');
  }

  @Get('warrior/:warriorId')
  @ApiQuery({ name: 'guestId', required: true })
  getHabilidades(
    @Param('warriorId') warriorId: string,
    @Query('guestId') guestId: string,
  ) {
    return this.playerProgress.getHabilidadesConfig(guestId ?? '', warriorId);
  }

  @Patch('warrior/:warriorId/bonus')
  setBonusClaves(
    @Param('warriorId') warriorId: string,
    @Body() body: PatchBonusBodyDto,
  ) {
    return this.playerProgress.setBonusClavesElegidas(
      body.guestId ?? '',
      warriorId,
      body.claves ?? [],
    );
  }
}
