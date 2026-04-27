import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { TournamentService } from './tournament.service';

@ApiTags('tournament')
@Controller('tournament')
export class TournamentController {
  constructor(private readonly tournament: TournamentService) {}

  @Get('standings')
  @ApiQuery({ name: 'days', required: false })
  standings(@Query('days') days?: string) {
    const d = days ? parseInt(days, 10) : undefined;
    return this.tournament.getStandings(Number.isFinite(d) ? d : undefined);
  }
}
