import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class FraudScore {
  @PrimaryGeneratedColumn()
  id: number;
}
