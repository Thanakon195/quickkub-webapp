import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

export enum ThaiPaymentMethodType {
  PROMPTPAY = 'promptpay',
  KBANK = 'kbank',
  SCB_EASY = 'scb_easy',
  TRUEMONEY = 'truemoney',
  GBPRIMEPAY = 'gbprimepay',
  BBL = 'bbl',
  OMISE = 'omise',
  C2C2P = '2c2p'
}

export enum ThaiPaymentMethodStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_APPROVAL = 'pending_approval'
}

@Entity('thai_payment_methods')
@Index(['merchantId', 'type'])
@Index(['type', 'status'])
export class ThaiPaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  merchantId: string;

  @Column({
    type: 'enum',
    enum: ThaiPaymentMethodType,
    comment: 'ประเภทของ payment method'
  })
  type: ThaiPaymentMethodType;

  @Column({
    type: 'enum',
    enum: ThaiPaymentMethodStatus,
    default: ThaiPaymentMethodStatus.PENDING_APPROVAL
  })
  status: ThaiPaymentMethodStatus;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  config: {
    apiKey?: string;
    secretKey?: string;
    merchantId?: string;
    terminalId?: string;
    callbackUrl?: string;
    webhookUrl?: string;
    sandbox?: boolean;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  limits: {
    minAmount: number;
    maxAmount: number;
    dailyLimit: number;
    monthlyLimit: number;
    currency: string;
  };

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  feePercentage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  feeFixed: number;

  @Column({ type: 'boolean', default: true })
  isEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    logo?: string;
    icon?: string;
    color?: string;
    supportedCurrencies?: string[];
    processingTime?: string;
    [key: string]: any;
  };

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalVolume: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Merchant, merchant => merchant.thaiPaymentMethods)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @OneToMany(() => Transaction, transaction => transaction.thaiPaymentMethod)
  transactions: Transaction[];
}
