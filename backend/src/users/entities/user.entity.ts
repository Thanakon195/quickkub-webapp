import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Order } from '../../transactions/entities/order.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Wallet } from '../../wallets/entities/wallet.entity';

export enum UserRole {
  ADMIN = 'admin',
  MERCHANT = 'merchant',
  CUSTOMER = 'customer',
  SUPPORT = 'support',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['status'])
@Index(['createdAt'])
export class User {
  @ApiProperty({ description: 'Unique identifier for the user' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User email address' })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @ApiProperty({ description: 'Hashed user password' })
  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @ApiProperty({ description: 'User first name' })
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @ApiProperty({ description: 'User phone number' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @ApiProperty({ description: 'User role in the system', enum: UserRole })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MERCHANT,
  })
  role: UserRole;

  @ApiProperty({ description: 'User account status', enum: UserStatus })
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;

  @ApiProperty({ description: 'Whether email is verified' })
  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @ApiProperty({ description: 'Whether phone is verified' })
  @Column({ type: 'boolean', default: false })
  phoneVerified: boolean;

  @ApiProperty({ description: 'Whether two-factor authentication is enabled' })
  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @ApiProperty({ description: 'Two-factor authentication secret' })
  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  twoFactorSecret: string;

  @ApiProperty({ description: 'Last login timestamp' })
  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @ApiProperty({ description: 'Email verification token' })
  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  emailVerificationToken: string;

  @ApiProperty({ description: 'Password reset token' })
  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordResetToken: string;

  @ApiProperty({ description: 'Password reset token expiry' })
  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires: Date;

  @ApiProperty({ description: 'User metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'User preferences' })
  @Column({ type: 'jsonb', nullable: true })
  preferences: Record<string, any>;

  @ApiProperty({ description: 'Account creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual properties
  @ApiProperty({ description: 'Full name of the user' })
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @ApiProperty({ description: 'Whether user is active' })
  get isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  @ApiProperty({ description: 'Whether user is verified' })
  get isVerified(): boolean {
    return this.emailVerified && this.phoneVerified;
  }

  // Relationships
  @OneToMany(() => Merchant, (merchant) => merchant.user)
  merchants: Merchant[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Payment, (payment) => payment.customer)
  payments: Payment[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  wallet: Wallet;

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];
}
