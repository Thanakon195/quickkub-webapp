import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;
}
