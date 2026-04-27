import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BattlesModule } from '../battles/battles.module';
import { MatchRoom, MatchRoomSchema } from './match-room.schema';
import { MatchRoomService } from './match-room.service';
import { RoomsController } from './rooms.controller';
import { RoomsGateway } from './rooms.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MatchRoom.name, schema: MatchRoomSchema },
    ]),
    forwardRef(() => BattlesModule),
  ],
  controllers: [RoomsController],
  providers: [MatchRoomService, RoomsGateway],
  exports: [MatchRoomService],
})
export class RoomsModule {}
