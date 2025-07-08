import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Settlement } from './settlement.entity';

@Entity('settlement_audit_logs')
export class SettlementAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Settlement, { nullable: false })
  settlement: Settlement;

  @Column()
  action: string; // เช่น status_change, notification

  @Column({ nullable: true })
  by: string; // admin, system, etc.

  @Column({ type: 'jsonb', nullable: true })
  detail: any;

  @CreateDateColumn()
  createdAt: Date;
}
