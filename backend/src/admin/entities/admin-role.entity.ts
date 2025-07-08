import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AdminRole {
  @PrimaryGeneratedColumn()
  id: number;
}
