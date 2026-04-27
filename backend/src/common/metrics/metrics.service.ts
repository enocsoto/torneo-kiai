import { Injectable } from '@nestjs/common';

const MAX_SAMPLES = 200;

@Injectable()
export class MetricsService {
  private readonly actionDurationsMs: number[] = [];
  private readonly statusCounts = new Map<number, number>();

  recordBattleAction(durationMs: number, statusCode: number): void {
    this.actionDurationsMs.push(durationMs);
    if (this.actionDurationsMs.length > MAX_SAMPLES) {
      this.actionDurationsMs.splice(
        0,
        this.actionDurationsMs.length - MAX_SAMPLES,
      );
    }
    this.statusCounts.set(
      statusCode,
      (this.statusCounts.get(statusCode) ?? 0) + 1,
    );
  }

  snapshot(): {
    battleAction: {
      samples: number;
      avgMs: number;
      p95Ms: number;
    };
    httpErrors: Record<string, number>;
  } {
    const samples = [...this.actionDurationsMs].sort((a, b) => a - b);
    const n = samples.length;
    const avgMs =
      n === 0 ? 0 : Math.round(samples.reduce((a, b) => a + b, 0) / n);
    const p95Ms =
      n === 0 ? 0 : (samples[Math.min(n - 1, Math.floor(n * 0.95))] ?? 0);
    const httpErrors: Record<string, number> = {};
    for (const [code, count] of this.statusCounts) {
      if (code >= 400) httpErrors[String(code)] = count;
    }
    return {
      battleAction: { samples: n, avgMs, p95Ms },
      httpErrors,
    };
  }
}
