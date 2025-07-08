import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class FraudAlert {
  @PrimaryGeneratedColumn()
  id: number;
}
