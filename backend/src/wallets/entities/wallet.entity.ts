import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { Currency } from '../../transactions/entities/transaction.entity';
import { User } from '../../users/entities/user.entity';

export enum WalletStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
}

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  walletId: string;

  @Column({
    type: 'enum',
    enum: WalletStatus,
    default: WalletStatus.ACTIVE,
  })
  status: WalletStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.THB,
  })
  currency: Currency;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pendingBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalInflow: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalOutflow: number;

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    autoSettlement: boolean;
    minSettlementAmount: number;
    maxDailyWithdrawal: number;
    notificationThreshold: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  lastTransactionAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => Merchant, (merchant) => merchant.wallet)
  @JoinColumn()
  merchant: Merchant;

  @OneToOne(() => User, (user) => user.wallet)
  @JoinColumn()
  user: User;
}
