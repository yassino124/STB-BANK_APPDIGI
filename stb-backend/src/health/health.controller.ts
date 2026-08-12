import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongoose: MongooseHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  /**
   * GET /api/v1/health
   * Endpoint public de santé du système - utilisé par Docker healthchecks et monitoring
   */
  @Get()
  @Public()
  @HealthCheck()
  check() {
    return this.health.check([
      // ── Base de données MongoDB ─────────────────────────────────────────
      () => this.mongoose.pingCheck('mongodb', { timeout: 3000 }),

      // ── Mémoire RAM (alerte si > 512MB utilisés par le process) ──────────
      () => this.memory.checkHeap('memory_heap', 512 * 1024 * 1024),

      // ── Espace disque (alerte si > 90% utilisé) ───────────────────────────
      () =>
        this.disk.checkStorage('disk', {
          path: '/',
          thresholdPercent: 0.9,
        }),
    ]);
  }

  /**
   * GET /api/v1/health/ping
   * Simple liveness check (le serveur répond-il ?)
   */
  @Get('ping')
  @Public()
  ping() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'STB Banking API',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: `${Math.floor(process.uptime())}s`,
    };
  }
}
