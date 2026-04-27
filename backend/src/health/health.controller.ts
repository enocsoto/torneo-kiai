import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { MetricsService } from '../common/metrics/metrics.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongo: MongooseHealthIndicator,
    private readonly metrics: MetricsService,
  ) {}

  /** Liveness: sin dependencias (balanceadores / k8s). */
  @Get()
  ping() {
    return { ok: true, service: 'kiai-tournament-api' };
  }

  /** Readiness: MongoDB accesible. */
  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([() => this.mongo.pingCheck('mongodb')]);
  }

  /** Métricas recientes + metadatos (Mongo vía `/health/ready`). */
  @Get('detailed')
  detailed() {
    return {
      ok: true,
      service: 'kiai-tournament-api',
      uptimeSec: Math.round(process.uptime()),
      mongodbCheck: 'GET /health/ready',
      metrics: this.metrics.snapshot(),
    };
  }
}
