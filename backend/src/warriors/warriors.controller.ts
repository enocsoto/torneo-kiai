import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { WarriorsService } from './warriors.service';

@ApiTags('warriors')
@Controller('warriors')
export class WarriorsController {
  constructor(private readonly warriorsService: WarriorsService) {}

  @Get()
  @ApiQuery({ name: 'guestId', required: false })
  list(@Query('guestId') guestId?: string) {
    return this.warriorsService.findAllForGuest(guestId);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.warriorsService.findById(id);
  }
}
