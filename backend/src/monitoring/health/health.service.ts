import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import * as redis from 'redis';
import { DataSource } from 'typeorm';

export interface HealthCheck {
  name: string;
  status: 'ok' | 'error';
  message?: string;
  responseTime?: number;
}

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: HealthCheck;
    redis: HealthCheck;
    storage: HealthCheck;
  };
  checks: HealthCheck[];
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async checkHealth(): Promise<HealthStatus> {
    const startTime = Date.now();
    const checks: HealthCheck[] = [];

    // Check database
    const dbCheck = await this.checkDatabase();
    checks.push(dbCheck);

    // Check Redis
    const redisCheck = await this.checkRedis();
    checks.push(redisCheck);

    // Check storage
    const storageCheck = await this.checkStorage();
    checks.push(storageCheck);

    // Check application metrics
    const appCheck = await this.checkApplication();
    checks.push(appCheck);

    const overallStatus = checks.every(check => check.status === 'ok') ? 'ok' : 'error';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbCheck,
        redis: redisCheck,
        storage: storageCheck,
      },
      checks,
    };
  }

  async checkReadiness(): Promise<{ ready: boolean; checks: HealthCheck[] }> {
    const checks = await this.checkHealth();
    const ready = checks.status === 'ok';

    return {
      ready,
      checks: checks.checks,
    };
  }

  async checkLiveness(): Promise<{ alive: boolean; checks: HealthCheck[] }> {
    const checks = await this.checkHealth();
    const alive = checks.status === 'ok';

    return {
      alive,
      checks: checks.checks,
    };
  }

  async getMetrics(): Promise<any> {
    const health = await this.checkHealth();

    return {
      system: {
        uptime: health.uptime,
        version: health.version,
        environment: health.environment,
      },
      services: {
        database: {
          status: health.services.database.status,
          responseTime: health.services.database.responseTime,
        },
        redis: {
          status: health.services.redis.status,
          responseTime: health.services.redis.responseTime,
        },
        storage: {
          status: health.services.storage.status,
          responseTime: health.services.storage.responseTime,
        },
      },
      performance: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
    };
  }

  private async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      await this.dataSource.query('SELECT 1');
      const responseTime = Date.now() - startTime;

      return {
        name: 'database',
        status: 'ok',
        message: 'Database connection is healthy',
        responseTime,
      };
    } catch (error) {
      this.logger.error('Database health check failed:', error);

      return {
        name: 'database',
        status: 'error',
        message: error.message,
        responseTime: Date.now() - startTime,
      };
    }
  }

  private async checkRedis(): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      const client = redis.createClient({ url: redisUrl });

      await client.connect();
      await client.ping();
      await client.disconnect();

      const responseTime = Date.now() - startTime;

      return {
        name: 'redis',
        status: 'ok',
        message: 'Redis connection is healthy',
        responseTime,
      };
    } catch (error) {
      this.logger.error('Redis health check failed:', error);

      return {
        name: 'redis',
        status: 'error',
        message: error.message,
        responseTime: Date.now() - startTime,
      };
    }
  }

  private async checkStorage(): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      // Check if S3/MinIO is accessible
      const s3Endpoint = process.env.S3_ENDPOINT;
      const s3AccessKey = process.env.S3_ACCESS_KEY;

      if (!s3Endpoint || !s3AccessKey) {
        return {
          name: 'storage',
          status: 'error',
          message: 'Storage configuration is missing',
          responseTime: Date.now() - startTime,
        };
      }

      // Simple connectivity check
      const response = await fetch(`${s3Endpoint}/health`);

      if (response.ok) {
        return {
          name: 'storage',
          status: 'ok',
          message: 'Storage service is healthy',
          responseTime: Date.now() - startTime,
        };
      } else {
        throw new Error(`Storage service returned status ${response.status}`);
      }
    } catch (error) {
      this.logger.error('Storage health check failed:', error);

      return {
        name: 'storage',
        status: 'error',
        message: error.message,
        responseTime: Date.now() - startTime,
      };
    }
  }

  private async checkApplication(): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      // Check application-specific health indicators
      const memoryUsage = process.memoryUsage();
      const heapUsed = memoryUsage.heapUsed / 1024 / 1024; // MB

      if (heapUsed > 1024) { // More than 1GB
        return {
          name: 'application',
          status: 'error',
          message: `High memory usage: ${heapUsed.toFixed(2)}MB`,
          responseTime: Date.now() - startTime,
        };
      }

      return {
        name: 'application',
        status: 'ok',
        message: 'Application is healthy',
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error('Application health check failed:', error);

      return {
        name: 'application',
        status: 'error',
        message: error.message,
        responseTime: Date.now() - startTime,
      };
    }
  }
}
