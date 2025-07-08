import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class WalletBalance {
  @PrimaryGeneratedColumn()
  id: number;
}
