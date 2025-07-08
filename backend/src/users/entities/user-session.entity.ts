import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserSession {
  @PrimaryGeneratedColumn()
  id: number;
}
