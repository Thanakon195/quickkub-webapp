import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PaymentGateway {
  @PrimaryGeneratedColumn()
  id: number;
}
