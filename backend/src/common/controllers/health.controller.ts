import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheckResult, HealthService } from '../services/health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200, description: 'Health check successful' })
  @ApiResponse({ status: 503, description: 'Service unhealthy' })
  async getHealth(): Promise<HealthCheckResult> {
    return this.healthService.checkHealth();
  }

  @Get('detailed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get detailed health information' })
  @ApiResponse({ status: 200, description: 'Detailed health check successful' })
  async getDetailedHealth(): Promise<any> {
    return this.healthService.getDetailedHealth();
  }

  @Get('ready')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async getReadiness(): Promise<{ ready: boolean }> {
    const ready = await this.healthService.getReadiness();
    return { ready };
  }

  @Get('live')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  @ApiResponse({ status: 503, description: 'Service is not alive' })
  async getLiveness(): Promise<{ alive: boolean }> {
    const alive = await this.healthService.getLiveness();
    return { alive };
  }

  @Get('ping')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Simple ping endpoint' })
  @ApiResponse({ status: 200, description: 'Pong' })
  async ping(): Promise<{ pong: string; timestamp: string }> {
    return {
      pong: 'pong',
      timestamp: new Date().toISOString(),
    };
  }
}
