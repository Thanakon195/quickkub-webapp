import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { Currency, Transaction } from '../../transactions/entities/transaction.entity';

export enum SettlementStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum SettlementType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  MANUAL = 'manual',
}

@Entity('settlements')
export class Settlement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  settlementId: string;

  @Column({
    type: 'enum',
    enum: SettlementStatus,
    default: SettlementStatus.PENDING,
  })
  status: SettlementStatus;

  @Column({
    type: 'enum',
    enum: SettlementType,
    default: SettlementType.DAILY,
  })
  type: SettlementType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.THB,
  })
  currency: Currency;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  fee: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  netAmount: number;

  @Column({ type: 'int', default: 0 })
  transactionCount: number;

  @Column({ nullable: true })
  bankReference: string;

  @Column({ nullable: true })
  externalReference: string;

  @Column({ type: 'jsonb', nullable: true })
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    swiftCode?: string;
  };

  @Column({ nullable: true })
  processedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  failureReason: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Merchant, (merchant) => merchant.transactions)
  merchant: Merchant;

  @OneToMany(() => Transaction, (transaction) => transaction.merchant)
  transactions: Transaction[];
}
