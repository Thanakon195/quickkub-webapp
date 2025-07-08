import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { User } from '../../users/entities/user.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum PaymentProvider {
  STRIPE = 'stripe',
  OMISE = 'omise',
  GBPRIMEPAY = 'gbprimepay',
  PROMPTPAY = 'promptpay',
  TRUEMONEY = 'truemoney',
  LINEPAY = 'linepay',
  BINANCEPAY = 'binancepay',
  BITKUB = 'bitkub',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  PROMPTPAY = 'promptpay',
  TRUEMONEY = 'truemoney',
  LINEPAY = 'linepay',
  CRYPTO = 'crypto',
  CASH = 'cash',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  paymentId: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentProvider,
  })
  provider: PaymentProvider;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  method: PaymentMethod;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  externalPaymentId: string;

  @Column({ nullable: true })
  paymentUrl: string;

  @Column({ nullable: true })
  qrCode: string;

  @Column({ nullable: true })
  receiptUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  providerResponse: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  failureReason: string;

  @Column({ nullable: true })
  failureCode: string;

  @Column({ nullable: true })
  processedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  expiredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Transaction, (transaction) => transaction.payments)
  transaction: Transaction;

  @ManyToOne(() => User, (user) => user.payments)
  customer: User;
}
