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

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  EXPIRED = 'expired'
}

export enum OrderType {
  ECOMMERCE = 'ecommerce',
  SUBSCRIPTION = 'subscription',
  DONATION = 'donation',
  SERVICE = 'service',
  DIGITAL = 'digital'
}

@Entity('orders')
@Index(['merchantId', 'orderNumber'])
@Index(['status', 'createdAt'])
@Index(['customerEmail', 'merchantId'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  merchantId: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  orderNumber: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: OrderType,
    default: OrderType.ECOMMERCE
  })
  type: OrderType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  shipping: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total: number;

  @Column({ type: 'varchar', length: 3, default: 'THB' })
  currency: string;

  // Customer Information
  @Column({ type: 'varchar', length: 255 })
  customerName: string;

  @Column({ type: 'varchar', length: 255 })
  customerEmail: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  customerPhone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customerId: string;

  // Shipping Information
  @Column({ type: 'jsonb', nullable: true })
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };

  // Billing Information
  @Column({ type: 'jsonb', nullable: true })
  billingAddress: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    taxId?: string;
  };

  // Order Items
  @Column({ type: 'jsonb' })
  items: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    description?: string;
    image?: string;
    metadata?: Record<string, any>;
  }>;

  // Payment Information
  @Column({ type: 'jsonb', nullable: true })
  paymentInfo: {
    method: string;
    provider: string;
    transactionId?: string;
    paidAt?: Date;
    paymentUrl?: string;
    qrCode?: string;
  };

  // Thai-specific fields
  @Column({ type: 'boolean', default: false })
  requiresTaxInvoice: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  taxId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  companyName: string;

  @Column({ type: 'jsonb', nullable: true })
  thaiSpecific: {
    promptPayId?: string;
    bankTransferInfo?: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
    installmentPlan?: {
      enabled: boolean;
      terms: number[];
      selectedTerm?: number;
    };
  };

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    source?: string;
    campaign?: string;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
    [key: string]: any;
  };

  // Timestamps
  @Column({ type: 'timestamp', nullable: true })
  confirmedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Merchant, merchant => merchant.orders)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @OneToMany(() => Transaction, transaction => transaction.order)
  transactions: Transaction[];
}
