import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Order } from '../../payments/entities/order.entity';
import { ThaiPaymentMethod } from '../../payments/entities/thai-payment-method.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { User } from '../../users/entities/user.entity';
import { Wallet } from '../../wallets/entities/wallet.entity';

export enum MerchantTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
}

export enum MerchantStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}

export enum KYCStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('merchants')
export class Merchant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  businessName: string;

  @Column({ unique: true })
  merchantId: string;

  @Column({ nullable: true })
  businessDescription: string;

  @Column()
  website: string;

  @Column({ nullable: true })
  logo: string;

  @Column({
    type: 'enum',
    enum: MerchantTier,
    default: MerchantTier.BRONZE,
  })
  tier: MerchantTier;

  @Column({
    type: 'enum',
    enum: MerchantStatus,
    default: MerchantStatus.PENDING,
  })
  status: MerchantStatus;

  @Column({
    type: 'enum',
    enum: KYCStatus,
    default: KYCStatus.PENDING,
  })
  kycStatus: KYCStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 3.5 })
  feePercentage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  dailyTransactionLimit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monthlyTransactionLimit: number;

  @Column({ nullable: true })
  apiKey: string;

  @Column({ nullable: true })
  apiSecret: string;

  @Column({ nullable: true })
  webhookUrl: string;

  @Column({ nullable: true })
  webhookSecret: string;

  @Column({ type: 'jsonb', nullable: true })
  kycDocuments: {
    businessRegistration?: string;
    taxId?: string;
    bankStatement?: string;
    idCard?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  contactInfo: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    swiftCode?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    autoSettlement: boolean;
    settlementSchedule: string;
    notificationEmail: string;
    notificationPhone: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.merchants)
  user: User;

  @OneToMany(() => Transaction, (transaction) => transaction.merchant)
  transactions: Transaction[];

  @OneToOne(() => Wallet, (wallet) => wallet.merchant)
  wallet: Wallet;

  @OneToMany(() => ThaiPaymentMethod, (thaiPaymentMethod) => thaiPaymentMethod.merchant)
  thaiPaymentMethods: ThaiPaymentMethod[];

  @OneToMany(() => Order, (order) => order.merchant)
  orders: Order[];
}
