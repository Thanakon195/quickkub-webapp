import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { Order } from '../../payments/entities/order.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { ThaiPaymentMethod } from '../../payments/entities/thai-payment-method.entity';
import { User } from '../../users/entities/user.entity';

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum TransactionType {
  PAYMENT = 'payment',
  REFUND = 'refund',
  WITHDRAWAL = 'withdrawal',
  DEPOSIT = 'deposit',
  TRANSFER = 'transfer',
}

export enum Currency {
  THB = 'THB',
  USD = 'USD',
  USDT = 'USDT',
  BTC = 'BTC',
  ETH = 'ETH',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  transactionId: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.PAYMENT,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.THB,
  })
  currency: Currency;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  fee: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  netAmount: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  reference: string;

  @Column({ nullable: true })
  customerEmail: string;

  @Column({ nullable: true })
  customerPhone: string;

  @Column({ nullable: true })
  customerName: string;

  @Column({ type: 'jsonb', nullable: true })
  paymentMethod: {
    type: string;
    provider: string;
    accountId?: string;
    cardLast4?: string;
  };

  @Column({ type: 'uuid', nullable: true })
  thaiPaymentMethodId: string;

  @Column({ type: 'uuid', nullable: true })
  orderId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  failureReason: string;

  @Column({ nullable: true })
  processedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.transactions)
  user: User;

  @ManyToOne(() => Merchant, (merchant) => merchant.transactions)
  merchant: Merchant;

  @OneToMany(() => Payment, (payment) => payment.transaction)
  payments: Payment[];

  @ManyToOne(() => ThaiPaymentMethod, (thaiPaymentMethod) => thaiPaymentMethod.transactions)
  thaiPaymentMethod: ThaiPaymentMethod;

  @ManyToOne(() => Order, (order) => order.transactions)
  order: Order;
}
