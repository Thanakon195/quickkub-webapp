import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TransactionStatus {
  @PrimaryGeneratedColumn()
  id: number;
}
