import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { User } from '../../users/entities/user.entity';
import { Transaction } from './transaction.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  EXPIRED = 'expired',
}

export enum OrderType {
  PHYSICAL = 'physical',
  DIGITAL = 'digital',
  SERVICE = 'service',
  SUBSCRIPTION = 'subscription',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderId: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: OrderType,
    default: OrderType.PHYSICAL,
  })
  type: OrderType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  shippingAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  vatAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  withholdingTaxAmount: number;

  @Column({ default: 'THB' })
  currency: string;

  @Column({ type: 'jsonb' })
  items: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    taxRate: number;
    vatRate: number;
    metadata?: Record<string, any>;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  billingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    taxId?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    shippingMethod?: string;
    trackingNumber?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    source?: string;
    campaign?: string;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
    customFields?: Record<string, any>;
  };

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ nullable: true })
  confirmedAt: Date;

  @Column({ nullable: true })
  shippedAt: Date;

  @Column({ nullable: true })
  deliveredAt: Date;

  @Column({ nullable: true })
  cancelledAt: Date;

  @Column({ nullable: true })
  refundedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.orders)
  customer: User;

  @ManyToOne(() => Merchant, (merchant) => merchant.orders)
  merchant: Merchant;

  @OneToMany(() => Transaction, (transaction) => transaction.order)
  transactions: Transaction[];
}
