import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AuditService } from './admin/services/audit.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { getDatabaseConfig } from './config/database.config';
import { getBullConfig, getRedisConfig } from './config/redis.config';
import { FraudModule } from './fraud/fraud.module';
import { InvoicesModule } from './invoices/invoices.module';
import { MerchantsModule } from './merchants/merchants.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EmailService } from './notifications/services/email.service';
import { PaymentsModule } from './payments/payments.module';
import { ReportsModule } from './reports/reports.module';
import { SettlementsModule } from './settlements/settlements.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get('RATE_LIMIT_WINDOW_MS', 900000),
            limit: configService.get('RATE_LIMIT_MAX_REQUESTS', 100),
          },
        ],
      }),
      inject: [ConfigService],
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // Event emitter
    EventEmitterModule.forRoot(),

    // Cache
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: require('cache-manager-redis-store'),
        ...getRedisConfig(configService),
      }),
      inject: [ConfigService],
    }),

    // Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getBullConfig(configService),
      inject: [ConfigService],
    }),

    // Core modules
    CommonModule,
    AuthModule,
    UsersModule,
    MerchantsModule,
    PaymentsModule,
    TransactionsModule,
    InvoicesModule,
    WebhooksModule,
    WalletsModule,
    SettlementsModule,
    FraudModule,
    ReportsModule,
    NotificationsModule,
    AdminModule,

    // Feature modules will be imported here
    // AuthModule,
    // MerchantModule,
    // PaymentModule,
    // InvoiceModule,
    // WebhookModule,
    // AdminModule,
    // NotificationModule,
    // WalletModule,
    // SettlementModule,
    // FraudModule,
    // ReportModule,
  ],
  controllers: [AppController],
  providers: [AppService, EmailService, AuditService],
})
export class AppModule {}
