import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class InvoiceItem {
  @PrimaryGeneratedColumn()
  id: number;
}
