import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MerchantSettings {
  @PrimaryGeneratedColumn()
  id: number;
}
