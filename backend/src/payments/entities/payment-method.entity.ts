import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PaymentMethod {
  @PrimaryGeneratedColumn()
  id: number;
}
