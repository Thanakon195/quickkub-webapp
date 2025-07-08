import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async checkHealth(@Res() res: Response) {
    const health = await this.healthService.checkHealth();

    const status = health.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    res.status(status).json({
      status: health.status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: health.services,
      checks: health.checks,
    });
  }

  @Get('ready')
  async checkReadiness(@Res() res: Response) {
    const readiness = await this.healthService.checkReadiness();

    const status = readiness.ready ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    res.status(status).json({
      ready: readiness.ready,
      timestamp: new Date().toISOString(),
      checks: readiness.checks,
    });
  }

  @Get('live')
  async checkLiveness(@Res() res: Response) {
    const liveness = await this.healthService.checkLiveness();

    const status = liveness.alive ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    res.status(status).json({
      alive: liveness.alive,
      timestamp: new Date().toISOString(),
      checks: liveness.checks,
    });
  }

  @Get('metrics')
  async getMetrics(@Res() res: Response) {
    const metrics = await this.healthService.getMetrics();

    res.status(HttpStatus.OK).json({
      timestamp: new Date().toISOString(),
      metrics,
    });
  }
}
