import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class WalletTransaction {
  @PrimaryGeneratedColumn()
  id: number;
}
