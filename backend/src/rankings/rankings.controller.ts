import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RankingsService } from './rankings.service';

@ApiTags('rankings')
@Controller('rankings')
export class RankingsController {
  constructor(private readonly rankings: RankingsService) {}

  @Get('warriors')
  @ApiOperation({
    summary: 'Guerreros con más victorias en batallas finalizadas',
  })
  async warriors(@Query('limit') limit?: string) {
    const n = parseInt(limit ?? '30', 10);
    const rows = await this.rankings.topWarriors(Number.isFinite(n) ? n : 30);
    return rows.map((r) => ({
      slug: r.slug,
      wins: r.wins,
    }));
  }
}
