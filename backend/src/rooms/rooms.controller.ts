import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsMongoId, IsString, MaxLength } from 'class-validator';
import { MatchRoomService } from './match-room.service';

class CreateOnlineRoomDto {
  @IsString()
  @MaxLength(80)
  guestId!: string;

  @IsMongoId()
  hostWarriorId!: string;
}

class JoinRoomDto {
  @IsString()
  @MaxLength(80)
  joinerGuestId!: string;

  @IsMongoId()
  joinerWarriorId!: string;
}

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly rooms: MatchRoomService) {}

  @Post('online')
  createOnline(@Body() body: CreateOnlineRoomDto) {
    return this.rooms.createRoom(
      body.guestId,
      body.hostWarriorId,
      process.env.PUBLIC_APP_BASE,
    );
  }

  @Get('online/:code')
  getState(@Param('code') code: string) {
    return this.rooms.getByCode(code);
  }

  @Post('online/:code/join')
  join(@Param('code') code: string, @Body() body: JoinRoomDto) {
    if (!code?.trim()) {
      throw new NotFoundException('Código requerido');
    }
    return this.rooms.joinRoom(code, body.joinerGuestId, body.joinerWarriorId);
  }
}
