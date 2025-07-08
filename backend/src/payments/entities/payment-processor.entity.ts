import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PaymentProcessor {
  @PrimaryGeneratedColumn()
  id: number;
}
