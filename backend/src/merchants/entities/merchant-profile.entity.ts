import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MerchantProfile {
  @PrimaryGeneratedColumn()
  id: number;
}
