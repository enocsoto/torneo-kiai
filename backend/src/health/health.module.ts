import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { MetricsModule } from '../common/metrics/metrics.module';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, MetricsModule],
  controllers: [HealthController],
})
export class HealthModule {}
