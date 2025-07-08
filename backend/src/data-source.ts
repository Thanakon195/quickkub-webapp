import { DataSource } from 'typeorm';
import { Invoice } from './invoices/entities/invoice.entity';
import { Merchant } from './merchants/entities/merchant.entity';
import { Payment } from './payments/entities/payment.entity';
import { SettlementAuditLog } from './settlements/entities/settlement-audit-log.entity';
import { Settlement } from './settlements/entities/settlement.entity';
import { Transaction } from './transactions/entities/transaction.entity';
import { User } from './users/entities/user.entity';
import { Wallet } from './wallets/entities/wallet.entity';
import { Webhook } from './webhooks/entities/webhook.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'quickkub_user',
  password: process.env.DB_PASSWORD || 'quickkub_password',
  database: process.env.DB_NAME || 'quickkub_db',
  entities: [User, Merchant, Transaction, Payment, Wallet, Invoice, Webhook, Settlement, SettlementAuditLog],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: false,
});
