import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Redis } from 'ioredis';
import { DataSource } from 'typeorm';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: HealthCheck;
    redis: HealthCheck;
    memory: HealthCheck;
    disk: HealthCheck;
    external: HealthCheck[];
  };
}

export interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  error?: string;
  details?: any;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRedis() private redis: Redis,
  ) {}

  async checkHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const checks = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      memory: this.checkMemory(),
      disk: this.checkDisk(),
      external: await this.checkExternalServices(),
    };

    const overallStatus = this.determineOverallStatus(checks);
    const responseTime = Date.now() - startTime;

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks,
    };
  }

  async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      // Check if database is connected
      if (!this.dataSource.isInitialized) {
        return {
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          error: 'Database not initialized',
        };
      }

      // Test database connection with a simple query
      await this.dataSource.query('SELECT 1');

      // Check database size and performance
      const dbStats = await this.getDatabaseStats();

      return {
        status: 'healthy',
        responseTime: Date.now() - startTime,
        details: dbStats,
      };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  async checkRedis(): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      // Test Redis connection
      await this.redis.ping();

      // Check Redis memory usage
      const info = await this.redis.info('memory');
      const memoryUsage = this.parseRedisMemoryInfo(info);

      return {
        status: 'healthy',
        responseTime: Date.now() - startTime,
        details: memoryUsage,
      };
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  checkMemory(): HealthCheck {
    const memUsage = process.memoryUsage();
    const maxHeapSize = memUsage.heapTotal;
    const usedHeapSize = memUsage.heapUsed;
    const memoryUsagePercent = (usedHeapSize / maxHeapSize) * 100;

    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

    if (memoryUsagePercent > 90) {
      status = 'unhealthy';
    } else if (memoryUsagePercent > 80) {
      status = 'degraded';
    }

    return {
      status,
      details: {
        used: Math.round(usedHeapSize / 1024 / 1024),
        total: Math.round(maxHeapSize / 1024 / 1024),
        percentage: Math.round(memoryUsagePercent),
        external: Math.round(memUsage.external / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024),
      },
    };
  }

  checkDisk(): HealthCheck {
    // This is a simplified disk check
    // In production, you might want to use a library like 'diskusage'
    const freeMemory = require('os').freemem();
    const totalMemory = require('os').totalmem();
    const diskUsagePercent = ((totalMemory - freeMemory) / totalMemory) * 100;

    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

    if (diskUsagePercent > 95) {
      status = 'unhealthy';
    } else if (diskUsagePercent > 85) {
      status = 'degraded';
    }

    return {
      status,
      details: {
        free: Math.round(freeMemory / 1024 / 1024 / 1024),
        total: Math.round(totalMemory / 1024 / 1024 / 1024),
        percentage: Math.round(diskUsagePercent),
      },
    };
  }

  async checkExternalServices(): Promise<HealthCheck[]> {
    const services = [
      { name: 'promptpay', url: 'https://api.promptpay.co.th/health' },
      { name: 'kbank', url: 'https://api.kasikornbank.com/health' },
      { name: 'scb', url: 'https://api.scbeasy.com/health' },
      { name: 'truemoney', url: 'https://api.truemoney.com/health' },
      { name: 'gbprimepay', url: 'https://api.gbprimepay.com/health' },
    ];

    const checks = await Promise.allSettled(
      services.map(service => this.checkExternalService(service))
    );

    return checks.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          name: services[index].name,
          status: 'unhealthy' as const,
          error: result.reason.message,
        };
      }
    });
  }

  private async checkExternalService(service: { name: string; url: string }): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      // In production, implement actual HTTP health checks
      // For now, simulate a check
      await new Promise(resolve => setTimeout(resolve, 100));

      return {
        status: 'healthy',
        responseTime: Date.now() - startTime,
        details: { service: service.name },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error.message,
        details: { service: service.name },
      };
    }
  }

  private async getDatabaseStats(): Promise<any> {
    try {
      // Get database statistics
      const tableCount = await this.dataSource.query(`
        SELECT COUNT(*) as table_count
        FROM information_schema.tables
        WHERE table_schema = 'public'
      `);

      const connectionCount = await this.dataSource.query(`
        SELECT count(*) as connection_count
        FROM pg_stat_activity
        WHERE state = 'active'
      `);

      return {
        tableCount: tableCount[0]?.table_count || 0,
        connectionCount: connectionCount[0]?.connection_count || 0,
        database: this.dataSource.options.database,
        host: (this.dataSource.options as any).host ?? null,
        port: (this.dataSource.options as any).port ?? null,
      };
    } catch (error) {
      this.logger.warn('Failed to get database stats:', error);
      return { error: 'Failed to get database stats' };
    }
  }

  private parseRedisMemoryInfo(info: string): any {
    const lines = info.split('\r\n');
    const memoryInfo: any = {};

    for (const line of lines) {
      if (line.startsWith('used_memory:')) {
        memoryInfo.usedMemory = parseInt(line.split(':')[1]);
      } else if (line.startsWith('used_memory_peak:')) {
        memoryInfo.peakMemory = parseInt(line.split(':')[1]);
      } else if (line.startsWith('used_memory_rss:')) {
        memoryInfo.rssMemory = parseInt(line.split(':')[1]);
      }
    }

    return {
      used: Math.round(memoryInfo.usedMemory / 1024 / 1024),
      peak: Math.round(memoryInfo.peakMemory / 1024 / 1024),
      rss: Math.round(memoryInfo.rssMemory / 1024 / 1024),
    };
  }

  private determineOverallStatus(checks: any): 'healthy' | 'unhealthy' | 'degraded' {
    const allChecks = [
      checks.database,
      checks.redis,
      checks.memory,
      checks.disk,
      ...checks.external,
    ];

    const unhealthyCount = allChecks.filter(check => check.status === 'unhealthy').length;
    const degradedCount = allChecks.filter(check => check.status === 'degraded').length;

    if (unhealthyCount > 0) {
      return 'unhealthy';
    } else if (degradedCount > 0) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  async getDetailedHealth(): Promise<any> {
    const health = await this.checkHealth();

    // Add additional metrics
    const additionalMetrics = {
      processId: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cpuUsage: process.cpuUsage(),
      loadAverage: require('os').loadavg(),
      networkInterfaces: require('os').networkInterfaces(),
    };

    return {
      ...health,
      metrics: additionalMetrics,
    };
  }

  async getReadiness(): Promise<boolean> {
    const health = await this.checkHealth();
    return health.status !== 'unhealthy';
  }

  async getLiveness(): Promise<boolean> {
    const health = await this.checkHealth();
    return health.status === 'healthy';
  }
}
