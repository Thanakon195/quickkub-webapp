// ========================================
// 🗄️ DATABASE ENTITIES EXPORT
// ========================================

// User Management
export { UserProfile } from '../../users/entities/user-profile.entity';
export { UserSession } from '../../users/entities/user-session.entity';
export { User } from '../../users/entities/user.entity';

// Merchant Management
export { MerchantApiKey } from '../../merchants/entities/merchant-api-key.entity';
export { MerchantProfile } from '../../merchants/entities/merchant-profile.entity';
export { MerchantSettings } from '../../merchants/entities/merchant-settings.entity';
export { Merchant } from '../../merchants/entities/merchant.entity';

// Payment Processing
export { PaymentGateway } from '../../payments/entities/payment-gateway.entity';
export { PaymentMethod } from '../../payments/entities/payment-method.entity';
export { PaymentProcessor } from '../../payments/entities/payment-processor.entity';
export { Payment } from '../../payments/entities/payment.entity';

// Transaction Management
export { TransactionLog } from '../../transactions/entities/transaction-log.entity';
export { TransactionStatus } from '../../transactions/entities/transaction-status.entity';
export { Transaction } from '../../transactions/entities/transaction.entity';

// Wallet Management
export { WalletBalance } from '../../wallets/entities/wallet-balance.entity';
export { WalletTransaction } from '../../wallets/entities/wallet-transaction.entity';
export { Wallet } from '../../wallets/entities/wallet.entity';

// Invoice Management
export { InvoiceItem } from '../../invoices/entities/invoice-item.entity';
export { InvoiceTemplate } from '../../invoices/entities/invoice-template.entity';
export { Invoice } from '../../invoices/entities/invoice.entity';

// Webhook Management
export { WebhookDelivery } from '../../webhooks/entities/webhook-delivery.entity';
export { WebhookEvent } from '../../webhooks/entities/webhook-event.entity';
export { Webhook } from '../../webhooks/entities/webhook.entity';

// Settlement Management
export { SettlementBatch } from '../../settlements/entities/settlement-batch.entity';
export { SettlementSchedule } from '../../settlements/entities/settlement-schedule.entity';
export { Settlement } from '../../settlements/entities/settlement.entity';

// Fraud Detection
export { FraudAlert } from '../../fraud/entities/fraud-alert.entity';
export { FraudRule } from '../../fraud/entities/fraud-rule.entity';
export { FraudScore } from '../../fraud/entities/fraud-score.entity';

// Reporting
export { ReportSchedule } from '../../reports/entities/report-schedule.entity';
export { ReportTemplate } from '../../reports/entities/report-template.entity';
export { Report } from '../../reports/entities/report.entity';

// Notifications
export { NotificationChannel } from '../../notifications/entities/notification-channel.entity';
export { NotificationTemplate } from '../../notifications/entities/notification-template.entity';
export { Notification } from '../../notifications/entities/notification.entity';

// Admin Management
export { AdminPermission } from '../../admin/entities/admin-permission.entity';
export { AdminRole } from '../../admin/entities/admin-role.entity';
export { Admin } from '../../admin/entities/admin.entity';
export { AuditLog } from '../../admin/entities/audit-log.entity';
