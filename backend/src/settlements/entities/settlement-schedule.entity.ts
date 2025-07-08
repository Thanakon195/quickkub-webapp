import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SettlementSchedule {
  @PrimaryGeneratedColumn()
  id: number;
}
