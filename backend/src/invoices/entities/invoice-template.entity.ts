import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class InvoiceTemplate {
  @PrimaryGeneratedColumn()
  id: number;
}
