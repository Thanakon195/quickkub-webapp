import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SettlementBatch {
  @PrimaryGeneratedColumn()
  id: number;
}
