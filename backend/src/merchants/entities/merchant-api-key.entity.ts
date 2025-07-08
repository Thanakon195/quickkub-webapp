import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MerchantApiKey {
  @PrimaryGeneratedColumn()
  id: number;
}
