import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';

export enum WebhookStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  RETRY = 'retry',
}

export enum WebhookEvent {
  PAYMENT_SUCCESS = 'payment.success',
  PAYMENT_FAILED = 'payment.failed',
  TRANSACTION_COMPLETED = 'transaction.completed',
  INVOICE_PAID = 'invoice.paid',
  SETTLEMENT_PROCESSED = 'settlement.processed',
}

@Entity('webhooks')
export class Webhook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column({
    type: 'enum',
    enum: WebhookEvent,
  })
  event: WebhookEvent;

  @Column({
    type: 'enum',
    enum: WebhookStatus,
    default: WebhookStatus.PENDING,
  })
  status: WebhookStatus;

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  headers: Record<string, string>;

  @Column({ nullable: true })
  signature: string;

  @Column({ default: 0 })
  retryCount: number;

  @Column({ default: 5 })
  maxRetries: number;

  @Column({ nullable: true })
  lastAttemptAt: Date;

  @Column({ nullable: true })
  nextRetryAt: Date;

  @Column({ nullable: true })
  responseCode: number;

  @Column({ nullable: true })
  responseBody: string;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Merchant, (merchant) => merchant.transactions)
  merchant: Merchant;
}
