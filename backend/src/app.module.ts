import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AttacksModule } from './attacks/attacks.module';
import { BattlesModule } from './battles/battles.module';
import { ContactPublicModule } from './contact-public/contact-public.module';
import { MetricsModule } from './common/metrics/metrics.module';
import { EvolutionsModule } from './evolutions/evolutions.module';
import { HealthModule } from './health/health.module';
import { PlayersModule } from './players/players.module';
import { RankingsModule } from './rankings/rankings.module';
import { RoomsModule } from './rooms/rooms.module';
import { SeedModule } from './seed/seed.module';
import { TournamentModule } from './tournament/tournament.module';
import { WarriorsModule } from './warriors/warriors.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ContactPublicModule,
    MetricsModule,
    RankingsModule,
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 500,
      },
      {
        name: 'battleActions',
        ttl: 60000,
        limit: 48,
      },
    ]),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri:
          config.get<string>('MONGODB_URI') ??
          'mongodb://127.0.0.1:27029/torneo-kiai-tournament',
        serverSelectionTimeoutMS: 8_000,
      }),
    }),
    EvolutionsModule,
    AttacksModule,
    PlayersModule,
    WarriorsModule,
    BattlesModule,
    RoomsModule,
    TournamentModule,
    SeedModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
