import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Settlement } from '../settlements/entities/settlement.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { User } from '../users/entities/user.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import { Webhook } from '../webhooks/entities/webhook.entity';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USERNAME', 'quickkub_user'),
  password: configService.get('DB_PASSWORD', 'quickkub_password'),
  database: configService.get('DB_NAME', 'quickkub_db'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('LOG_SQL_QUERIES', false),
  ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
  extra: {
    connectionLimit: configService.get('DB_POOL_MAX', 20),
    acquireTimeout: 60000,
    timeout: 60000,
  },
});

// DataSource สำหรับ TypeORM CLI
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'quickkub_user',
  password: process.env.DB_PASSWORD || 'quickkub_password',
  database: process.env.DB_NAME || 'quickkub_db',
  entities: [User, Merchant, Transaction, Payment, Wallet, Invoice, Webhook, Settlement],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: false,
});
