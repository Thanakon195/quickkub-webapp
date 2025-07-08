import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class FraudRule {
  @PrimaryGeneratedColumn()
  id: number;
}
