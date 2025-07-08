import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { Currency, Transaction } from '../../transactions/entities/transaction.entity';

export enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  invoiceNumber: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  status: InvoiceStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.THB,
  })
  currency: Currency;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({ nullable: true })
  customerName: string;

  @Column({ nullable: true })
  customerEmail: string;

  @Column({ nullable: true })
  customerPhone: string;

  @Column({ type: 'jsonb', nullable: true })
  billingAddress: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  items: Array<{
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  paidAt: Date;

  @Column({ nullable: true })
  paymentUrl: string;

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
