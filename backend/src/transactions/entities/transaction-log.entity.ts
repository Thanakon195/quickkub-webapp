import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TransactionLog {
  @PrimaryGeneratedColumn()
  id: number;
}
